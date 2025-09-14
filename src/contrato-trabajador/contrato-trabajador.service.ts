import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { CreateContratoTrabajadorDto, FiltrosContratoDto } from './dto/create-contrato-trabajador.dto';
import { UpdateContratoTrabajadorDto } from './dto/update-contrato-trabajador.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ContratoTrabajador } from './entities/contrato-trabajador.entity';
import { LessThan, Repository } from 'typeorm';
import { EstadoContratoEnum } from 'src/enums/contrato-trabajador.enum';
import { HistorialContratoService } from '../historial-contrato/historial-contrato.service';
import { RenovacionContratoService } from '../renovacion-contrato/renovacion-contrato.service';
import { AccionHistorialEnum } from '../historial-contrato/dto/create-historial-contrato.dto';
import { TrabajadorService } from 'src/trabajador/trabajador.service';

@Injectable()
export class ContratoTrabajadorService {

  constructor(
    @InjectRepository(ContratoTrabajador)
    private readonly contratoTrabajoRepository: Repository<ContratoTrabajador>,
    private readonly historialContratoService: HistorialContratoService,
    private readonly renovacionContratoService: RenovacionContratoService,
    @Inject(forwardRef(() => TrabajadorService))
    private readonly trabajadorRepository: TrabajadorService

  ) { }

