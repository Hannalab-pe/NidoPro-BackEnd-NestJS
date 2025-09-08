import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CajaSimple } from './entities/caja-simple.entity';
import { CreateCajaSimpleDto } from './dto/create-caja-simple.dto';
import { UpdateCajaSimpleDto, AnularCajaSimpleDto } from './dto/update-caja-simple.dto';
import {
    CrearIngresoPorPensionDto,
    CrearIngresoPorMatriculaDto,
    CrearEgresoPorPlanillaDto
} from './dto/crear-movimientos.dto';

@Injectable()
export class CajaSimpleService {
    constructor(
        @InjectRepository(CajaSimple)
        private cajaSimpleRepository: Repository<CajaSimple>,
    ) { }

    async create(createCajaSimpleDto: CreateCajaSimpleDto): Promise<CajaSimple> {
        // Generar número de transacción automático si no se proporciona
        if (!createCajaSimpleDto.numeroTransaccion) {
            createCajaSimpleDto.numeroTransaccion = await this.generarNumeroTransaccion();
        }

        // Validar categorías según el tipo de movimiento
        this.validarCategoriaSegunTipo(createCajaSimpleDto);

        const movimiento = this.cajaSimpleRepository.create(createCajaSimpleDto);
        return await this.cajaSimpleRepository.save(movimiento);
    }

    async findAll(
        tipo?: string,
        categoria?: string,
        fechaInicio?: Date,
        fechaFin?: Date,
        estado?: string,
    ): Promise<CajaSimple[]> {
        const query = this.cajaSimpleRepository
            .createQueryBuilder('caja')
            .leftJoinAndSelect('caja.estudiante', 'estudiante')
            .leftJoinAndSelect('caja.trabajadorBeneficiario', 'trabajadorBeneficiario')
            .leftJoinAndSelect('caja.registradoPorTrabajador', 'registradoPor')
            .orderBy('caja.fecha', 'DESC')
            .addOrderBy('caja.hora', 'DESC');

        if (tipo) {
            query.andWhere('caja.tipo = :tipo', { tipo });
        }

        if (categoria) {
            query.andWhere('caja.categoria = :categoria', { categoria });
        }

        if (fechaInicio) {
            query.andWhere('caja.fecha >= :fechaInicio', { fechaInicio });
        }

        if (fechaFin) {
            query.andWhere('caja.fecha <= :fechaFin', { fechaFin });
        }

        if (estado) {
            query.andWhere('caja.estado = :estado', { estado });
        } else {
            // Por defecto, no mostrar movimientos anulados
            query.andWhere('caja.estado != :anulado', { anulado: 'ANULADO' });
        }

        return await query.getMany();
    }

    async findOne(id: string): Promise<CajaSimple> {
        const movimiento = await this.cajaSimpleRepository.findOne({
            where: { idMovimiento: id },
            relations: [
                'estudiante',
                'trabajadorBeneficiario',
                'registradoPorTrabajador',
                'anuladoPorTrabajador',
            ],
        });

        if (!movimiento) {
            throw new NotFoundException(`Movimiento con ID ${id} no encontrado`);
        }

        return movimiento;
    }

    async update(id: string, updateCajaSimpleDto: UpdateCajaSimpleDto): Promise<CajaSimple> {
        const movimiento = await this.findOne(id);

        if (movimiento.estado === 'ANULADO') {
            throw new BadRequestException('No se puede modificar un movimiento anulado');
        }

        Object.assign(movimiento, updateCajaSimpleDto);
        return await this.cajaSimpleRepository.save(movimiento);
    }

    async anular(id: string, anularDto: AnularCajaSimpleDto): Promise<CajaSimple> {
        const movimiento = await this.findOne(id);

        if (movimiento.estado === 'ANULADO') {
            throw new BadRequestException('El movimiento ya está anulado');
        }

        movimiento.estado = 'ANULADO';
        movimiento.anuladoEn = new Date();
        movimiento.anuladoPor = anularDto.anuladoPor;
        movimiento.motivoAnulacion = anularDto.motivoAnulacion;

        return await this.cajaSimpleRepository.save(movimiento);
    }

    async remove(id: string): Promise<void> {
        const movimiento = await this.findOne(id);
        await this.cajaSimpleRepository.remove(movimiento);
    }

    // Métodos para reportes
    async getSaldoActual(): Promise<{ saldo: number; ingresos: number; egresos: number }> {
        const result = await this.cajaSimpleRepository
            .createQueryBuilder('caja')
            .select([
                'SUM(CASE WHEN caja.tipo = \'INGRESO\' THEN caja.monto ELSE 0 END) as ingresos',
                'SUM(CASE WHEN caja.tipo = \'EGRESO\' THEN caja.monto ELSE 0 END) as egresos',
            ])
            .where('caja.estado = :estado', { estado: 'CONFIRMADO' })
            .getRawOne();

        const ingresos = parseFloat(result.ingresos) || 0;
        const egresos = parseFloat(result.egresos) || 0;
        const saldo = ingresos - egresos;

        return { saldo, ingresos, egresos };
    }

