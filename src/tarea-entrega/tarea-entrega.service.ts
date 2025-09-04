import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateTareaEntregaDto } from './dto/create-tarea-entrega.dto';
import { UpdateTareaEntregaDto } from './dto/update-tarea-entrega.dto';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { TareaEntrega } from './entities/tarea-entrega.entity';

@Injectable()
export class TareaEntregaService {

  constructor(@InjectRepository(TareaEntrega) private readonly tareaEntregaRepository: Repository<TareaEntrega>,
              private readonly datasource:DataSource) { }

  async registrarEntrega(createTareaEntregaDto: CreateTareaEntregaDto): Promise<any> {
    return await this.datasource.transaction(async manager => {

      // 1. VERIFICAR QUE LA ENTREGA EXISTE
      const entregaExistente = await this.findByEstudianteTarea( createTareaEntregaDto.idTarea, createTareaEntregaDto.idEstudiante
      );

      if (!entregaExistente) {
        throw new NotFoundException("No se encontró la asignación de tarea para este estudiante");
      }

      // 2. VERIFICAR QUE LA TAREA AÚN ESTÁ ACTIVA
      if (entregaExistente.idTarea2.estado === 'cerrada') {
        throw new BadRequestException("La tarea ya está cerrada y no acepta más registros");
      }

      // 3. VERIFICAR QUE NO ESTÉ YA REGISTRADA
      if (entregaExistente.estado === 'entregado' || entregaExistente.estado === 'revisado') {
        throw new BadRequestException("Esta tarea ya fue registrada previamente");
      }

      // 4. DETERMINAR ESTADO SEGÚN SI REALIZÓ LA TAREA Y LA FECHA
      const fechaActual = new Date();
      const fechaLimite = new Date(entregaExistente.idTarea2.fechaEntrega);

      let estadoFinal: string;
      if (createTareaEntregaDto.realizoTarea) {
        estadoFinal = fechaActual <= fechaLimite ? 'entregado' : 'tarde';
      } else {
        estadoFinal = 'no_realizado';
      }

      // 5. ACTUALIZAR LA ENTREGA
      entregaExistente.fechaEntrega = new Date().toISOString().split('T')[0];
      entregaExistente.archivoUrl = createTareaEntregaDto.archivoUrl || null;
      entregaExistente.estado = estadoFinal;

      const entregaActualizada = await manager.save(TareaEntrega, entregaExistente);

      // 6. AGREGAR OBSERVACIONES DEL DOCENTE (si las hay)
      let mensajeResultado = '';
      if (createTareaEntregaDto.realizoTarea) {
        mensajeResultado = estadoFinal === 'tarde'
          ? `Tarea registrada como realizada (fuera de plazo)`
          : `Tarea registrada como realizada exitosamente`;
      } else {
        mensajeResultado = `Registrado que el estudiante no realizó la tarea`;
      }

      return {
        success: true,
        message: mensajeResultado,
        entrega: entregaActualizada,
        realizoTarea: createTareaEntregaDto.realizoTarea,
        estadoFinal,
        observaciones: createTareaEntregaDto.observaciones,
        estudiante: {
          nombre: entregaExistente.idEstudiante2.nombre,
          apellido: entregaExistente.idEstudiante2.apellido
        },
        tarea: {
          titulo: entregaExistente.idTarea2.titulo,
          fechaLimite: entregaExistente.idTarea2.fechaEntrega
        }
      };
    });
  }



  findAll() {
    return `This action returns all tareaEntrega`;
  }

  async findByEstudianteTarea(idTarea: string, idEstudiante: string) {
    return await this.tareaEntregaRepository.createQueryBuilder('tareaEntrega')
      .leftJoinAndSelect('tareaEntrega.idTarea2', 'tarea')
      .leftJoinAndSelect('tareaEntrega.idEstudiante2', 'estudiante')
      .where('tareaEntrega.idTarea = :idTarea', { idTarea })
      .andWhere('tareaEntrega.idEstudiante = :idEstudiante', { idEstudiante })
      .getOne();
  }

  update(id: number, updateTareaEntregaDto: UpdateTareaEntregaDto) {
    return `This action updates a #${id} tareaEntrega`;
  }

  remove(id: number) {
    return `This action removes a #${id} tareaEntrega`;
  }
}
