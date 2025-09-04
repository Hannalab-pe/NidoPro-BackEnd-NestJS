import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDetallePlanillaDto } from './dto/create-detalle-planilla.dto';
import { UpdateDetallePlanillaDto } from './dto/update-detalle-planilla.dto';
import { DetallePlanilla } from './entities/detalle-planilla.entity';
import { PlanillaMensual } from 'src/planilla-mensual/entities/planilla-mensual.entity';
import { Trabajador } from 'src/trabajador/entities/trabajador.entity';
import { EstadoPago } from 'src/enums/estado-pago.enum';

@Injectable()
export class DetallePlanillaService {
  constructor(
    @InjectRepository(DetallePlanilla)
    private readonly detallePlanillaRepository: Repository<DetallePlanilla>,
    @InjectRepository(PlanillaMensual)
    private readonly planillaMensualRepository: Repository<PlanillaMensual>,
    @InjectRepository(Trabajador)
    private readonly trabajadorRepository: Repository<Trabajador>,
  ) {}

  async updatePlanilla(
    id: string,
    fechaPagoReal: Date,
  ): Promise<{
    success: boolean;
    message: string;
    updatedCount: number;
  }> {
    const result = await this.detallePlanillaRepository
      .createQueryBuilder()
      .update()
      .set({
        estadoPago: EstadoPago.PAGADO,
        fechaPago: fechaPagoReal ? fechaPagoReal.toISOString() : null,
        actualizadoEn: new Date(),
      })
      .where('idPlanillaMensual = :id', { id })
      .execute();

    return {
      success: true,
      message: 'Planilla actualizada correctamente',
      updatedCount: result.affected || 0,
    };
  }

  async create(createDetallePlanillaDto: CreateDetallePlanillaDto): Promise<{
    success: boolean;
    message: string;
    detalle: DetallePlanilla;
  }> {
    // Verificar que la planilla mensual existe
    const planillaMensual = await this.planillaMensualRepository.findOne({
      where: { idPlanillaMensual: createDetallePlanillaDto.idPlanillaMensual },
    });

    if (!planillaMensual) {
      throw new NotFoundException('La planilla mensual especificada no existe');
    }

    // Verificar que el trabajador existe
    const trabajador = await this.trabajadorRepository.findOne({
      where: { idTrabajador: createDetallePlanillaDto.idTrabajador },
    });

    if (!trabajador) {
      throw new NotFoundException('El trabajador especificado no existe');
    }

    // Verificar que no existe ya un detalle para la misma planilla y trabajador
    const detalleExistente = await this.detallePlanillaRepository.findOne({
      where: {
        idPlanillaMensual: createDetallePlanillaDto.idPlanillaMensual,
        idTrabajador: createDetallePlanillaDto.idTrabajador,
      },
    });

    if (detalleExistente) {
      throw new ConflictException(
        'Ya existe un detalle de planilla para este trabajador en esta planilla',
      );
    }

    const totalIngresos =
      createDetallePlanillaDto.sueldoBase +
      (createDetallePlanillaDto.bonificacionFamiliar || 0) +
      (createDetallePlanillaDto.asignacionFamiliar || 0) +
      (createDetallePlanillaDto.otrosIngresos || 0);
    const totalDescuentos =
      (createDetallePlanillaDto.descuentoAfp || 0) +
      (createDetallePlanillaDto.descuentoEssalud || 0) +
      (createDetallePlanillaDto.descuentoOnp || 0) +
      (createDetallePlanillaDto.otrosDescuentos || 0);
    const sueldoNeto = totalIngresos - totalDescuentos;

    // Crear el detalle de planilla
    const detalle = this.detallePlanillaRepository.create({
      idPlanillaMensual: createDetallePlanillaDto.idPlanillaMensual,
      idTrabajador: createDetallePlanillaDto.idTrabajador,
      sueldoBase: createDetallePlanillaDto.sueldoBase,
      bonificacionFamiliar: createDetallePlanillaDto.bonificacionFamiliar || 0,
      asignacionFamiliar: createDetallePlanillaDto.asignacionFamiliar || 0,
      otrosIngresos: createDetallePlanillaDto.otrosIngresos || 0,
      totalIngresos: totalIngresos,
      descuentoAfp: createDetallePlanillaDto.descuentoAfp || 0,
      descuentoEssalud: createDetallePlanillaDto.descuentoEssalud || 0,
      descuentoOnp: createDetallePlanillaDto.descuentoOnp || 0,
      otrosDescuentos: createDetallePlanillaDto.otrosDescuentos || 0,
      totalDescuentos: totalDescuentos,
      sueldoNeto: sueldoNeto,
      diasTrabajados: createDetallePlanillaDto.diasTrabajados || 30,
      diasFaltados: createDetallePlanillaDto.diasFaltados || 0,
      estadoPago: createDetallePlanillaDto.estadoPago || EstadoPago.PENDIENTE,
      fechaPago: createDetallePlanillaDto.fechaPago || null,
      observaciones: createDetallePlanillaDto.observaciones || null,
      creadoEn: new Date(),
      actualizadoEn: new Date(),
    });

    const savedDetalle = await this.detallePlanillaRepository.save(detalle);

    return {
      success: true,
      message: 'Detalle de planilla creado correctamente',
      detalle: savedDetalle,
    };
  }