  async create(createContratoTrabajadorDto: CreateContratoTrabajadorDto, currentUser: any): Promise<ContratoTrabajador> {
    try {
      // Validar que el usuario no tenga el rol de DOCENTE
      const trabajadorEncontrado = await this.trabajadorRepository.findOne(currentUser);
      if (trabajadorEncontrado.idRol.nombre === 'DOCENTE') {
        throw new ForbiddenException('Los usuarios con rol DOCENTE no pueden crear contratos.');
      }
      const contratoActivoExistente = await this.contratoTrabajoRepository.findOne({
        where: {
          idTrabajador2: { idTrabajador: createContratoTrabajadorDto.idTrabajador },
          estadoContrato: 'activo',
        },
      });
      if (contratoActivoExistente) {
        // este error es para indicar que el trabajador ya tiene un contrato activo
        throw new ConflictException('El trabajador ya tiene un contrato activo.');
      }

      const numeroExistente = await this.contratoTrabajoRepository.findOne({
        where: { numeroContrato: createContratoTrabajadorDto.numeroContrato },
      });

      if (numeroExistente) {
        throw new ConflictException('El número de contrato ya está en uso.');
      }

      // Extraer los campos que son relaciones
      const { aprobadoPor, creadoPor, idTipoContrato, ...contratoData } = createContratoTrabajadorDto;

      const contrato = this.contratoTrabajoRepository.create({
        ...contratoData,
        estadoContrato: createContratoTrabajadorDto.estadoContrato || EstadoContratoEnum.ACTIVO,
        horasSemanales: createContratoTrabajadorDto.horasSemanales || 40,
        renovacionAutomatica: createContratoTrabajadorDto.renovacionAutomatica || false,
        diasAvisoRenovacion: createContratoTrabajadorDto.diasAvisoRenovacion || 30,
        creadoEn: new Date(),
        actualizadoEn: new Date(),
        // Configurar las relaciones correctamente
        ...(aprobadoPor && { aprobadoPor: { idTrabajador: aprobadoPor } }),
        ...(creadoPor && { creadoPor: { idTrabajador: creadoPor } }),
        ...(idTipoContrato && { idTipoContrato: { idTipoContrato: idTipoContrato } }),
      });

      return await this.contratoTrabajoRepository.save(contrato);
    }
    catch (error) {
      if (error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Error al crear el contrato: ' + error.message);
    }
  }


  async findAll(filtros?: FiltrosContratoDto): Promise<ContratoTrabajador[]> {
    const query = this.contratoTrabajoRepository.createQueryBuilder('contrato')
      .leftJoinAndSelect('contrato.idTrabajador2', 'trabajador')
      .leftJoinAndSelect('contrato.idTipoContrato', 'tipoContrato')
      .leftJoinAndSelect('contrato.creadoPor', 'creador')
      .leftJoinAndSelect('contrato.aprobadoPor', 'aprobador');

    if (filtros) {
      if (filtros.estadoContrato) {
        query.andWhere('contrato.estadoContrato = :estadoContrato', {
          estadoContrato: filtros.estadoContrato
        });
      }

      if (filtros.jornadaLaboral) {
        query.andWhere('contrato.jornadaLaboral = :jornadaLaboral', {
          jornadaLaboral: filtros.jornadaLaboral
        });
      }

      if (filtros.idTrabajador) {
        query.andWhere('contrato.idTrabajador = :idTrabajador', {
          idTrabajador: filtros.idTrabajador
        });
      }

      if (filtros.fechaInicioDesde && filtros.fechaInicioHasta) {
        query.andWhere('contrato.fechaInicio BETWEEN :fechaDesde AND :fechaHasta', {
          fechaDesde: filtros.fechaInicioDesde,
          fechaHasta: filtros.fechaInicioHasta
        });
      }

      if (filtros.proximosAVencer) {
        const fechaLimite = new Date();
        fechaLimite.setDate(fechaLimite.getDate() + filtros.proximosAVencer);
        query.andWhere('contrato.fechaFin <= :fechaLimite', {
          fechaLimite: fechaLimite.toISOString().split('T')[0]
        })
          .andWhere('contrato.estadoContrato = :estado', { estado: EstadoContratoEnum.ACTIVO });
      }
    }

    return await query.orderBy('contrato.fechaInicio', 'DESC').getMany();
  }

  async findOne(id: string): Promise<ContratoTrabajador> {
    const contrato = await this.contratoTrabajoRepository.findOne({
      where: { idContrato: id },
      relations: [
        'idTrabajador2',
        'idTipoContrato',
        'creadoPor',
        'aprobadoPor',
        'alertaContratoes',
        'historialContratoes'
      ]
    });

    if (!contrato) {
      throw new NotFoundException(`Contrato con ID ${id} no encontrado`);
    }

    return contrato;
  }

  async findByTrabajador(idTrabajador: string): Promise<ContratoTrabajador[]> {
    return await this.contratoTrabajoRepository.find({
      where: { idTrabajador },
      relations: ['idTipoContrato', 'creadoPor', 'aprobadoPor'],
      order: { fechaInicio: 'DESC' }
    });
  }

  async findContratoActivo(idTrabajador: string): Promise<ContratoTrabajador | null> {
    return await this.contratoTrabajoRepository.findOne({
      where: {
        idTrabajador,
        estadoContrato: EstadoContratoEnum.ACTIVO
      },
      relations: ['idTipoContrato', 'idTrabajador2']
    });
  }

  async update(id: string, updateContratoTrabajadorDto: UpdateContratoTrabajadorDto): Promise<ContratoTrabajador> {
    const contrato = await this.findOne(id);

    // Si se está actualizando el número de contrato, verificar que no exista
    if (updateContratoTrabajadorDto.numeroContrato &&
      updateContratoTrabajadorDto.numeroContrato !== contrato.numeroContrato) {
      const numeroExistente = await this.contratoTrabajoRepository.findOne({
        where: { numeroContrato: updateContratoTrabajadorDto.numeroContrato }
      });

      if (numeroExistente) {
        throw new ConflictException('El número de contrato ya existe');
      }
    }

    Object.assign(contrato, {
      ...updateContratoTrabajadorDto,
      actualizadoEn: new Date()
    });

    try {
      return await this.contratoTrabajoRepository.save(contrato);
    } catch (error) {
      throw new BadRequestException('Error al actualizar el contrato: ' + error.message);
    }
  }

  async finalizarContrato(id: string, motivoFinalizacion: string, fechaFinalizacion?: string): Promise<ContratoTrabajador> {
    const contrato = await this.findOne(id);

    if (contrato.estadoContrato === EstadoContratoEnum.FINALIZADO) {
      throw new BadRequestException('El contrato ya está finalizado');
    }

    contrato.estadoContrato = EstadoContratoEnum.FINALIZADO;
    contrato.motivoFinalizacion = motivoFinalizacion;
    contrato.fechaFinalizacionReal = fechaFinalizacion || new Date().toISOString().split('T')[0];
    contrato.actualizadoEn = new Date();

    return await this.contratoTrabajoRepository.save(contrato);
  }

  async renovarContrato(
    id: string,
    nuevaFechaFin: string,
    observaciones?: string,
    realizadoPor?: string,
    ipUsuario?: string
  ): Promise<{
    contrato: ContratoTrabajador;
    historial: any;
    renovacion: any;
    mensaje: string;
  }> {
    const contrato = await this.findOne(id);

    if (contrato.estadoContrato !== EstadoContratoEnum.ACTIVO) {
      throw new BadRequestException('Solo se pueden renovar contratos activos');
    }

    // Validar que la nueva fecha sea posterior a la actual
    const fechaActual = new Date();
    const nuevaFecha = new Date(nuevaFechaFin);
    if (nuevaFecha <= fechaActual) {
      throw new BadRequestException('La nueva fecha de fin debe ser posterior a la fecha actual');
    }

    try {
      // Guardar datos anteriores para el historial
      const fechaFinAnterior = contrato.fechaFin;
      const sueldoAnterior = contrato.sueldoContratado;

      // Calcular duración anterior y nueva
      const duracionAnterior = fechaFinAnterior ?
        this.calcularMesesEntreFechas(contrato.fechaInicio, fechaFinAnterior) : null;
      const duracionNueva = this.calcularMesesEntreFechas(contrato.fechaInicio, nuevaFechaFin);

      // Actualizar el contrato
      contrato.fechaFin = nuevaFechaFin;
      if (observaciones) {
        contrato.observacionesContrato = observaciones;
      }
      contrato.actualizadoEn = new Date();

      const contratoActualizado = await this.contratoTrabajoRepository.save(contrato);

      // Crear registro en historial usando el service especializado
      const historialCreado = await this.historialContratoService.crearRegistroHistorial({
        idContrato: contrato.idContrato,
        idTrabajador: contrato.idTrabajador,
        accion: AccionHistorialEnum.RENOVACION,
        estadoAnterior: EstadoContratoEnum.ACTIVO,
        estadoNuevo: EstadoContratoEnum.ACTIVO,
        campoModificado: 'fecha_fin',
        valorAnterior: fechaFinAnterior || 'Sin fecha definida',
        valorNuevo: nuevaFechaFin,
        motivo: 'Renovación de contrato',
        observaciones: observaciones || 'Renovación del contrato con nueva fecha de finalización',
        realizadoPor: realizadoPor || contrato.creadoPor?.idTrabajador || 'SISTEMA',
        ipUsuario: ipUsuario
      });

      // Crear registro de renovación usando el service especializado
      const renovacionCreada = await this.renovacionContratoService.create({
        idContratoAnterior: contrato.idContrato,
        idContratoNuevo: contrato.idContrato, // Es el mismo contrato renovado
        fechaRenovacion: new Date().toISOString().split('T')[0],
        motivoRenovacion: observaciones || 'Extensión de contrato',
        cambiosRealizados: `Fecha fin actualizada de ${fechaFinAnterior || 'indefinida'} a ${nuevaFechaFin}. Duración: ${duracionNueva} meses.`,
        sueldoAnterior: sueldoAnterior,
        sueldoNuevo: sueldoAnterior, // En renovaciones simples el sueldo no cambia
        duracionAnteriorMeses: duracionAnterior || undefined,
        duracionNuevaMeses: duracionNueva,
        observaciones: observaciones,
        aprobadoPor: realizadoPor || contrato.creadoPor?.idTrabajador || 'SISTEMA'
      });

      return {
        contrato: contratoActualizado,
        historial: historialCreado,
        renovacion: renovacionCreada,
        mensaje: `Contrato renovado exitosamente hasta ${nuevaFechaFin}. Se ha creado el registro en el historial automáticamente.`
      };

    } catch (error) {
      throw new BadRequestException('Error al renovar el contrato: ' + error.message);
    }
  }

  /**
   * Método auxiliar para calcular meses entre dos fechas
   */
  private calcularMesesEntreFechas(fechaInicio: string, fechaFin: string): number {
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);

    const años = fin.getFullYear() - inicio.getFullYear();
    const meses = fin.getMonth() - inicio.getMonth();

    return años * 12 + meses;
  }