    async getMovimientosPorCategoria(
        fechaInicio?: Date,
        fechaFin?: Date,
    ): Promise<any[]> {
        const query = this.cajaSimpleRepository
            .createQueryBuilder('caja')
            .select([
                'caja.categoria',
                'caja.tipo',
                'SUM(caja.monto) as total',
                'COUNT(*) as cantidad',
            ])
            .where('caja.estado = :estado', { estado: 'CONFIRMADO' })
            .groupBy('caja.categoria, caja.tipo')
            .orderBy('total', 'DESC');

        if (fechaInicio) {
            query.andWhere('caja.fecha >= :fechaInicio', { fechaInicio });
        }

        if (fechaFin) {
            query.andWhere('caja.fecha <= :fechaFin', { fechaFin });
        }

        return await query.getRawMany();
    }

    // =================== MÉTODOS ADICIONALES PARA TRAZABILIDAD Y REPORTES ===================

    /**
     * Genera un número de transacción único basado en fecha y tiempo
     */
    private async generarNumeroTransaccion(): Promise<string> {
        const fecha = new Date();
        const fechaStr = fecha.toISOString().slice(0, 10).replace(/-/g, '');
        const tiempo = Date.now().toString().slice(-6);
        return `CS-${fechaStr}-${tiempo}`;
    }

    /**
     * Valida que la categoría sea apropiada para el tipo de movimiento
     */
    private validarCategoriaSegunTipo(dto: CreateCajaSimpleDto): void {
        const categoriasIngreso = [
            'PENSION_MENSUAL',
            'MATRICULA',
            'INGRESO_ADICIONAL',
            'MATERIAL_EDUCATIVO',
            'OTROS_INGRESOS'
        ];

        const categoriasEgreso = [
            'PAGO_PLANILLA',
            'SUELDO_DOCENTE',
            'GASTOS_OPERATIVOS',
            'GASTOS_ADMINISTRATIVOS',
            'INFRAESTRUCTURA',
            'OTROS_GASTOS'
        ];

        if (dto.tipo === 'INGRESO' && !categoriasIngreso.includes(dto.categoria)) {
            throw new BadRequestException(`Categoría '${dto.categoria}' no válida para ingresos`);
        }

        if (dto.tipo === 'EGRESO' && !categoriasEgreso.includes(dto.categoria)) {
            throw new BadRequestException(`Categoría '${dto.categoria}' no válida para egresos`);
        }
    }

    /**
     * Crear ingreso por pago de pensión
     */
    async crearIngresoPorPension(data: CrearIngresoPorPensionDto): Promise<CajaSimple> {
        const createDto: CreateCajaSimpleDto = {
            tipo: 'INGRESO',
            concepto: 'Pago de Pensión Mensual',
            descripcion: data.observaciones || 'Pago de pensión estudiantil',
            monto: data.monto,
            categoria: 'PENSION_MENSUAL',
            subcategoria: 'PENSION_REGULAR',
            metodoPago: data.metodoPago,
            comprobante: data.numeroComprobante,
            idEstudiante: data.idEstudiante,
            idPensionRelacionada: data.idPensionRelacionada,
            registradoPor: data.registradoPor,
            referenciaExterna: data.numeroComprobante
        };

        return await this.create(createDto);
    }

    /**
     * Crear ingreso por matrícula
     */
    async crearIngresoPorMatricula(data: CrearIngresoPorMatriculaDto): Promise<CajaSimple> {
        const createDto: CreateCajaSimpleDto = {
            tipo: 'INGRESO',
            concepto: 'Pago de Matrícula',
            descripcion: `Matrícula período ${data.periodoEscolar || 'actual'}`,
            monto: data.monto,
            categoria: 'MATRICULA',
            subcategoria: 'MATRICULA_NUEVA',
            metodoPago: data.metodoPago,
            comprobante: data.numeroComprobante,
            idEstudiante: data.idEstudiante,
            registradoPor: data.registradoPor,
            referenciaExterna: data.numeroComprobante
        };

        return await this.create(createDto);
    }