  async findAll(): Promise<{
    success: boolean;
    message: string;
    detalles: DetallePlanilla[];
  }> {
    const detalles = await this.detallePlanillaRepository.find({
      relations: ['idPlanillaMensual2', 'idTrabajador2'],
      order: { creadoEn: 'DESC' },
    });

    return {
      success: true,
      message: 'Detalles de planilla obtenidos correctamente',
      detalles,
    };
  }

  async findByPlanilla(idPlanillaMensual: string): Promise<{
    success: boolean;
    message: string;
    detalles: DetallePlanilla[];
  }> {
    const detalles = await this.detallePlanillaRepository.find({
      where: { idPlanillaMensual },
      relations: ['idPlanillaMensual2', 'idTrabajador2'],
      order: { creadoEn: 'ASC' },
    });

    return {
      success: true,
      message: 'Detalles de la planilla obtenidos correctamente',
      detalles,
    };
  }

  async findByTrabajador(idTrabajador: string): Promise<{
    success: boolean;
    message: string;
    detalles: DetallePlanilla[];
  }> {
    const detalles = await this.detallePlanillaRepository.find({
      where: { idTrabajador },
      relations: ['idPlanillaMensual2', 'idTrabajador2'],
      order: { creadoEn: 'DESC' },
    });

    return {
      success: true,
      message: 'Detalles del trabajador obtenidos correctamente',
      detalles,
    };
  }

  async findByEstadoPago(estadoPago: EstadoPago): Promise<{
    success: boolean;
    message: string;
    detalles: DetallePlanilla[];
  }> {
    const detalles = await this.detallePlanillaRepository.find({
      where: { estadoPago },
      relations: ['idPlanillaMensual2', 'idTrabajador2'],
      order: { creadoEn: 'DESC' },
    });

    return {
      success: true,
      message: `Detalles en estado ${estadoPago} obtenidos correctamente`,
      detalles,
    };
  }

  async findByPlanillaYTrabajador(
    idPlanillaMensual: string,
    idTrabajador: string,
  ): Promise<DetallePlanilla | null> {
    return await this.detallePlanillaRepository.findOne({
      where: {
        idPlanillaMensual,
        idTrabajador,
      },
    });
  }

  async findOne(id: string): Promise<DetallePlanilla> {
    const detalle = await this.detallePlanillaRepository.findOne({
      where: { idDetallePlanilla: id },
      relations: ['idPlanillaMensual2', 'idTrabajador2'],
    });

    if (!detalle) {
      throw new NotFoundException(
        `Detalle de planilla con ID ${id} no encontrado`,
      );
    }

    return detalle;
  }

