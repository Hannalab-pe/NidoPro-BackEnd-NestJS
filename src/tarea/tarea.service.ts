// En src/tarea/tarea.service.ts

import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateTareaDto } from './dto/create-tarea.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Tarea } from './entities/tarea.entity';
import { TareaEntrega } from '../tarea-entrega/entities/tarea-entrega.entity';
import { Repository, DataSource } from 'typeorm';
import { AulaService } from '../aula/aula.service';
import { TrabajadorService } from '../trabajador/trabajador.service';
import { MatriculaAulaService } from '../matricula-aula/matricula-aula.service';

@Injectable()
export class TareaService {
  constructor(
    @InjectRepository(Tarea) private readonly tareaRepository: Repository<Tarea>,
    private readonly aulaService: AulaService,
    private readonly trabajadorService: TrabajadorService,
    private readonly matriculaAulaService: MatriculaAulaService,
    private readonly dataSource: DataSource
  ) { }

  async create(createTareaDto: CreateTareaDto): Promise<any> {
    return await this.dataSource.transaction(async manager => {

      // 1. VALIDAR AULA (usando tu método existente)
      const aula = await this.aulaService.findOne(createTareaDto.idAula);
      if (!aula) {
        throw new NotFoundException("Aula no encontrada");
      }

      // 2. VALIDAR TRABAJADOR (usando tu método existente)
      const trabajador = await this.trabajadorService.findOne(createTareaDto.idTrabajador);
      if (!trabajador) {
        throw new NotFoundException("Trabajador no encontrado");
      }

      // 3. VALIDAR QUE EL TRABAJADOR SEA DOCENTE (usando tu enum de roles)
      if (trabajador.idRol.nombre !== 'DOCENTE') {
        throw new BadRequestException("Solo los docentes pueden asignar tareas");
      }

      // 4. VALIDAR FECHA DE ENTREGA
      const fechaActual = new Date();
      const fechaEntrega = new Date(createTareaDto.fechaEntrega);

      if (fechaEntrega < fechaActual) {
        throw new BadRequestException("La fecha de entrega no puede ser anterior a la fecha actual");
      }

      // 5. CREAR LA TAREA
      const tarea = manager.create(Tarea, {
        titulo: createTareaDto.titulo,
        descripcion: createTareaDto.descripcion || null,
        fechaEntrega: createTareaDto.fechaEntrega,
        estado: createTareaDto.estado || 'pendiente',
        aula: { idAula: createTareaDto.idAula },
        idTrabajador: { idTrabajador: createTareaDto.idTrabajador }
      });

      const tareaGuardada = await manager.save(Tarea, tarea);

      // 6. OBTENER ESTUDIANTES DEL AULA (usando tu método existente)
      const estudiantesAula = await this.matriculaAulaService.obtenerEstudiantesDelAula(createTareaDto.idAula);

      // 7. CREAR ENTREGAS AUTOMÁTICAMENTE PARA CADA ESTUDIANTE
      const entregasCreadas: TareaEntrega[] = [];
      for (const estudianteAula of estudiantesAula) {
        const tareaEntrega = manager.create(TareaEntrega, {
          idTarea: tareaGuardada.idTarea,
          idEstudiante: estudianteAula.matricula.idEstudiante.idEstudiante,
          estado: 'pendiente',
          fechaEntrega: createTareaDto.fechaEntrega
        });

        const entregaGuardada = await manager.save(TareaEntrega, tareaEntrega);
        entregasCreadas.push(entregaGuardada);
      }

      // 8. CARGAR TAREA COMPLETA CON RELACIONES
      const tareaCompleta = await manager.findOne(Tarea, {
        where: { idTarea: tareaGuardada.idTarea },
        relations: [
          'aula',
          'aula.idGrado',
          'idTrabajador',
          'idTrabajador.idRol',
          'tareaEntregas',
          'tareaEntregas.idEstudiante2'
        ]
      });

      return {
        success: true,
        message: `Tarea "${createTareaDto.titulo}" creada y asignada a ${entregasCreadas.length} estudiantes del aula ${aula.seccion}`,
        tarea: tareaCompleta,
        entregasCreadas: entregasCreadas.length,
        estudiantesAsignados: estudiantesAula.map(ea => ({
          idEstudiante: ea.matricula.idEstudiante.idEstudiante,
          nombre: `${ea.matricula.idEstudiante.nombre} ${ea.matricula.idEstudiante.apellido}`
        }))
      };
    });
  }

  // Método complementario que necesitarás
  async findOne(id: string): Promise<Tarea | null> {
    return await this.tareaRepository.findOne({
      where: { idTarea: id },
      relations: [
        'aula',
        'aula.idGrado',
        'idTrabajador',
        'idTrabajador.idRol',
        'tareaEntregas',
        'tareaEntregas.idEstudiante2'
      ]
    });
  }

  async findByAula(idAula: string): Promise<Tarea[]> {
    return await this.tareaRepository.find({
      where: { aula: { idAula } },
      relations: ['aula', 'idTrabajador', 'tareaEntregas'],
      order: { fechaAsignacion: 'DESC' }
    });
  }
}