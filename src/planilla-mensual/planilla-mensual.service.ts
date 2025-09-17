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
import { CajaSimpleService } from 'src/caja-simple/caja-simple.service';
import { CajaSimple } from 'src/caja-simple/entities/caja-simple.entity';
import { UpdatePlanillaMensualTrabajadorDto } from './dto/update-planilla-trabajadores-mensual.dto';

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
    private readonly cajaSimpleService: CajaSimpleService,
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
    const trabajadorGenerador = await this.trabajadorService.findOne(
      createPlanillaMensualDto.generadoPor,
    );

    if (!trabajadorGenerador) {
      throw new NotFoundException('El trabajador generador no existe');
    }

    // Verificar trabajador aprobador si se proporciona
    if (createPlanillaMensualDto.aprobadoPor) {
      const trabajadorAprobador = await this.trabajadorService.findOne(
        createPlanillaMensualDto.aprobadoPor,
      );

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
      totalIngresos: 0,
      totalDescuentos: 0,
      totalNeto: 0,
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

      // 1. Verificar que no existe una planilla para el mismo mes y año
      const planillaExistente = await queryRunner.manager.findOne(PlanillaMensual, {
        where: {
          mes: data.mes,
          anio: data.anio,
        },
      });

      if (planillaExistente) {
        throw new ConflictException(
          `Ya existe una planilla para ${data.mes}/${data.anio}`,
        );
      }

      // 2. Verificar que el trabajador generador existe
      const trabajadorGenerador = await this.trabajadorService.findOne(
        data.generadoPor,
      );

      if (!trabajadorGenerador) {
        throw new NotFoundException('El trabajador generador no existe');
      }

      // 3. Obtener información de los trabajadores
      const trabajadores = await this.trabajadorService.findByIds(
        data.trabajadores,
      );

      if (trabajadores.length !== data.trabajadores.length) {
        const trabajadoresEncontrados = trabajadores.map(t => t.idTrabajador);
        const trabajadoresNoEncontrados = data.trabajadores.filter(id => !trabajadoresEncontrados.includes(id));
        throw new BadRequestException(`Los siguientes trabajadores no existen: ${trabajadoresNoEncontrados.join(', ')}`);
      }

      // 4. Crear la planilla principal usando la transacción
      const planilla = queryRunner.manager.create(PlanillaMensual, {
        mes: data.mes,
        anio: data.anio,
        fechaPagoProgramada: data.fechaPagoProgramada,
        estadoPlanilla: EstadoPlanilla.GENERADA,
        observaciones: `Planilla generada automáticamente con ${data.trabajadores.length} trabajadores`,
        fechaGeneracion: new Date().toISOString().split('T')[0],
        totalIngresos: 0,
        totalDescuentos: 0,
        totalNeto: 0,
        creadoEn: new Date(),
        actualizadoEn: new Date(),
        generadoPor: { idTrabajador: data.generadoPor } as Trabajador,
      });

      const planillaGuardada = await queryRunner.manager.save(PlanillaMensual, planilla);

      // 5. Crear detalles de planilla para cada trabajador
      const detallesCreados: DetallePlanilla[] = [];

      for (const trabajador of trabajadores) {
        try {

          // Obtener el sueldo vigente del trabajador
          const sueldoData = await this.sueldoTrabajadorService.obtenerSueldoVigenteTrabajador(
            trabajador.idTrabajador,
          );

          if (!sueldoData) {
            throw new BadRequestException(
              `No se encontró sueldo vigente para el trabajador ${trabajador.nombre} ${trabajador.apellido}`,
            );
          }


          // Crear detalle usando el servicio correspondiente (sin guardarlo aún)
          const detalleNuevo = this.detallePlanillaService.crearDetalleTrabajadorSinGuardar(
            planillaGuardada.idPlanillaMensual,
            trabajador.idTrabajador,
            sueldoData,
          );

          const detalleGuardado = await queryRunner.manager.save(DetallePlanilla, detalleNuevo);
          detallesCreados.push(detalleGuardado);

        } catch (error) {
          throw new BadRequestException(
            `Error procesando trabajador ${trabajador.nombre} ${trabajador.apellido}: ${error.message}`
          );
        }
      }

      // 6. Actualizar totales de la planilla
      await this.recalcularTotalesPlanilla(
        planillaGuardada.idPlanillaMensual,
        queryRunner,
      );

      await queryRunner.commitTransaction();

      // 7. Obtener la planilla completa para devolver
      const planillaCompleta = await this.findOne(planillaGuardada.idPlanillaMensual);

      return {
        success: true,
        message: `Planilla generada exitosamente con ${detallesCreados.length} trabajadores`,
        planilla: planillaCompleta,
        detallesCreados,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();

      // Re-lanzar con más información
      if (error instanceof BadRequestException || error instanceof ConflictException || error instanceof NotFoundException) {
        throw error;
      } else {
        throw new BadRequestException(`Error interno al generar planilla: ${error.message}`);
      }
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
      const detalleExistente =
        await this.detallePlanillaService.findByPlanillaYTrabajador(
          idPlanilla,
          idTrabajador,
        );

      if (detalleExistente) {
        throw new ConflictException(
          'El trabajador ya está incluido en esta planilla',
        );
      }

      // 4. Obtener el sueldo vigente del trabajador
      const sueldoData =
        await this.sueldoTrabajadorService.obtenerSueldoVigenteTrabajador(
          idTrabajador,
        );

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
    registroCaja?: any;
  }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
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
      const trabajadorAprobador = await this.trabajadorService.findOne(
        data.aprobadoPor,
      );

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

      // 1. CAMBIO: Actualizar planilla directamente a PAGADA y registrar fecha de pago
      const fechaAprobacion = new Date().toISOString().split('T')[0];

      await queryRunner.manager.update(PlanillaMensual, id, {
        estadoPlanilla: EstadoPlanilla.PAGADA, // 🔥 CAMBIO: Directo a PAGADA
        fechaPagoReal: fechaAprobacion, // 🔥 NUEVO: Registrar fecha de pago real
        aprobadoPor: { idTrabajador: data.aprobadoPor } as Trabajador,
        pagadoPor: { idTrabajador: data.aprobadoPor } as Trabajador, // 🔥 NUEVO: Mismo aprobador es el pagador
        observaciones: observacionesActualizadas + ` | Aprobado y pagado automáticamente`,
        actualizadoEn: new Date(),
      });

      // 2. NUEVO: Actualizar todos los detalles a PAGADO
      await queryRunner.manager.update(
        DetallePlanilla,
        { idPlanillaMensual: id },
        {
          estadoPago: EstadoPago.PAGADO,
          fechaPago: fechaAprobacion,
          actualizadoEn: new Date(),
        },
      );

      // 3. NUEVO: Registrar egresos en caja por cada trabajador
      const detalles = await queryRunner.manager.find(DetallePlanilla, {
        where: { idPlanillaMensual: id },
        relations: ['idTrabajador2'],
      });

      const registrosCaja: CajaSimple[] = [];
      for (const detalle of detalles) {
        const registroCaja = await this.cajaSimpleService.crearEgresoPorPlanilla({
          mes: planilla.mes,
          anio: planilla.anio,
          monto: detalle.sueldoNeto,
          idTrabajadorBeneficiario: detalle.idTrabajador,
          registradoPor: data.aprobadoPor,
          conceptoDetalle: `Sueldo ${detalle.idTrabajador2.nombre} ${detalle.idTrabajador2.apellido}`,
          numeroComprobante: `PLN-${planilla.mes.toString().padStart(2, '0')}-${planilla.anio}-${detalle.idTrabajador.slice(-6).toUpperCase()}`,
        });
        registrosCaja.push(registroCaja);
      }

      await queryRunner.commitTransaction();

      const planillaActualizada = await this.findOne(id);

      return {
        success: true,
        message: `Planilla aprobada y pagada automáticamente. Se registraron ${registrosCaja.length} egresos en caja por un total de S/.${planilla.totalNeto}`,
        planilla: planillaActualizada,
        registroCaja: {
          totalEgresos: registrosCaja.length,
          montoTotal: planilla.totalNeto,
          detalles: registrosCaja.map(r => ({
            idMovimiento: r.idMovimiento,
            concepto: r.concepto,
            monto: r.monto,
            trabajador: r.descripcion,
          })),
        },
      };

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(`Error al aprobar la planilla: ${error.message}`);
      
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * NUEVO: Aprobación masiva de múltiples planillas (optimizado para rendimiento)
   */
  async aprobarPlanillasMasivas(
    idsPlanillas: string[],
    data: {
      aprobadoPor: string;
      observaciones?: string;
    },
  ): Promise<{
    success: boolean;
    message: string;
    resultados: {
      planillasAprobadas: number;
      totalEgresos: number;
      montoTotalPagado: number;
      planillasConError: Array<{
        idPlanilla: string;
        error: string;
      }>;
      detallesPorPlanilla: Array<{
        idPlanilla: string;
        mes: number;
        anio: number;
        trabajadoresPagados: number;
        montoPagado: number;
        registrosCaja: string[];
      }>;
    };
  }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Validar trabajador aprobador
      const trabajadorAprobador = await this.trabajadorService.findOne(data.aprobadoPor);
      if (!trabajadorAprobador) {
        throw new NotFoundException('El trabajador aprobador no existe');
      }

      // 2. Obtener todas las planillas en una sola consulta
      const planillas = await queryRunner.manager
        .createQueryBuilder(PlanillaMensual, 'planilla')
        .leftJoinAndSelect('planilla.detallePlanillas', 'detalle')
        .leftJoinAndSelect('detalle.idTrabajador2', 'trabajador')
        .where('planilla.idPlanillaMensual IN (:...ids)', { ids: idsPlanillas })
        .getMany();

      const resultados = {
        planillasAprobadas: 0,
        totalEgresos: 0,
        montoTotalPagado: 0,
        planillasConError: [] as Array<{ idPlanilla: string; error: string }>,
        detallesPorPlanilla: [] as Array<{
          idPlanilla: string;
          mes: number;
          anio: number;
          trabajadoresPagados: number;
          montoPagado: number;
          registrosCaja: string[];
        }>,
      };

      const fechaAprobacion = new Date().toISOString().split('T')[0];

      // 3. Procesar cada planilla (optimizado con Promise.allSettled para manejar errores individuales)
      const promesasProcesamiento = planillas.map(async (planilla) => {
        try {
          // Validar estado
          if (
            planilla.estadoPlanilla !== EstadoPlanilla.GENERADA &&
            planilla.estadoPlanilla !== EstadoPlanilla.EN_REVISION
          ) {
            throw new BadRequestException(`Planilla ${planilla.mes}/${planilla.anio} no puede ser aprobada en estado ${planilla.estadoPlanilla}`);
          }

          // Actualizar planilla
          const observacionesActualizadas = (planilla.observaciones || '') +
            (data.observaciones ? ` | Aprobación masiva: ${data.observaciones}` : ' | Aprobación masiva automática');

          await queryRunner.manager.update(PlanillaMensual, planilla.idPlanillaMensual, {
            estadoPlanilla: EstadoPlanilla.PAGADA,
            fechaPagoReal: fechaAprobacion,
            aprobadoPor: { idTrabajador: data.aprobadoPor } as Trabajador,
            pagadoPor: { idTrabajador: data.aprobadoPor } as Trabajador,
            observaciones: observacionesActualizadas,
            actualizadoEn: new Date(),
          });

          // Actualizar detalles en lote
          await queryRunner.manager.update(
            DetallePlanilla,
            { idPlanillaMensual: planilla.idPlanillaMensual },
            {
              estadoPago: EstadoPago.PAGADO,
              fechaPago: fechaAprobacion,
              actualizadoEn: new Date(),
            },
          );

          // Crear registros de caja en lote (optimizado)
          const registrosCaja: string[] = [];
          const promesasCaja = planilla.detallePlanillas.map(async (detalle) => {
            const registroCaja = await this.cajaSimpleService.crearEgresoPorPlanilla({
              mes: planilla.mes,
              anio: planilla.anio,
              monto: detalle.sueldoNeto,
              idTrabajadorBeneficiario: detalle.idTrabajador,
              registradoPor: data.aprobadoPor,
              conceptoDetalle: `Sueldo ${detalle.idTrabajador2.nombre} ${detalle.idTrabajador2.apellido}`,
              numeroComprobante: `PLN-${planilla.mes.toString().padStart(2, '0')}-${planilla.anio}-${detalle.idTrabajador.slice(-6).toUpperCase()}`,
            });
            return registroCaja.idMovimiento;
          });

          const idsMovimientosCaja = await Promise.all(promesasCaja);
          registrosCaja.push(...idsMovimientosCaja);

          // Actualizar contadores
          resultados.planillasAprobadas++;
          resultados.totalEgresos += planilla.detallePlanillas.length;
          resultados.montoTotalPagado += planilla.totalNeto || 0;

          // Agregar detalle
          resultados.detallesPorPlanilla.push({
            idPlanilla: planilla.idPlanillaMensual,
            mes: planilla.mes,
            anio: planilla.anio,
            trabajadoresPagados: planilla.detallePlanillas.length,
            montoPagado: planilla.totalNeto || 0,
            registrosCaja: idsMovimientosCaja,
          });

          return { success: true, planilla: planilla.idPlanillaMensual };

        } catch (error) {
          resultados.planillasConError.push({
            idPlanilla: planilla.idPlanillaMensual,
            error: error.message,
          });
          return { success: false, planilla: planilla.idPlanillaMensual, error: error.message };
        }
      });

      // 4. Ejecutar todas las promesas y recoger resultados
      await Promise.allSettled(promesasProcesamiento);

      await queryRunner.commitTransaction();

      return {
        success: true,
        message: `Procesamiento masivo completado: ${resultados.planillasAprobadas} planillas aprobadas y pagadas, ${resultados.planillasConError.length} con errores`,
        resultados,
      };

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(`Error al procesar la planilla: ${error.message}`);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
  async aprobarPlanillaSinPago(
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
    const trabajadorAprobador = await this.trabajadorService.findOne(
      data.aprobadoPor,
    );

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
      message: 'Planilla aprobada correctamente (sin registro de pago)',
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

  async updatePlanillaConTrabajadores(
    id: string,
    updateDto: UpdatePlanillaMensualTrabajadorDto,
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
      // 1. Buscar la planilla existente
      const planilla = await this.findOne(id);

      // Solo permitir edición si está en estado GENERADA o EN_REVISION
      if (
        ![EstadoPlanilla.GENERADA, EstadoPlanilla.EN_REVISION].includes(
          planilla.estadoPlanilla as EstadoPlanilla,
        )
      ) {
        throw new BadRequestException(
          'Solo se pueden agregar trabajadores a planillas en estado GENERADA o EN_REVISION',
        );
      }

      // 2. Validar que los trabajadores existen
      const trabajadores = await this.trabajadorService.findByIds(updateDto.trabajadores ?? []);

      if (trabajadores.length !== updateDto.trabajadores?.length) {
        const trabajadoresEncontrados = trabajadores.map(t => t.idTrabajador);
        const trabajadoresNoEncontrados = updateDto.trabajadores?.filter(id => !trabajadoresEncontrados.includes(id));
        throw new BadRequestException(`Los siguientes trabajadores no existen: ${trabajadoresNoEncontrados?.join(', ')}`);
      }

      // 3. Obtener trabajadores que ya están en la planilla para filtrarlos
      const trabajadoresExistentes = await this.detallePlanillaRepository.find({
        where: { idPlanillaMensual: id },
        select: ['idTrabajador'],
      });

      const idsExistentes = trabajadoresExistentes.map(d => d.idTrabajador);
      const trabajadoresNuevos = trabajadores.filter(t => !idsExistentes.includes(t.idTrabajador));

      if (trabajadoresNuevos.length === 0) {
        throw new BadRequestException('Todos los trabajadores proporcionados ya están en la planilla');
      }

      // 4. Crear detalles para trabajadores nuevos
      const detallesCreados: DetallePlanilla[] = [];

      for (const trabajador of trabajadoresNuevos) {
        try {

          // Obtener el sueldo vigente del trabajador
          const sueldoData = await this.sueldoTrabajadorService.obtenerSueldoVigenteTrabajador(
            trabajador.idTrabajador,
          );

          if (!sueldoData) {
            throw new BadRequestException(
              `No se encontró sueldo vigente para el trabajador ${trabajador.nombre} ${trabajador.apellido}`,
            );
          }


          // Crear detalle usando el servicio correspondiente (sin guardarlo aún)
          const detalleNuevo = this.detallePlanillaService.crearDetalleTrabajadorSinGuardar(
            planilla.idPlanillaMensual,
            trabajador.idTrabajador,
            sueldoData,
          );

          const detalleGuardado = await queryRunner.manager.save(DetallePlanilla, detalleNuevo);
          detallesCreados.push(detalleGuardado);

        } catch (error) {
          throw new BadRequestException(
            `Error procesando trabajador ${trabajador.nombre} ${trabajador.apellido}: ${error.message}`
          );
        }
      }

      // 5. Recalcular totales de la planilla
      await this.recalcularTotalesPlanilla(planilla.idPlanillaMensual, queryRunner);

      await queryRunner.commitTransaction();

      // 6. Obtener la planilla completa actualizada
      const planillaActualizada = await this.findOne(id);

      return {
        success: true,
        message: `Se agregaron ${detallesCreados.length} trabajadores nuevos a la planilla. Trabajadores que ya estaban: ${idsExistentes.length}`,
        planilla: planillaActualizada,
        detallesCreados,
      };

    } catch (error) {
      await queryRunner.rollbackTransaction();

      // Re-lanzar con más información
      if (error instanceof BadRequestException || error instanceof ConflictException || error instanceof NotFoundException) {
        throw error;
      } else {
        throw new BadRequestException(`Error interno al actualizar planilla: ${error.message}`);
      }
    } finally {
      await queryRunner.release();
    }
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
    let totales;

    if (queryRunner) {
      // Cuando usamos queryRunner, necesitamos especificar la entidad
      totales = await queryRunner.manager
        .createQueryBuilder(DetallePlanilla, 'detalle')
        .select('SUM(detalle.totalIngresos)', 'totalIngresos')
        .addSelect('SUM(detalle.totalDescuentos)', 'totalDescuentos')
        .addSelect('SUM(detalle.sueldoNeto)', 'totalNeto')
        .where('detalle.idPlanillaMensual = :idPlanilla', { idPlanilla })
        .getRawOne();
    } else {
      // Cuando usamos el repositorio normal
      totales = await this.detallePlanillaRepository
        .createQueryBuilder('detalle')
        .select('SUM(detalle.totalIngresos)', 'totalIngresos')
        .addSelect('SUM(detalle.totalDescuentos)', 'totalDescuentos')
        .addSelect('SUM(detalle.sueldoNeto)', 'totalNeto')
        .where('detalle.idPlanillaMensual = :idPlanilla', { idPlanilla })
        .getRawOne();
    }

    if (queryRunner) {
      // Cuando usamos queryRunner, necesitamos usar query builder para update
      await queryRunner.manager
        .createQueryBuilder()
        .update(PlanillaMensual)
        .set({
          totalIngresos: parseFloat(totales.totalIngresos) || 0,
          totalDescuentos: parseFloat(totales.totalDescuentos) || 0,
          totalNeto: parseFloat(totales.totalNeto) || 0,
          actualizadoEn: new Date(),
        })
        .where('idPlanillaMensual = :idPlanilla', { idPlanilla })
        .execute();
    } else {
      // Cuando usamos el repositorio normal
      await this.planillaMensualRepository.update(idPlanilla, {
        totalIngresos: parseFloat(totales.totalIngresos) || 0,
        totalDescuentos: parseFloat(totales.totalDescuentos) || 0,
        totalNeto: parseFloat(totales.totalNeto) || 0,
        actualizadoEn: new Date(),
      });
    }
  }

  async recalcularTotales(idPlanilla: string): Promise<{
    success: boolean;
    message: string;
    totales: {
      totalIngresos: number;
      totalDescuentos: number;
      totalNeto: number;
    };
  }> {
    await this.recalcularTotalesPlanilla(idPlanilla);

    const planillaActualizada = await this.findOne(idPlanilla);

    return {
      success: true,
      message: 'Totales recalculados correctamente',
      totales: {
        totalIngresos: planillaActualizada.totalIngresos || 0,
        totalDescuentos: planillaActualizada.totalDescuentos || 0,
        totalNeto: planillaActualizada.totalNeto || 0,
      },
    };
  }

  async obtenerTrabajadoresPendientesPago(idPlanilla: string): Promise<{
    success: boolean;
    message: string;
    trabajadoresPendientes: any[];
  }> {
    const planilla = await this.findOne(idPlanilla);

    const trabajadoresPendientes = await this.detallePlanillaRepository.find({
      where: {
        idPlanillaMensual2: planilla,
        estadoPago: EstadoPago.PENDIENTE,
      },
      relations: ['idTrabajador2'],
    });

    return {
      success: true,
      message: 'Trabajadores pendientes de pago obtenidos correctamente',
      trabajadoresPendientes: trabajadoresPendientes.map(detalle => ({
        idDetalle: detalle.idDetallePlanilla,
        idTrabajador: detalle.idTrabajador,
        nombre: detalle.idTrabajador2.nombre,
        apellido: detalle.idTrabajador2.apellido,
        nroDocumento: detalle.idTrabajador2.nroDocumento,
        sueldoNeto: detalle.sueldoNeto,
        estadoPago: detalle.estadoPago,
        diasTrabajados: detalle.diasTrabajados,
      })),
    };
  }

}
