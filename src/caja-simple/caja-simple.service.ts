import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CajaSimple } from './entities/caja-simple.entity';
import { CreateCajaSimpleDto } from './dto/create-caja-simple.dto';
import { UpdateCajaSimpleDto, AnularCajaSimpleDto } from './dto/update-caja-simple.dto';

@Injectable()
export class CajaSimpleService {
    constructor(
        @InjectRepository(CajaSimple)
        private cajaSimpleRepository: Repository<CajaSimple>,
    ) { }

    async create(createCajaSimpleDto: CreateCajaSimpleDto): Promise<CajaSimple> {
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
}