    /**
     * Crear egreso por pago de planilla (sueldo docente)
     */
    async crearEgresoPorPlanilla(data: CrearEgresoPorPlanillaDto): Promise<CajaSimple> {
        const createDto: CreateCajaSimpleDto = {
            tipo: 'EGRESO',
            concepto: `Pago de Planilla ${data.mes}/${data.anio}`,
            descripcion: data.conceptoDetalle || `Sueldo correspondiente al mes ${data.mes} del año ${data.anio}`,
            monto: data.monto,
            categoria: 'PAGO_PLANILLA',
            subcategoria: 'SUELDO_DOCENTE',
            metodoPago: 'TRANSFERENCIA_BANCARIA',
            comprobante: data.numeroComprobante,
            idTrabajadorBeneficiario: data.idTrabajadorBeneficiario,
            registradoPor: data.registradoPor,
            referenciaExterna: `PLANILLA-${data.mes}-${data.anio}`
        };

        return await this.create(createDto);
    }

    // =================== MÉTODOS DE REPORTES ===================

    /**
     * Flujo de caja por período
     */
    async getFlujoCajaPorPeriodo(fechaInicio: Date, fechaFin: Date): Promise<any[]> {
        return await this.cajaSimpleRepository
            .createQueryBuilder('caja')
            .select([
                'DATE(caja.fecha) as fecha',
                'SUM(CASE WHEN caja.tipo = \'INGRESO\' THEN caja.monto ELSE 0 END) as ingresos',
                'SUM(CASE WHEN caja.tipo = \'EGRESO\' THEN caja.monto ELSE 0 END) as egresos',
                'SUM(CASE WHEN caja.tipo = \'INGRESO\' THEN caja.monto ELSE -caja.monto END) as saldo_neto'
            ])
            .where('caja.fecha BETWEEN :fechaInicio AND :fechaFin', { fechaInicio, fechaFin })
            .andWhere('caja.estado = :estado', { estado: 'CONFIRMADO' })
            .groupBy('DATE(caja.fecha)')
            .orderBy('fecha')
            .getRawMany();
    }

    /**
     * Reporte de ingresos por pensiones
     */
    async getIngresosPorPensiones(mes?: number, anio?: number): Promise<any> {
        const query = this.cajaSimpleRepository
            .createQueryBuilder('caja')
            .leftJoinAndSelect('caja.estudiante', 'estudiante')
            .leftJoinAndSelect('caja.pensionRelacionada', 'pension')
            .where('caja.categoria = :categoria', { categoria: 'PENSION_MENSUAL' })
            .andWhere('caja.tipo = :tipo', { tipo: 'INGRESO' })
            .andWhere('caja.estado = :estado', { estado: 'CONFIRMADO' });

        if (mes) query.andWhere('EXTRACT(MONTH FROM caja.fecha) = :mes', { mes });
        if (anio) query.andWhere('EXTRACT(YEAR FROM caja.fecha) = :anio', { anio });

        const movimientos = await query.getMany();

        // Resumen estadístico
        const resumen = await this.cajaSimpleRepository
            .createQueryBuilder('caja')
            .select([
                'COUNT(*) as total_pagos',
                'SUM(caja.monto) as total_cobrado',
                'COUNT(DISTINCT caja.id_estudiante) as estudiantes_pagaron',
                'AVG(caja.monto) as promedio_pago'
            ])
            .where('caja.categoria = :categoria', { categoria: 'PENSION_MENSUAL' })
            .andWhere('caja.tipo = :tipo', { tipo: 'INGRESO' })
            .andWhere('caja.estado = :estado', { estado: 'CONFIRMADO' })
            .getRawOne();

        if (mes) {
            const queryWithMonth = this.cajaSimpleRepository
                .createQueryBuilder('caja')
                .select([
                    'COUNT(*) as total_pagos',
                    'SUM(caja.monto) as total_cobrado',
                    'COUNT(DISTINCT caja.id_estudiante) as estudiantes_pagaron',
                    'AVG(caja.monto) as promedio_pago'
                ])
                .where('caja.categoria = :categoria', { categoria: 'PENSION_MENSUAL' })
                .andWhere('caja.tipo = :tipo', { tipo: 'INGRESO' })
                .andWhere('caja.estado = :estado', { estado: 'CONFIRMADO' })
                .andWhere('EXTRACT(MONTH FROM caja.fecha) = :mes', { mes });

            if (anio) queryWithMonth.andWhere('EXTRACT(YEAR FROM caja.fecha) = :anio', { anio });

            const resumenMes = await queryWithMonth.getRawOne();
            return { movimientos, resumen: resumenMes };
        }

        return { movimientos, resumen };
    }