  async update(
    id: string,
    updateDetallePlanillaDto: UpdateDetallePlanillaDto,
  ): Promise<{
    success: boolean;
    message: string;
    detalle: DetallePlanilla;
  }> {
    const detalle = await this.findOne(id);

    // Validar que la planilla mensual existe si se está actualizando
    if (
      updateDetallePlanillaDto.idPlanillaMensual &&
      updateDetallePlanillaDto.idPlanillaMensual !== detalle.idPlanillaMensual
    ) {
      const planillaMensual = await this.planillaMensualRepository.findOne({
        where: {
          idPlanillaMensual: updateDetallePlanillaDto.idPlanillaMensual,
        },
      });

      if (!planillaMensual) {
        throw new NotFoundException(
          'La planilla mensual especificada no existe',
        );
      }
    }

    // Validar que el trabajador existe si se está actualizando
    if (
      updateDetallePlanillaDto.idTrabajador &&
      updateDetallePlanillaDto.idTrabajador !== detalle.idTrabajador
    ) {
      const trabajador = await this.trabajadorRepository.findOne({
        where: { idTrabajador: updateDetallePlanillaDto.idTrabajador },
      });

      if (!trabajador) {
        throw new NotFoundException('El trabajador especificado no existe');
      }

      // Verificar que no exista duplicado con la nueva combinación
      const detalleExistente = await this.detallePlanillaRepository.findOne({
        where: {
          idPlanillaMensual:
            updateDetallePlanillaDto.idPlanillaMensual ||
            detalle.idPlanillaMensual,
          idTrabajador: updateDetallePlanillaDto.idTrabajador,
        },
      });

      if (detalleExistente && detalleExistente.idDetallePlanilla !== id) {
        throw new ConflictException(
          'Ya existe un detalle de planilla para este trabajador en esta planilla',
        );
      }
    }

    // Recalcular totales si se modifican los campos relevantes
    let totalIngresos: number | undefined;
    let totalDescuentos: number | undefined;
    let sueldoNeto: number | undefined;

    const camposCalculables = [
      'sueldoBase',
      'bonificacionFamiliar',
      'asignacionFamiliar',
      'otrosIngresos',
      'descuentoAfp',
      'descuentoEssalud',
      'descuentoOnp',
      'otrosDescuentos',
    ];

    const hayActualizacionCalculable = camposCalculables.some(
      (campo) => updateDetallePlanillaDto[campo] !== undefined,
    );

    if (hayActualizacionCalculable) {
      const sueldoBase =
        updateDetallePlanillaDto.sueldoBase || detalle.sueldoBase;
      const bonificacionFamiliar =
        updateDetallePlanillaDto.bonificacionFamiliar ||
        detalle.bonificacionFamiliar ||
        0;
      const asignacionFamiliar =
        updateDetallePlanillaDto.asignacionFamiliar ||
        detalle.asignacionFamiliar ||
        0;
      const otrosIngresos =
        updateDetallePlanillaDto.otrosIngresos || detalle.otrosIngresos || 0;

      const descuentoAfp =
        updateDetallePlanillaDto.descuentoAfp || detalle.descuentoAfp || 0;
      const descuentoEssalud =
        updateDetallePlanillaDto.descuentoEssalud ||
        detalle.descuentoEssalud ||
        0;
      const descuentoOnp =
        updateDetallePlanillaDto.descuentoOnp || detalle.descuentoOnp || 0;
      const otrosDescuentos =
        updateDetallePlanillaDto.otrosDescuentos ||
        detalle.otrosDescuentos ||
        0;

      totalIngresos =
        sueldoBase + bonificacionFamiliar + asignacionFamiliar + otrosIngresos;
      totalDescuentos =
        descuentoAfp + descuentoEssalud + descuentoOnp + otrosDescuentos;
      sueldoNeto = totalIngresos - totalDescuentos;
    }

    // Preparar datos de actualización
    const updateData: any = {
      ...updateDetallePlanillaDto,
      actualizadoEn: new Date(),
    };

    if (totalIngresos !== undefined)
      updateData.totalIngresos = totalIngresos.toFixed(2);
    if (totalDescuentos !== undefined)
      updateData.totalDescuentos = totalDescuentos.toFixed(2);
    if (sueldoNeto !== undefined) updateData.sueldoNeto = sueldoNeto.toFixed(2);

    await this.detallePlanillaRepository.update(id, updateData);

    const detalleActualizado = await this.findOne(id);

    return {
      success: true,
      message: 'Detalle de planilla actualizado correctamente',
      detalle: detalleActualizado,
    };
  }

  async remove(id: string): Promise<{
    success: boolean;
    message: string;
  }> {
    const detalle = await this.findOne(id);

    await this.detallePlanillaRepository.delete(id);

    return {
      success: true,
      message: 'Detalle de planilla eliminado correctamente',
    };
  }

  // ==================== MÉTODOS AUXILIARES ====================

