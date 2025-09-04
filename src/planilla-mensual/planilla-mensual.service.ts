import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { CreatePlanillaMensualDto } from './dto/create-planilla-mensual.dto';
import { UpdatePlanillaMensualDto } from './dto/update-planilla-mensual.dto';
import {
  AprobarPlanillaMensualDto,
  RegistrarPagoPlanillaMensualDto,
  GenerarPlanillaConTrabajadoresDto,
} from './dto/operaciones-planilla.dto';
import { PlanillaMensual } from './entities/planilla-mensual.entity';
import { DetallePlanilla } from 'src/detalle-planilla/entities/detalle-planilla.entity';
import { Trabajador } from 'src/trabajador/entities/trabajador.entity';
import { EstadoPlanilla } from 'src/enums/estado-planilla.enum';
import { EstadoPago } from 'src/enums/estado-pago.enum';
import { DetallePlanillaService } from 'src/detalle-planilla/detalle-planilla.service';
import { SueldoTrabajadorService } from 'src/sueldo-trabajador/sueldo-trabajador.service';
import { TrabajadorService } from 'src/trabajador/trabajador.service';

@Injectable()
export class PlanillaMensualService {
  constructor(
    @InjectRepository(PlanillaMensual)
    private readonly planillaMensualRepository: Repository<PlanillaMensual>,
    @InjectRepository(DetallePlanilla)
    private readonly detallePlanillaRepository: Repository<DetallePlanilla>,
    private readonly dataSource: DataSource,
    private readonly detallePlanillaService: DetallePlanillaService,
    private readonly trabajadorService: TrabajadorService,
    private readonly sueldoTrabajadorService: SueldoTrabajadorService,
  ) { }

  async create(createPlanillaMensualDto: CreatePlanillaMensualDto): Promise<{
    success: boolean;
    message: string;
    planilla: PlanillaMensual;
  }> {
    // Verificar que no existe una planilla para el mismo mes y año
    const planillaExistente = await this.planillaMensualRepository.findOne({
      where: {
        mes: createPlanillaMensualDto.mes,
        anio: createPlanillaMensualDto.anio,
      },
    });

    if (planillaExistente) {
      throw new ConflictException(
        `Ya existe una planilla para ${createPlanillaMensualDto.mes}/${createPlanillaMensualDto.anio}`,
      );
    }

    // Verificar que el trabajador generador existe
    const trabajadorGenerador = await this.trabajadorService.findOne(createPlanillaMensualDto.generadoPor)

    if (!trabajadorGenerador) {
      throw new NotFoundException('El trabajador generador no existe');
    }

    // Verificar trabajador aprobador si se proporciona
    if (createPlanillaMensualDto.aprobadoPor) {
      const trabajadorAprobador = await this.trabajadorService.findOne(createPlanillaMensualDto.aprobadoPor)

      if (!trabajadorAprobador) {
        throw new NotFoundException('El trabajador aprobador no existe');
      }
    }

    // Crear la planilla
    const planilla = this.planillaMensualRepository.create({
      mes: createPlanillaMensualDto.mes,
      anio: createPlanillaMensualDto.anio,
      fechaPagoProgramada: createPlanillaMensualDto.fechaPagoProgramada,
      estadoPlanilla:
        createPlanillaMensualDto.estadoPlanilla || EstadoPlanilla.GENERADA,
      observaciones: createPlanillaMensualDto.observaciones,
      fechaGeneracion: new Date().toISOString().split('T')[0], // YYYY-MM-DD
      totalIngresos: '0.00',
      totalDescuentos: '0.00',
      totalNeto: '0.00',
      creadoEn: new Date(),
      actualizadoEn: new Date(),
    });

    // Asignar relaciones después de crear
    if (createPlanillaMensualDto.generadoPor) {
      planilla.generadoPor = {
        idTrabajador: createPlanillaMensualDto.generadoPor,
      } as Trabajador;
    }

    if (createPlanillaMensualDto.aprobadoPor) {
      planilla.aprobadoPor = {
        idTrabajador: createPlanillaMensualDto.aprobadoPor,
      } as Trabajador;
    }

    const savedPlanilla = await this.planillaMensualRepository.save(planilla);

    return {
      success: true,
      message: 'Planilla mensual creada correctamente',
      planilla: savedPlanilla,
    };
  }