  async getContratosProximosAVencer(dias: number = 30): Promise<ContratoTrabajador[]> {
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() + dias);

    return await this.contratoTrabajoRepository.find({
      where: {
        estadoContrato: EstadoContratoEnum.ACTIVO,
        fechaFin: LessThan(fechaLimite.toISOString().split('T')[0])
      },
      relations: ['idTrabajador2', 'idTipoContrato'],
      order: { fechaFin: 'ASC' }
    });
  }

  async remove(id: string): Promise<void> {
    const contrato = await this.findOne(id);

    if (contrato.estadoContrato === EstadoContratoEnum.ACTIVO) {
      throw new BadRequestException('No se puede eliminar un contrato activo. Debe finalizarlo primero.');
    }

    await this.contratoTrabajoRepository.remove(contrato);
  }

  /**
   * Método para obtener estadísticas de contratos
   */
  async getEstadisticasContratos() {
    const [
      totalContratos,
      contratosActivos,
      contratosFinalizados,
      contratosSuspendidos
    ] = await Promise.all([
      this.contratoTrabajoRepository.count(),
      this.contratoTrabajoRepository.count({ where: { estadoContrato: EstadoContratoEnum.ACTIVO } }),
      this.contratoTrabajoRepository.count({ where: { estadoContrato: EstadoContratoEnum.FINALIZADO } }),
      this.contratoTrabajoRepository.count({ where: { estadoContrato: EstadoContratoEnum.SUSPENDIDO } })
    ]);

    const proximosAVencer = await this.getContratosProximosAVencer();

    return {
      totalContratos,
      contratosActivos,
      contratosFinalizados,
      contratosSuspendidos,
      proximosAVencer: proximosAVencer.length,
      contratosProximosDetalle: proximosAVencer
    };
  }

  /**
   * Método para renovar múltiples contratos (renovación masiva)
   */
  async renovarContratosMasivo(
    contratos: Array<{
      idContrato: string;
      nuevaFechaFin: string;
      observaciones?: string;
    }>,
    realizadoPor: string,
    ipUsuario?: string
  ): Promise<{
    exitosos: Array<{
      idContrato: string;
      numeroContrato: string;
      trabajador: string;
      nuevaFechaFin: string;
      mensaje: string;
    }>;
    fallidos: Array<{
      idContrato: string;
      error: string;
    }>;
    total: number;
  }> {
    const resultados = {
      exitosos: [] as Array<{
        idContrato: string;
        numeroContrato: string;
        trabajador: string;
        nuevaFechaFin: string;
        mensaje: string;
      }>,
      fallidos: [] as Array<{
        idContrato: string;
        error: string;
      }>,
      total: contratos.length
    };

    for (const contratoData of contratos) {
      try {
        const resultado = await this.renovarContrato(
          contratoData.idContrato,
          contratoData.nuevaFechaFin,
          contratoData.observaciones,
          realizadoPor,
          ipUsuario
        );

        resultados.exitosos.push({
          idContrato: contratoData.idContrato,
          numeroContrato: resultado.contrato.numeroContrato,
          trabajador: `${resultado.contrato.idTrabajador2?.nombre || ''} ${resultado.contrato.idTrabajador2?.apellido || ''}`.trim(),
          nuevaFechaFin: contratoData.nuevaFechaFin,
          mensaje: 'Renovado exitosamente'
        });
      } catch (error) {
        resultados.fallidos.push({
          idContrato: contratoData.idContrato,
          error: error.message
        });
      }
    }

    return resultados;
  }
}
