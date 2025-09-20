import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCronogramaDto } from './dto/create-cronograma.dto';
import { UpdateCronogramaDto } from './dto/update-cronograma.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Cronograma } from './entities/cronograma.entity';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class CronogramaService {
  constructor(
    @InjectRepository(Cronograma)
    private readonly cronogramaRepository: Repository<Cronograma>,
    private readonly dataSource: DataSource,
  ) { }

  async create(createCronogramaDto: CreateCronogramaDto): Promise<{ success: boolean; message: string; cronogramas: Cronograma[] }> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const cronogramasCreados: Cronograma[] = [];

      // Crear un cronograma por cada aula especificada
      for (const idAula of createCronogramaDto.idAulas) {
        const cronogramaData = {
          nombreActividad: createCronogramaDto.nombreActividad,
          descripcion: createCronogramaDto.descripcion,
          fechaInicio: createCronogramaDto.fechaInicio,
          fechaFin: createCronogramaDto.fechaFin,
          idAula: { idAula: idAula },
          idTrabajador: { idTrabajador: createCronogramaDto.idTrabajador },
        };

        const cronograma = queryRunner.manager.create(Cronograma, cronogramaData);
        const savedCronograma = await queryRunner.manager.save(cronograma);
        cronogramasCreados.push(savedCronograma);
      }

      // Si todo sale bien, confirmar la transacción
      await queryRunner.commitTransaction();

      return {
        success: true,
        message: `Cronograma "${createCronogramaDto.nombreActividad}" creado correctamente para ${cronogramasCreados.length} aula(s)`,
        cronogramas: cronogramasCreados,
      };
    } catch (error) {
      // Si algo falla, hacer rollback
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(
        'Error al crear cronograma: ' + error.message,
      );
    } finally {
      // Liberar el queryRunner
      await queryRunner.release();
    }
  }

  async findAll(): Promise<Cronograma[]> {
    return await this.cronogramaRepository.find();
  }

  async findOne(id: string): Promise<Cronograma | null> {
    return await this.cronogramaRepository.findOne({
      where: { idCronograma: id },
    });
  }

  async update(
    id: string,
    updateCronogramaDto: UpdateCronogramaDto,
  ): Promise<Cronograma | null> {
    const cronogramaFound = await this.cronogramaRepository.findOne({
      where: { idCronograma: id },
    });
    if (!cronogramaFound) {
      throw new NotFoundException(`Cronograma with id ${id} not found`);
    }

    const updateData: any = {
      nombreActividad: updateCronogramaDto.nombreActividad,
      descripcion: updateCronogramaDto.descripcion,
      fechaInicio: updateCronogramaDto.fechaInicio,
      fechaFin: updateCronogramaDto.fechaFin,
    };

    // Nota: Para actualizar solo se puede cambiar a una sola aula
    // Si necesitas cambiar a múltiples aulas, considera eliminar y recrear
    if (updateCronogramaDto.idAulas && updateCronogramaDto.idAulas.length > 0) {
      if (updateCronogramaDto.idAulas.length > 1) {
        throw new BadRequestException(
          'Para actualizar a múltiples aulas, elimine el cronograma y créelo nuevamente'
        );
      }
      updateData.idAula = { idAula: updateCronogramaDto.idAulas[0] };
    }

    if (updateCronogramaDto.idTrabajador) {
      updateData.idTrabajador = {
        idTrabajador: updateCronogramaDto.idTrabajador,
      };
    }

    await this.cronogramaRepository.update({ idCronograma: id }, updateData);
    return this.findOne(id);
  }

  async findCronogramaPorAula(
    idAula: string,
  ): Promise<{ success: boolean; message: string; cronogramas: any[] }> {
    try {
      // Validar que el ID del aula esté presente
      if (!idAula) {
        throw new BadRequestException('El ID del aula es requerido');
      }

      // Ejecutar la consulta para obtener el cronograma del aula con información relacionada
      const cronogramas = await this.dataSource.query(
        `
        SELECT 
          c.id_cronograma,
          c.nombre_actividad,
          c.descripcion,
          c.fecha_inicio,
          c.fecha_fin,
          au.seccion,
          g.grado,
          t.nombre as nombre_trabajador,
          t.apellido as apellido_trabajador
        FROM cronograma c
        INNER JOIN aula au ON au.id_aula = c.id_aula
        INNER JOIN grado g ON g.id_grado = au.id_grado
        INNER JOIN trabajador t ON t.id_trabajador = c.id_trabajador
        WHERE c.id_aula = $1
        ORDER BY c.fecha_inicio, c.nombre_actividad;
      `,
        [idAula],
      );

      return {
        success: true,
        message:
          cronogramas.length > 0
            ? `Se encontraron ${cronogramas.length} actividad(es) en el cronograma del aula`
            : 'No se encontraron actividades en el cronograma de esta aula',
        cronogramas,
      };
    } catch (error) {
      throw new BadRequestException(
        `Error al buscar cronograma por aula: ${error.message}`,
      );
    }
  }
}