  //Metodo masivo
  async generarPlanillaConTrabajadores(
    data: GenerarPlanillaConTrabajadoresDto,
  ): Promise<{
    success: boolean;
    message: string;
    planilla: PlanillaMensual;
    detallesCreados: DetallePlanilla[];
  }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Crear la planilla principal
      const createPlanillaDto: CreatePlanillaMensualDto = {
        mes: data.mes,
        anio: data.anio,
        fechaPagoProgramada: data.fechaPagoProgramada,
        generadoPor: data.generadoPor,
        observaciones: `Planilla generada automáticamente con ${data.trabajadores.length} trabajadores`,
      };

      const resultadoPlanilla = await this.create(createPlanillaDto);

      // 2. Obtener información de los trabajadores
      const trabajadores = await this.trabajadorService.findByIds(
        data.trabajadores,
      );

      if (trabajadores.length !== data.trabajadores.length) {
        throw new BadRequestException('Algunos trabajadores no existen');
      }

      // 3. Crear detalles de planilla para cada trabajador
      const detallesCreados: DetallePlanilla[] = [];

      for (const trabajador of trabajadores) {
        // Obtener el sueldo vigente del trabajador desde la tabla sueldo_trabajador
        const sueldoData = await this.sueldoTrabajadorService.obtenerSueldoVigenteTrabajador(
          trabajador.idTrabajador,
        );

        if (!sueldoData) {
          throw new BadRequestException(
            `No se encontró sueldo vigente para el trabajador ${trabajador.nombre} ${trabajador.apellido}`,
          );
        }

        // Crear detalle usando el servicio correspondiente
        const detalleGuardado = await queryRunner.manager.save(
          DetallePlanilla,
          await this.detallePlanillaService.crearDetalleTrabajador(
            resultadoPlanilla.planilla.idPlanillaMensual,
            trabajador.idTrabajador,
            sueldoData,
          ),
        );
        detallesCreados.push(detalleGuardado);
      }

      // 4. Actualizar totales de la planilla
      await this.recalcularTotalesPlanilla(
        resultadoPlanilla.planilla.idPlanillaMensual,
        queryRunner,
      );

      await queryRunner.commitTransaction();

