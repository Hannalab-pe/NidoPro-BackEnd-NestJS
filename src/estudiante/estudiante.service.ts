import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateEstudianteDto } from './dto/create-estudiante.dto';
import { UpdateEstudianteDto } from './dto/update-estudiante.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Estudiante } from './entities/estudiante.entity';
import { DataSource, Repository } from 'typeorm';
import { UsuarioService } from '../usuario/usuario.service';
import { Rol } from '../rol/entities/rol.entity';
import { UserRole } from '../enums/roles.enum';

@Injectable()
export class EstudianteService {
  constructor(
    @InjectRepository(Estudiante)
    private readonly estudianteRepository: Repository<Estudiante>,
    @InjectRepository(Rol)
    private readonly rolRepository: Repository<Rol>,
    private readonly usuarioService: UsuarioService,
    private readonly dataSource: DataSource,
  ) { }

  async create(
    createEstudianteDto: CreateEstudianteDto,
  ): Promise<{ sucess: boolean; message: string; estudiante: Estudiante }> {
    // Validar que el DNI esté presente
    if (!createEstudianteDto.nroDocumento) {
      throw new BadRequestException(
        'El número de documento es requerido para crear un estudiante',
      );
    }

    // Validar que el rol existe y es válido para estudiantes
    const rol = await this.rolRepository.findOne({
      where: { idRol: createEstudianteDto.idRol, estaActivo: true },
    });

    if (!rol) {
      throw new BadRequestException(
        'El rol especificado no existe o está inactivo',
      );
    }

    // Validar que el rol es apropiado para estudiantes
    const rolesValidosParaEstudiantes = [
      UserRole.ESTUDIANTE,
      UserRole.APODERADO,
    ];

    if (!rolesValidosParaEstudiantes.includes(rol.nombre as UserRole)) {
      throw new BadRequestException(
        `El rol "${rol.nombre}" no es válido para estudiantes. Roles válidos: ${rolesValidosParaEstudiantes.join(', ')}`,
      );
    }

    // Verificar que no exista un estudiante con el mismo número de documento
    const estudianteExistente = await this.estudianteRepository.findOne({
      where: { nroDocumento: createEstudianteDto.nroDocumento },
    });

    if (estudianteExistente) {
      throw new BadRequestException(
        `Ya existe un estudiante con el número de documento: ${createEstudianteDto.nroDocumento}`,
      );
    }

    // Crear un queryRunner para manejar la transacción
    const queryRunner = this.dataSource.createQueryRunner();

    // Establecer conexión y comenzar transacción
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Crear usuario dentro de la transacción con contraseña hasheada
      const nuevoUsuario = await this.usuarioService.createWithQueryRunner(
        {
          usuario: createEstudianteDto.nroDocumento,
          contrasena: createEstudianteDto.nroDocumento, // Contraseña temporal = número de documento
          estaActivo: true,
        },
        queryRunner,
      );

      // Crear estudiante dentro de la misma transacción
      const estudiante = queryRunner.manager.create(Estudiante, {
        ...createEstudianteDto,
        idRol: { idRol: createEstudianteDto.idRol } as any,
        id_Usuario: nuevoUsuario.usuario.idUsuario,
      });

      const savedEstudiante = await queryRunner.manager.save(estudiante);

      // Si todo sale bien, confirmar la transacción
      await queryRunner.commitTransaction();

      // Cargar el estudiante completo con relaciones
      const estudianteCompleto = await this.estudianteRepository.findOne({
        where: { idEstudiante: savedEstudiante.idEstudiante },
        relations: ['idRol', 'idUsuario', 'contactosEmergencia'],
      });

      if (!estudianteCompleto) {
        throw new BadRequestException('Error al cargar el estudiante creado');
      }

      return {
        sucess: true,
        message: `Estudiante creado correctamente con rol: ${rol.nombre}. Usuario: ${createEstudianteDto.nroDocumento}, Contraseña temporal: ${createEstudianteDto.nroDocumento}`,
        estudiante: estudianteCompleto,
      };
    } catch (error) {
      // Si algo falla, hacer rollback
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(
        'Error al crear estudiante: ' + error.message,
      );
    } finally {
      // Liberar el queryRunner
      await queryRunner.release();
    }
  }

  async findByDocumento(dni: string): Promise<Estudiante> {
    const estudiante = await this.estudianteRepository.findOne({
      where: { nroDocumento: dni },
      relations: ['idUsuario', 'contactosEmergencia'],
    });
    if (!estudiante) {
      throw new NotFoundException(`Estudiante con DNI ${dni} no encontrado`);
    }
    return estudiante;
  }

  async findAll(): Promise<{
    sucess: boolean;
    message: string;
    estudiantes: Estudiante[];
  }> {
    const estudiantes = await this.estudianteRepository.find({
      relations: ['idUsuario', 'contactosEmergencia', 'matriculas.matriculaAula', 'matriculas.matriculaAula.aula', 'matriculas.matriculaAula.aula.idGrado'],
    });
    return {
      sucess: true,
      message: 'Estudiantes encontrados correctamente',
      estudiantes,
    };
  }

  async findOne(id: string): Promise<Estudiante> {
    const estudiante = await this.estudianteRepository
      .createQueryBuilder('estudiante')
      .leftJoinAndSelect('estudiante.idUsuario', 'usuario')
      .leftJoinAndSelect('estudiante.contactosEmergencia', 'contactos')
      .leftJoinAndSelect('estudiante.matriculas', 'matricula')
      .leftJoinAndSelect('matricula.matriculaAula', 'matriculaAula')
      .leftJoinAndSelect('matriculaAula.aula', 'aula')
      .leftJoinAndSelect('aula.idGrado', 'grado')
      .where('estudiante.idEstudiante = :id', { id })
      .getOne();

    if (!estudiante) {
      throw new NotFoundException(`Estudiante con ID ${id} no encontrado`);
    }
    return estudiante;
  }

  async update(
    id: string,
    updateEstudianteDto: UpdateEstudianteDto,
  ): Promise<{ sucess: boolean; message: string; estudiante: Estudiante }> {
    const estudiante = await this.findOne(id);
    const updateData: any = { ...updateEstudianteDto };

    if (updateEstudianteDto.idRol) {
      updateData.idRol = { idRol: updateEstudianteDto.idRol };
    }

    await this.estudianteRepository.update(id, updateData);
    const updatedEstudiante = await this.findOne(id);
    return {
      sucess: true,
      message: 'Estudiante actualizado correctamente',
      estudiante: updatedEstudiante,
    };
  }

  async remove(id: string): Promise<{ message: string }> {
    const estudiante = await this.findOne(id);
    await this.estudianteRepository.delete(id);
    return {
      message: `Estudiante ${estudiante.nombre} ${estudiante.apellido} eliminado correctamente`,
    };
  }

  async findEstudiantesPorAula(
    idAula: string,
  ): Promise<{ success: boolean; message: string; estudiantes: any[] }> {
    try {
      // Validar que el ID del aula esté presente
      if (!idAula) {
        throw new BadRequestException('El ID del aula es requerido');
      }

      // Ejecutar la consulta con QueryBuilder para obtener datos anidados
      const estudiantesRaw = await this.estudianteRepository
        .createQueryBuilder('estudiante')
        .leftJoinAndSelect('estudiante.contactosEmergencia', 'contactos')
        .leftJoinAndSelect('estudiante.matriculas', 'matricula')
        .leftJoinAndSelect('matricula.idApoderado', 'apoderado')
        .leftJoinAndSelect('matricula.idGrado', 'grado')
        .leftJoinAndSelect('matricula.matriculaAula', 'matriculaAula')
        .leftJoinAndSelect('matriculaAula.aula', 'aula')
        .where('aula.idAula = :idAula', { idAula })
        .andWhere('matriculaAula.estado = :estado', { estado: 'activo' })
        .orderBy('aula.seccion', 'ASC')
        .addOrderBy('estudiante.apellido', 'ASC')
        .addOrderBy('estudiante.nombre', 'ASC')
        .getMany();

      // Transformar los datos para una mejor estructura
      const estudiantes = estudiantesRaw.map(estudiante => {
        // Buscar la matrícula activa en el aula específica
        const matriculaActiva = estudiante.matriculas.find(
          matricula => matricula.matriculaAula?.aula?.idAula === idAula
        );

        return {
          // Información del estudiante
          idEstudiante: estudiante.idEstudiante,
          nombre: estudiante.nombre,
          apellido: estudiante.apellido,
          nombreCompleto: `${estudiante.nombre} ${estudiante.apellido}`,
          tipoDocumento: estudiante.tipoDocumento,
          nroDocumento: estudiante.nroDocumento,
          observaciones: estudiante.observaciones,
          imagenEstudiante: estudiante.imagen_estudiante,
          // Información de la matrícula activa
          infoApoderado: matriculaActiva ? {

            // Información del apoderado
            apoderado: matriculaActiva.idApoderado ? {
              idApoderado: matriculaActiva.idApoderado.idApoderado,
              nombre: matriculaActiva.idApoderado.nombre,
              apellido: matriculaActiva.idApoderado.apellido,
              nombreCompleto: `${matriculaActiva.idApoderado.nombre} ${matriculaActiva.idApoderado.apellido}`,
              numero: matriculaActiva.idApoderado.numero,
              correo: matriculaActiva.idApoderado.correo,
              direccion: matriculaActiva.idApoderado.direccion,
              documentoIdentidad: matriculaActiva.idApoderado.documentoIdentidad,
              tipoDocumentoIdentidad: matriculaActiva.idApoderado.tipoDocumentoIdentidad,
              esPrincipal: matriculaActiva.idApoderado.esPrincipal,
              tipoApoderado: matriculaActiva.idApoderado.tipoApoderado
            } : null,

            // Información del grado
            grado: matriculaActiva.idGrado ? {
              idGrado: matriculaActiva.idGrado.idGrado,
              grado: matriculaActiva.idGrado.grado,
              descripcion: matriculaActiva.idGrado.descripcion,
              estaActivo: matriculaActiva.idGrado.estaActivo
            } : null,

            // Información del aula
            aula: matriculaActiva.matriculaAula?.aula ? {
              idAula: matriculaActiva.matriculaAula.aula.idAula,
              seccion: matriculaActiva.matriculaAula.aula.seccion,
              cantidadEstudiantes: matriculaActiva.matriculaAula.aula.cantidadEstudiantes,
              fechaAsignacion: matriculaActiva.matriculaAula.fechaAsignacion,
              estado: matriculaActiva.matriculaAula.estado
            } : null
          } : null,

          // Contactos de emergencia
          contactosEmergencia: estudiante.contactosEmergencia?.map(contacto => ({
            idContacto: contacto.idContactoEmergencia,
            nombre: contacto.nombre,
            apellido: contacto.apellido,
            telefono: contacto.telefono,
            email: contacto.email,
            tipoContacto: contacto.tipoContacto,
            relacionEstudiante: contacto.relacionEstudiante,
            esPrincipal: contacto.esPrincipal,
            prioridad: contacto.prioridad,
            observaciones: contacto.observaciones,
            estaActivo: contacto.estaActivo
          })) || []
        };
      });

      return {
        success: true,
        message:
          estudiantes.length > 0
            ? `Se encontraron ${estudiantes.length} estudiante(s) en el aula`
            : 'No se encontraron estudiantes en esta aula',
        estudiantes,
      };
    } catch (error) {
      throw new BadRequestException(
        `Error al buscar estudiantes por aula: ${error.message}`,
      );
    }
  }
}