  async recalcularTotales(id: string): Promise<{
    success: boolean;
    message: string;
    detalle: DetallePlanilla;
    totalesCalculados: {
      totalIngresos: number;
      totalDescuentos: number;
      sueldoNeto: number;
    };
  }> {
    const detalle = await this.findOne(id);

    const sueldoBase = detalle.sueldoBase;
    const bonificacionFamiliar = detalle.bonificacionFamiliar || 0;
    const asignacionFamiliar = detalle.asignacionFamiliar || 0;
    const otrosIngresos = detalle.otrosIngresos || 0;

    const descuentoAfp = detalle.descuentoAfp || 0;
    const descuentoEssalud = detalle.descuentoEssalud || 0;
    const descuentoOnp = detalle.descuentoOnp || 0;
    const otrosDescuentos = detalle.otrosDescuentos || 0;

    const totalIngresos =
      sueldoBase + bonificacionFamiliar + asignacionFamiliar + otrosIngresos;
    const totalDescuentos =
      descuentoAfp + descuentoEssalud + descuentoOnp + otrosDescuentos;
    const sueldoNeto = totalIngresos - totalDescuentos;

    await this.detallePlanillaRepository.update(id, {
      totalIngresos: totalIngresos,
      totalDescuentos: totalDescuentos,
      sueldoNeto: sueldoNeto,
      actualizadoEn: new Date(),
    });

    const detalleActualizado = await this.findOne(id);

    return {
      success: true,
      message: 'Totales recalculados correctamente',
      detalle: detalleActualizado,
      totalesCalculados: {
        totalIngresos: totalIngresos,
        totalDescuentos: totalDescuentos,
        sueldoNeto: sueldoNeto,
      },
    };
  }

  calcularDescuentoAfp(sueldoBase: number): number {
    // AFP = 10% del sueldo base
    return sueldoBase * 0.1;
  }

  calcularDescuentoEssalud(sueldoBase: number): number {
    // EsSalud = 9% del sueldo base (pagado por el empleador, pero lo incluimos para el cálculo)
    return sueldoBase * 0.09;
  }

  async crearDetalleTrabajador(
    idPlanillaMensual: string,
    idTrabajador: string,
    sueldoData: any,
  ): Promise<DetallePlanilla> {
    const sueldoBase = sueldoData.sueldoBase;
    const bonificacionFamiliar = sueldoData.bonificacionFamiliar || 0;
    const asignacionFamiliar = sueldoData.asignacionFamiliar || 0;
    const otrosIngresos = sueldoData.otrosIngresos || 0;

    const totalIngresos =
      sueldoBase + bonificacionFamiliar + asignacionFamiliar + otrosIngresos;
    const descuentoAfp = this.calcularDescuentoAfp(sueldoBase);
    const descuentoEssalud = this.calcularDescuentoEssalud(sueldoBase);
    const totalDescuentos = descuentoAfp + descuentoEssalud;
    const sueldoNeto = totalIngresos - totalDescuentos;

    const detalle = this.detallePlanillaRepository.create({
      idPlanillaMensual: idPlanillaMensual,
      idTrabajador: idTrabajador,
      sueldoBase: sueldoBase,
      bonificacionFamiliar: bonificacionFamiliar,
      asignacionFamiliar: asignacionFamiliar,
      otrosIngresos: otrosIngresos,
      totalIngresos: totalIngresos,
      descuentoAfp: descuentoAfp,
      descuentoEssalud: descuentoEssalud,
      descuentoOnp: 0,
      otrosDescuentos: 0,
      totalDescuentos: totalDescuentos,
      sueldoNeto: sueldoNeto,
      diasTrabajados: 30,
      diasFaltados: 0,
      estadoPago: EstadoPago.PENDIENTE,
      ctsSemestral: 0,
      ctsMensual: 0,
      gratificacion: 0,
      fechaGratificacionDeposito: null,
      fechaCtsDeposito: null,
      creadoEn: new Date(),
      actualizadoEn: new Date(),
    });

    return await this.detallePlanillaRepository.save(detalle);
  }

  async actualizarEstadoPagoPlanilla(
    idPlanilla: string,
    fechaPago: Date,
  ): Promise<void> {
    await this.detallePlanillaRepository.update(
      { idPlanillaMensual: idPlanilla },
      {
        estadoPago: EstadoPago.PAGADO,
        fechaPago: fechaPago.toISOString().split('T')[0],
        actualizadoEn: new Date(),
      },
    );
  }
}