      return {
        success: true,
        message: `Planilla generada con ${detallesCreados.length} trabajadores`,
        planilla: resultadoPlanilla.planilla,
        detallesCreados,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  //metodo para agregar un trabajador a la planilla UNITARIO
  async agregarTrabajadorAPlanilla(
    idPlanilla: string,
    idTrabajador: string,
  ): Promise<{
    success: boolean;
    message: string;
    detalle: DetallePlanilla;
  }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Verificar que la planilla existe y está en estado editable
      const planilla = await this.findOne(idPlanilla);

      if (
        ![EstadoPlanilla.GENERADA, EstadoPlanilla.EN_REVISION].includes(
          planilla.estadoPlanilla as EstadoPlanilla,
        )
      ) {
        throw new BadRequestException(
          'Solo se pueden agregar trabajadores a planillas en estado GENERADA o EN_REVISION',
        );
      }

      // 2. Verificar que el trabajador existe
      const trabajador = await this.trabajadorService.findOne(idTrabajador);

      if (!trabajador) {
        throw new BadRequestException('El trabajador no existe');
      }

      // 3. Verificar que el trabajador no esté ya en la planilla
      const detalleExistente = await this.detallePlanillaService.findByPlanillaYTrabajador(
        idPlanilla,
        idTrabajador,
      );

      if (detalleExistente) {
        throw new ConflictException(
          'El trabajador ya está incluido en esta planilla',
        );
      }

      // 4. Obtener el sueldo vigente del trabajador
      const sueldoData = await this.sueldoTrabajadorService.obtenerSueldoVigenteTrabajador(idTrabajador);

      if (!sueldoData) {
        throw new BadRequestException(
          `No se encontró sueldo vigente para el trabajador ${trabajador.nombre} ${trabajador.apellido}`,
        );
      }

      // 6. Crear el detalle de planilla usando el servicio correspondiente
      const detalleGuardado = await queryRunner.manager.save(
        DetallePlanilla,
        await this.detallePlanillaService.crearDetalleTrabajador(
          idPlanilla,
          idTrabajador,
          sueldoData,
        ),
      );

      // 7. Recalcular totales de la planilla
      await this.recalcularTotalesPlanilla(idPlanilla, queryRunner);

      await queryRunner.commitTransaction();

      return {
        success: true,
        message: `Trabajador ${trabajador.nombre} ${trabajador.apellido} agregado correctamente a la planilla`,
        detalle: detalleGuardado,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async aprobarPlanilla(
    id: string,
    data: AprobarPlanillaMensualDto,
  ): Promise<{
    success: boolean;
    message: string;
    planilla: PlanillaMensual;
  }> {
    const planilla = await this.findOne(id);

    if (
      planilla.estadoPlanilla !== EstadoPlanilla.GENERADA &&
      planilla.estadoPlanilla !== EstadoPlanilla.EN_REVISION
    ) {
      throw new BadRequestException(
        'Solo se pueden aprobar planillas en estado GENERADA o EN_REVISION',
      );
    }

    // Verificar que el trabajador aprobador existe
    const trabajadorAprobador = await this.trabajadorService.findOne(data.aprobadoPor);

    if (!trabajadorAprobador) {
      throw new NotFoundException('El trabajador aprobador no existe');
    }

    // Actualizar observaciones si se proporcionan
    let observacionesActualizadas = planilla.observaciones || '';
    if (data.observaciones) {
      observacionesActualizadas += observacionesActualizadas
        ? ` | Aprobación: ${data.observaciones}`
        : `Aprobación: ${data.observaciones}`;
    }

    await this.planillaMensualRepository.update(id, {
      estadoPlanilla: EstadoPlanilla.APROBADA,
      aprobadoPor: { idTrabajador: data.aprobadoPor } as Trabajador,
      observaciones: observacionesActualizadas,
      actualizadoEn: new Date(),
    });

    const planillaActualizada = await this.findOne(id);

    return {
      success: true,
      message: 'Planilla aprobada correctamente',
      planilla: planillaActualizada,
    };
  }

  async registrarPago(
    id: string,
    data: RegistrarPagoPlanillaMensualDto,
  ): Promise<{
    success: boolean;
    message: string;
    planilla: PlanillaMensual;
  }> {
    const planilla = await this.findOne(id);

    if (planilla.estadoPlanilla !== EstadoPlanilla.APROBADA) {
      throw new BadRequestException(
        'Solo se pueden registrar pagos en planillas APROBADAS',
      );
    }

    // Verificar que el trabajador pagador existe
    const trabajadorPagador = await this.trabajadorService.findOne(data.pagadoPor);

    if (!trabajadorPagador) {
      throw new NotFoundException('El trabajador pagador no existe');
    }

    // Actualizar observaciones
    let observacionesActualizadas = planilla.observaciones || '';
    if (data.observaciones) {
      observacionesActualizadas += observacionesActualizadas
        ? ` | Pago: ${data.observaciones}`
        : `Pago: ${data.observaciones}`;
    }

    await this.planillaMensualRepository.update(id, {
      estadoPlanilla: EstadoPlanilla.PAGADA,
      fechaPagoReal: data.fechaPagoReal,
      pagadoPor: { idTrabajador: data.pagadoPor } as Trabajador,
      observaciones: observacionesActualizadas,
      actualizadoEn: new Date(),
    });

    // Actualizar estado de pago en todos los detalles
    await this.detallePlanillaService.actualizarEstadoPagoPlanilla(id, new Date(data.fechaPagoReal));

    const planillaActualizada = await this.findOne(id);

    return {
      success: true,
      message: 'Pago registrado correctamente',
      planilla: planillaActualizada,
    };
  }

  async findAll(): Promise<{
    success: boolean;
    message: string;
    planillas: PlanillaMensual[];
  }> {
    const planillas = await this.planillaMensualRepository.find({
      relations: [
        'generadoPor',
        'aprobadoPor',
        'pagadoPor',
        'detallePlanillas',
      ],
      order: { anio: 'DESC', mes: 'DESC' },
    });

    return {
      success: true,
      message: 'Planillas obtenidas correctamente',
      planillas,
    };
  }

  async findByEstado(estado: EstadoPlanilla): Promise<{
    success: boolean;
    message: string;
    planillas: PlanillaMensual[];
  }> {
    const planillas = await this.planillaMensualRepository.find({
      where: { estadoPlanilla: estado },
      relations: [
        'generadoPor',
        'aprobadoPor',
        'pagadoPor',
        'detallePlanillas',
      ],
      order: { anio: 'DESC', mes: 'DESC' },
    });

    return {
      success: true,
      message: `Planillas en estado ${estado} obtenidas correctamente`,
      planillas,
    };
  }

  async findByPeriodo(
    mes: number,
    anio: number,
  ): Promise<PlanillaMensual | null> {
    return await this.planillaMensualRepository.findOne({
      where: { mes, anio },
      relations: [
        'generadoPor',
        'aprobadoPor',
        'pagadoPor',
        'detallePlanillas',
        'detallePlanillas.idTrabajador2',
      ],
    });
  }

  async findOne(id: string): Promise<PlanillaMensual> {
    const planilla = await this.planillaMensualRepository.findOne({
      where: { idPlanillaMensual: id },
      relations: [
        'generadoPor',
        'aprobadoPor',
        'pagadoPor',
        'detallePlanillas',
        'detallePlanillas.idTrabajador2',
      ],
    });

    if (!planilla) {
      throw new NotFoundException(
        `Planilla mensual con ID ${id} no encontrada`,
      );
    }

    return planilla;
  }

  async update(
    id: string,
    updatePlanillaMensualDto: UpdatePlanillaMensualDto,
  ): Promise<{
    success: boolean;
    message: string;
    planilla: PlanillaMensual;
  }> {
    const planilla = await this.findOne(id);

    // Solo permitir edición si está en estado GENERADA o EN_REVISION
    if (
      ![EstadoPlanilla.GENERADA, EstadoPlanilla.EN_REVISION].includes(
        planilla.estadoPlanilla as EstadoPlanilla,
      )
    ) {
      throw new BadRequestException(
        'Solo se pueden editar planillas en estado GENERADA o EN_REVISION',
      );
    }

    // Verificar trabajadores si se actualizan
    if (updatePlanillaMensualDto.generadoPor) {
      const trabajadorGenerador = await this.trabajadorService.findOne(updatePlanillaMensualDto.generadoPor)
      if (!trabajadorGenerador) {
        throw new NotFoundException('El trabajador generador no existe');
      }
    }

    if (updatePlanillaMensualDto.aprobadoPor) {
      const trabajadorAprobador = await this.trabajadorService.findOne(updatePlanillaMensualDto.aprobadoPor)
      if (!trabajadorAprobador) {
        throw new NotFoundException('El trabajador aprobador no existe');
      }
    }

    // Preparar datos de actualización sin las propiedades problemáticas
    const updateData: any = {
      actualizadoEn: new Date(),
    };

    // Agregar campos básicos
    if (updatePlanillaMensualDto.mes !== undefined)
      updateData.mes = updatePlanillaMensualDto.mes;
    if (updatePlanillaMensualDto.anio !== undefined)
      updateData.anio = updatePlanillaMensualDto.anio;
    if (updatePlanillaMensualDto.fechaPagoProgramada !== undefined)
      updateData.fechaPagoProgramada =
        updatePlanillaMensualDto.fechaPagoProgramada;
    if (updatePlanillaMensualDto.estadoPlanilla !== undefined)
      updateData.estadoPlanilla = updatePlanillaMensualDto.estadoPlanilla;
    if (updatePlanillaMensualDto.observaciones !== undefined)
      updateData.observaciones = updatePlanillaMensualDto.observaciones;

    await this.planillaMensualRepository.update(id, updateData);

    // Actualizar relaciones por separado si es necesario
    if (updatePlanillaMensualDto.generadoPor) {
      await this.planillaMensualRepository
        .createQueryBuilder()
        .update(PlanillaMensual)
        .set({
          generadoPor: {
            idTrabajador: updatePlanillaMensualDto.generadoPor,
          } as any,
        })
        .where('idPlanillaMensual = :id', { id })
        .execute();
    }

    if (updatePlanillaMensualDto.aprobadoPor) {
      await this.planillaMensualRepository
        .createQueryBuilder()
        .update(PlanillaMensual)
        .set({
          aprobadoPor: {
            idTrabajador: updatePlanillaMensualDto.aprobadoPor,
          } as any,
        })
        .where('idPlanillaMensual = :id', { id })
        .execute();
    }

    const planillaActualizada = await this.findOne(id);

    return {
      success: true,
      message: 'Planilla actualizada correctamente',
      planilla: planillaActualizada,
    };
  }

  async remove(id: string): Promise<{
    success: boolean;
    message: string;
  }> {
    const planilla = await this.findOne(id);

    // Solo permitir eliminación si está en estado GENERADA
    if (planilla.estadoPlanilla !== EstadoPlanilla.GENERADA) {
      throw new BadRequestException(
        'Solo se pueden eliminar planillas en estado GENERADA',
      );
    }

    await this.planillaMensualRepository.delete(id);

    return {
      success: true,
      message: 'Planilla eliminada correctamente',
    };
  }

  // ==================== MÉTODOS AUXILIARES ====================

  private async recalcularTotalesPlanilla(
    idPlanilla: string,
    queryRunner?: any,
  ): Promise<void> {
    const repository = queryRunner
      ? queryRunner.manager
      : this.detallePlanillaRepository;

    const totales = await repository
      .createQueryBuilder('detalle')
      .select('SUM(CAST(detalle.totalIngresos AS DECIMAL))', 'totalIngresos')
      .addSelect(
        'SUM(CAST(detalle.totalDescuentos AS DECIMAL))',
        'totalDescuentos',
      )
      .addSelect('SUM(CAST(detalle.sueldoNeto AS DECIMAL))', 'totalNeto')
      .where('detalle.idPlanillaMensual = :idPlanilla', { idPlanilla })
      .getRawOne();

    const planillaRepository = queryRunner
      ? queryRunner.manager
      : this.planillaMensualRepository;

    await planillaRepository.update(idPlanilla, {
      totalIngresos: (totales.totalIngresos || 0).toString(),
      totalDescuentos: (totales.totalDescuentos || 0).toString(),
      totalNeto: (totales.totalNeto || 0).toString(),
      actualizadoEn: new Date(),
    });
  }

  async recalcularTotales(idPlanilla: string): Promise<{
    success: boolean;
    message: string;
    totales: {
      totalIngresos: string;
      totalDescuentos: string;
      totalNeto: string;
    };
  }> {
    await this.recalcularTotalesPlanilla(idPlanilla);

    const planillaActualizada = await this.findOne(idPlanilla);

    return {
      success: true,
      message: 'Totales recalculados correctamente',
      totales: {
        totalIngresos: planillaActualizada.totalIngresos || '0.00',
        totalDescuentos: planillaActualizada.totalDescuentos || '0.00',
        totalNeto: planillaActualizada.totalNeto || '0.00',
      },
    };
  }
}
