import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTrabajadorDto } from './dto/create-trabajador.dto';
import { UpdateTrabajadorDto } from './dto/update-trabajador.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Trabajador } from './entities/trabajador.entity';
import { DataSource, QueryRunner, Repository, In } from 'typeorm';
import { UsuarioService } from '../usuario/usuario.service';
import { CreateUsuarioDto } from 'src/usuario/dto/create-usuario.dto';
import { Usuario } from 'src/usuario/entities/usuario.entity';
import { Rol } from '../rol/entities/rol.entity';
import { UserRole } from '../enums/roles.enum';

@Injectable()
export class TrabajadorService {
  constructor(
    @InjectRepository(Trabajador)
    private readonly trabajadorRepository: Repository<Trabajador>,
    @InjectRepository(Rol)
    private readonly rolRepository: Repository<Rol>,
    private readonly usuarioService: UsuarioService,
    private readonly dataSource: DataSource,
  ) { }

  async create(
    createTrabajadorDto: CreateTrabajadorDto,
  ): Promise<{ success: boolean; message: string; trabajador: Trabajador }> {
    // Validar que el rol existe y es válido para trabajadores
    const rol = await this.rolRepository.findOne({
      where: { idRol: createTrabajadorDto.idRol, estaActivo: true },
    });

    if (!rol) {
      throw new BadRequestException(
        'El rol especificado no existe o está inactivo',
      );
    }

    // Validar que el rol es apropiado para trabajadores (no ESTUDIANTE)
    const rolesValidosParaTrabajadores = [
      UserRole.DIRECTORA,
      UserRole.SECRETARIA,
      UserRole.DOCENTE,
    ];

    if (!rolesValidosParaTrabajadores.includes(rol.nombre as UserRole)) {
      throw new BadRequestException(
        `El rol "${rol.nombre}" no es válido para trabajadores. Roles válidos: ${rolesValidosParaTrabajadores.join(', ')}`,
      );
    }

    // Verificar que no exista un trabajador con el mismo número de documento
    const trabajadorExistente = await this.trabajadorRepository.findOne({
      where: { nroDocumento: createTrabajadorDto.nroDocumento },
    });

    if (trabajadorExistente) {
      throw new BadRequestException(
        `Ya existe un trabajador con el número de documento: ${createTrabajadorDto.nroDocumento}`,
      );
    }

    // Crear un queryRunner para manejar la transacción
    const queryRunner = this.dataSource.createQueryRunner();

    // Establecer conexión y comenzar transacción
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Crear usuario dentro de la transacción
      const nuevoUsuario = await this.usuarioService.createWithQueryRunner(
        {
          usuario: createTrabajadorDto.nroDocumento,
          contrasena: createTrabajadorDto.nroDocumento, // Contraseña temporal = número de documento
          estaActivo: true,
        },
        queryRunner,
      );

      // Crear trabajador dentro de la misma transacción
      const trabajador = queryRunner.manager.create(Trabajador, {
        ...createTrabajadorDto,
        idRol: { idRol: createTrabajadorDto.idRol } as any,
        idUsuario: { idUsuario: nuevoUsuario.usuario.idUsuario } as any,
      });

      const savedTrabajador = await queryRunner.manager.save(trabajador);

      // Si todo sale bien, confirmar la transacción
      await queryRunner.commitTransaction();

      // Cargar el trabajador completo con relaciones
      const trabajadorCompleto = await this.trabajadorRepository.findOne({
        where: { idTrabajador: savedTrabajador.idTrabajador },
        relations: ['idRol', 'idUsuario'],
      });

      if (!trabajadorCompleto) {
        throw new BadRequestException('Error al cargar el trabajador creado');
      }

      return {
        success: true,
        message: `Trabajador creado correctamente con rol: ${rol.nombre}. Usuario: ${createTrabajadorDto.nroDocumento}, Contraseña temporal: ${createTrabajadorDto.nroDocumento}`,
        trabajador: trabajadorCompleto,
      };
    } catch (error) {
      // Si algo falla, hacer rollback
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(
        'Error al crear trabajador: ' + error.message,
      );
    } finally {
      // Liberar el queryRunner
      await queryRunner.release();
    }
  }

  async findAll(): Promise<{
    sucess: boolean;
    message: string;
    trabajadores: Trabajador[];
  }> {
    const trabajadores = await this.trabajadorRepository.find({
      relations: ['idRol', 'idUsuario'],
    });
    return {
      sucess: true,
      message: 'Trabajadores encontrados correctamente',
      trabajadores,
    };
  }

  async findOne(id: string): Promise<Trabajador> {
    const trabajador = await this.trabajadorRepository.findOne({
      where: { idTrabajador: id, estaActivo: true },
      relations: [
        // Relaciones principales
        'idRol',
        'idUsuario',
        // Asignaciones
        'asignacionAulas',
        'asignacionAulas.idAula',
        'asignacionAulas.idAula.idGrado',
        'asignacionCursos',
        'asignacionCursos.idCurso',
        // Contratos y seguros
        'contratoTrabajadors3', // Como trabajador
        'seguroTrabajadors2', // Como trabajador asegurado
        'sueldoTrabajadors2', // Como trabajador con sueldo
        // Cronogramas y tareas
        'cronogramas',
        'tareas',
        // Planillas y detalles
        'detallePlanillas',
        'programacionMensuals',
        // Evaluaciones y observaciones como docente
        'evaluacionDocenteBimestrals2',
        'observacionDocentes2',
        // Informes
        'informes',
      ],
    });
    if (!trabajador) {
      throw new NotFoundException(`Trabajador con ID ${id} no encontrado`);
    }
    return trabajador;
  }

  async findByIds(ids: string[]): Promise<Trabajador[]> {
    if (!ids || ids.length === 0) {
      return [];
    }

    const trabajadores = await this.trabajadorRepository.find({
      where: {
        idTrabajador: In(ids),
        estaActivo: true,
      },
      relations: ['idRol', 'idUsuario'],
    });

    return trabajadores;
  }

  async update(
    id: string,
    updateTrabajadorDto: UpdateTrabajadorDto,
  ): Promise<{ sucess: boolean; message: string; trabajador: Trabajador }> {
    const trabajador = await this.findOne(id);
    const updateData: any = { ...updateTrabajadorDto };

    if (updateTrabajadorDto.idRol) {
      updateData.idRol = { idRol: updateTrabajadorDto.idRol };
    }

    await this.trabajadorRepository.update(id, updateData);
    const updatedTrabajador = await this.findOne(id);
    return {
      sucess: true,
      message: 'Trabajador actualizado correctamente',
      trabajador: updatedTrabajador,
    };
  }

  async remove(id: string): Promise<{ message: string }> {
    const trabajador = await this.findOne(id);
    trabajador.estaActivo = false;
    await this.trabajadorRepository.update(id, trabajador);
    return {
      message: `Trabajador ${trabajador.nombre} ${trabajador.apellido} desactivado correctamente`,
    };
  }

  async findAulasPorTrabajador(
    idTrabajador: string,
  ): Promise<{ success: boolean; message: string; aulas: any[] }> {
    try {
      // Validar que el ID del trabajador esté presente
      if (!idTrabajador) {
        throw new BadRequestException('El ID del trabajador es requerido');
      }

      // Ejecutar la consulta SQL personalizada
      const aulas = await this.dataSource.query(
        `
        SELECT t.nombre, au.id_aula, au.seccion, g.grado   
        FROM trabajador t
        INNER JOIN asignacion_aula aa ON aa.id_trabajador = t.id_trabajador 
        INNER JOIN aula au ON au.id_aula = aa.id_aula 
        INNER JOIN grado g ON g.id_grado = au.id_grado 
        WHERE t.id_trabajador = $1
        ORDER BY g.grado, au.seccion;
      `,
        [idTrabajador],
      );

      return {
        success: true,
        message:
          aulas.length > 0
            ? `Se encontraron ${aulas.length} aula(s) asignada(s) al trabajador`
            : 'No se encontraron aulas asignadas a este trabajador',
        aulas,
      };
    } catch (error) {
      throw new BadRequestException(
        `Error al buscar aulas por trabajador: ${error.message}`,
      );
    }
  }
}