    /**
     * Reporte de gastos por categoría
     */
    async getGastosPorCategoria(fechaInicio?: Date, fechaFin?: Date): Promise<any[]> {
        const query = this.cajaSimpleRepository
            .createQueryBuilder('caja')
            .select([
                'caja.categoria',
                'caja.subcategoria',
                'SUM(caja.monto) as total',
                'COUNT(*) as cantidad',
                'AVG(caja.monto) as promedio'
            ])
            .where('caja.tipo = :tipo', { tipo: 'EGRESO' })
            .andWhere('caja.estado = :estado', { estado: 'CONFIRMADO' })
            .groupBy('caja.categoria, caja.subcategoria')
            .orderBy('total', 'DESC');

        if (fechaInicio) query.andWhere('caja.fecha >= :fechaInicio', { fechaInicio });
        if (fechaFin) query.andWhere('caja.fecha <= :fechaFin', { fechaFin });

        return await query.getRawMany();
    }

    /**
     * Reporte de pagos a trabajadores (planillas)
     */
    async getPagosPorTrabajador(trabajadorId?: string, mes?: number, anio?: number): Promise<any[]> {
        const query = this.cajaSimpleRepository
            .createQueryBuilder('caja')
            .leftJoinAndSelect('caja.trabajadorBeneficiario', 'trabajador')
            .where('caja.categoria = :categoria', { categoria: 'PAGO_PLANILLA' })
            .andWhere('caja.tipo = :tipo', { tipo: 'EGRESO' })
            .andWhere('caja.estado = :estado', { estado: 'CONFIRMADO' });

        if (trabajadorId) {
            query.andWhere('caja.id_trabajador_beneficiario = :trabajadorId', { trabajadorId });
        }
        if (mes) query.andWhere('EXTRACT(MONTH FROM caja.fecha) = :mes', { mes });
        if (anio) query.andWhere('EXTRACT(YEAR FROM caja.fecha) = :anio', { anio });

        return await query
            .orderBy('caja.fecha', 'DESC')
            .getMany();
    }

    /**
     * Estado financiero por estudiante
     */
    async getEstadoFinancieroEstudiante(estudianteId: string): Promise<any> {
        const movimientos = await this.cajaSimpleRepository
            .createQueryBuilder('caja')
            .leftJoinAndSelect('caja.estudiante', 'estudiante')
            .leftJoinAndSelect('caja.pensionRelacionada', 'pension')
            .where('caja.id_estudiante = :estudianteId', { estudianteId })
            .andWhere('caja.estado != :anulado', { anulado: 'ANULADO' })
            .orderBy('caja.fecha', 'DESC')
            .getMany();

        const resumen = await this.cajaSimpleRepository
            .createQueryBuilder('caja')
            .select([
                'COUNT(*) as total_movimientos',
                'SUM(caja.monto) as total_pagado',
                'MAX(caja.fecha) as ultimo_pago',
                'MIN(caja.fecha) as primer_pago'
            ])
            .where('caja.id_estudiante = :estudianteId', { estudianteId })
            .andWhere('caja.estado = :estado', { estado: 'CONFIRMADO' })
            .getRawOne();

        return { movimientos, resumen };
    }

    /**
     * Dashboard financiero general
     */
    async getDashboardFinanciero(): Promise<any> {
        const hoy = new Date();
        const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

        // Saldo actual
        const saldoActual = await this.getSaldoActual();

        // Movimientos del día
        const movimientosHoy = await this.cajaSimpleRepository
            .createQueryBuilder('caja')
            .select([
                'COUNT(CASE WHEN caja.tipo = \'INGRESO\' THEN 1 END) as ingresos_cantidad',
                'SUM(CASE WHEN caja.tipo = \'INGRESO\' THEN caja.monto ELSE 0 END) as ingresos_monto',
                'COUNT(CASE WHEN caja.tipo = \'EGRESO\' THEN 1 END) as egresos_cantidad',
                'SUM(CASE WHEN caja.tipo = \'EGRESO\' THEN caja.monto ELSE 0 END) as egresos_monto'
            ])
            .where('DATE(caja.fecha) = CURRENT_DATE')
            .andWhere('caja.estado = :estado', { estado: 'CONFIRMADO' })
            .getRawOne();

        // Movimientos del mes
        const movimientosMes = await this.cajaSimpleRepository
            .createQueryBuilder('caja')
            .select([
                'SUM(CASE WHEN caja.tipo = \'INGRESO\' THEN caja.monto ELSE 0 END) as ingresos_mes',
                'SUM(CASE WHEN caja.tipo = \'EGRESO\' THEN caja.monto ELSE 0 END) as egresos_mes'
            ])
            .where('caja.fecha >= :inicioMes', { inicioMes })
            .andWhere('caja.estado = :estado', { estado: 'CONFIRMADO' })
            .getRawOne();

        return {
            saldoActual,
            movimientosHoy,
            movimientosMes,
            fecha: hoy
        };
    }
}
