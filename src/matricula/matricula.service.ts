import { Injectable } from '@nestjs/common';
import { CreateMatriculaDto } from './dto/create-matricula.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Matricula } from './entities/matricula.entity';
import { Repository, DataSource, SelectQueryBuilder } from 'typeorm';
import { ApoderadoService } from 'src/apoderado/apoderado.service';
import { EstudianteService } from 'src/estudiante/estudiante.service';
import { GradoService } from 'src/grado/grado.service';
import { SearchMatriculaDto } from './dto/search-matricula.dto';
import { MatriculaAula } from 'src/matricula-aula/entities/matricula-aula.entity';
import { AulaService } from 'src/aula/aula.service';
import { ContactoEmergencia } from 'src/contacto-emergencia/entities/contacto-emergencia.entity';

@Injectable()
export class MatriculaService {

  constructor(
    @InjectRepository(Matricula) private matriculaRepository: Repository<Matricula>,

    private readonly aulaRepository: AulaService,
    private apoderadoService: ApoderadoService,
    private estudianteService: EstudianteService,
    private gradoService: GradoService,
    private dataSource: DataSource
  ) { }

  async create(createMatriculaDto: CreateMatriculaDto): Promise<Matricula> {
    return await this.dataSource.transaction(async manager => {
      let apoderado: any = null;
      let estudiante: any = null;

      // === MANEJO DEL APODERADO ===

      // Si se proporciona ID, buscar por ID primero
      if (createMatriculaDto.idApoderado) {
        apoderado = await this.apoderadoService.findOne(createMatriculaDto.idApoderado);
      }

      // Si no se encontró por ID y se tienen datos, buscar por documento
      if (!apoderado && createMatriculaDto.apoderadoData?.documentoIdentidad) {
        // Buscar por documento si existe el método
        try {
          apoderado = await this.apoderadoService.findByDocumento(
            createMatriculaDto.apoderadoData.documentoIdentidad
          );
        } catch (error) {
          // Si no existe el método findByDocumento, continuamos
          apoderado = null;
        }
      }

      // Si aún no existe, crear nuevo apoderado
      if (!apoderado) {
        // Validar que se proporcionaron datos del apoderado
        if (!createMatriculaDto.apoderadoData) {
          throw new Error("Se requiere proporcionar idApoderado o apoderadoData para crear la matrícula");
        }

        // Validar campos requeridos para crear apoderado
        if (!createMatriculaDto.apoderadoData.nombre ||
          !createMatriculaDto.apoderadoData.apellido ||
          !createMatriculaDto.apoderadoData.tipoDocumentoIdentidad ||
          !createMatriculaDto.apoderadoData.documentoIdentidad) {
          throw new Error("Para crear un apoderado son requeridos: nombre, apellido, tipoDocumentoIdentidad y documentoIdentidad");
        }

        if (Array.isArray(createMatriculaDto.apoderadoData)) {
          createMatriculaDto.apoderadoData.forEach(apoderadoData => {
            const createApoderadoDto = {
              nombre: apoderadoData.nombre,
              apellido: apoderadoData.apellido,
              tipoDocumentoIdentidad: apoderadoData.tipoDocumentoIdentidad,
              documentoIdentidad: apoderadoData.documentoIdentidad,
            };
            apoderado = this.apoderadoService.create(createApoderadoDto);
          });
        }

        // Crear DTO para el servicio de apoderado
        const createApoderadoDto: any = {
          nombre: createMatriculaDto.apoderadoData.nombre,
          apellido: createMatriculaDto.apoderadoData.apellido,
          numero: createMatriculaDto.apoderadoData.numero || null,
          correo: createMatriculaDto.apoderadoData.correo || null,
          direccion: createMatriculaDto.apoderadoData.direccion || null,
          tipoDocumentoIdentidad: createMatriculaDto.apoderadoData.tipoDocumentoIdentidad,
          documentoIdentidad: createMatriculaDto.apoderadoData.documentoIdentidad,
          esPrincipal: createMatriculaDto.apoderadoData.esPrincipal ?? true, // Por defecto es principal
          tipoApoderado: createMatriculaDto.apoderadoData.tipoApoderado || 'principal',
        };

        apoderado = await this.apoderadoService.create(createApoderadoDto);
      }

      // === MANEJO DEL ESTUDIANTE ===

      // Si se proporciona ID, buscar por ID primero
      if (createMatriculaDto.idEstudiante) {
        try {
          estudiante = await this.estudianteService.findOne(createMatriculaDto.idEstudiante);
        } catch (error) {
          estudiante = null;
        }
      }

      // Si no se encontró por ID y se tienen datos, buscar por documento
      if (!estudiante && createMatriculaDto.estudianteData?.nroDocumento) {
        try {
          // Buscar por documento si existe el método
          estudiante = await this.estudianteService.findByDocumento(
            createMatriculaDto.estudianteData.nroDocumento
          );
        } catch (error) {
          // Si no existe el método findByDocumento, continuamos
          estudiante = null;
        }
      }

      // Si aún no existe, crear nuevo estudiante
      if (!estudiante) {
        // Validar que se proporcionaron datos del estudiante
        if (!createMatriculaDto.estudianteData) {
          throw new Error("Se requiere proporcionar idEstudiante o estudianteData para crear la matrícula");
        }

        // Validar campos requeridos para crear estudiante
        if (!createMatriculaDto.estudianteData.nombre ||
          !createMatriculaDto.estudianteData.apellido ||
          !createMatriculaDto.estudianteData.idRol ||
          !createMatriculaDto.estudianteData.nroDocumento) {
          throw new Error("Para crear un estudiante son requeridos: nombre, apellido, idRol y nroDocumento");
        }

        // 1️⃣ PRIMERO: Crear DTO para el servicio de estudiante
        const createEstudianteDto: any = {
          nombre: createMatriculaDto.estudianteData.nombre,
          apellido: createMatriculaDto.estudianteData.apellido,
          tipoDocumento: createMatriculaDto.estudianteData.tipoDocumento || null,
          nroDocumento: createMatriculaDto.estudianteData.nroDocumento,
          observaciones: createMatriculaDto.estudianteData.observaciones || null,
          idRol: createMatriculaDto.estudianteData.idRol,
          imagen_estudiante: createMatriculaDto.estudianteData.imagen_estudiante || null,
        };

        // 2️⃣ CREAR EL ESTUDIANTE
        const resultadoEstudiante = await this.estudianteService.create(createEstudianteDto);
        estudiante = resultadoEstudiante.estudiante || resultadoEstudiante;

        // 3️⃣ DESPUÉS: Crear contactos de emergencia (ahora estudiante ya existe)
        if (createMatriculaDto.estudianteData?.contactosEmergencia &&
          createMatriculaDto.estudianteData.contactosEmergencia.length > 0) {
          for (const contactoData of createMatriculaDto.estudianteData.contactosEmergencia) {
            const contactoEmergencia = new ContactoEmergencia();
            contactoEmergencia.nombre = contactoData.nombre;
            contactoEmergencia.apellido = contactoData.apellido;
            contactoEmergencia.telefono = contactoData.telefono;
            contactoEmergencia.email = contactoData.email || null;
            contactoEmergencia.tipoContacto = contactoData.tipoContacto;
            contactoEmergencia.esPrincipal = contactoData.esPrincipal || false;
            contactoEmergencia.prioridad = contactoData.prioridad || 1;
            contactoEmergencia.idEstudiante = estudiante;

            await manager.save(ContactoEmergencia, contactoEmergencia);
          }
        }
      }

      // === VERIFICAR GRADO CON PENSIÓN ===
      const grado = await this.gradoService.findOne(createMatriculaDto.idGrado);
      if (!grado) {
        throw new Error("Grado no encontrado. Verifique que el ID del grado sea válido");
      }

      // === VERIFICAR QUE SE REQUIERE AL MENOS UN APODERADO Y UN ESTUDIANTE ===
      if (!createMatriculaDto.idApoderado && !createMatriculaDto.apoderadoData) {
        throw new Error("Se requiere proporcionar idApoderado o apoderadoData");
      }

      if (!createMatriculaDto.idEstudiante && !createMatriculaDto.estudianteData) {
        throw new Error("Se requiere proporcionar idEstudiante o estudianteData");
      }

      // === CREAR MATRÍCULA ===
      const matricula = new Matricula();
      matricula.costoMatricula = createMatriculaDto.costoMatricula;
      matricula.fechaIngreso = createMatriculaDto.fechaIngreso;
      matricula.metodoPago = createMatriculaDto.metodoPago ?? null;
      matricula.voucherImg = createMatriculaDto.voucherImg ?? null;
      matricula.idApoderado = apoderado;
      matricula.idEstudiante = estudiante;
      matricula.idGrado = grado;

      const matriculaGuardada = await manager.save(Matricula, matricula);

      // === CARGAR MATRÍCULA COMPLETA CON TODAS LAS RELACIONES ===
      // Esto incluye: datos del apoderado, estudiante (con usuario), grado (con pensión)
      const matriculaCompleta = await manager.findOne(Matricula, {
        where: { idMatricula: matriculaGuardada.idMatricula },
        relations: [
          'idApoderado',           // Datos completos del apoderado
          'idEstudiante',          // Datos completos del estudiante
          'idEstudiante.idUsuario', // Usuario asociado al estudiante
          'idEstudiante.contactosEmergencia', // Contactos de emergencia del estudiante
          'idGrado',               // Datos completos del grado
          'idGrado.idPension'      // Información de la pensión del grado
        ]
      });

      if (!matriculaCompleta) {
        throw new Error("Error al recuperar la matrícula creada");
      }

      try {
        let aulaAsignada: any = null;
        let tipoAsignacion = createMatriculaDto.tipoAsignacionAula || 'automatica';

        // === VERIFICAR SI SE ESPECIFICÓ UN AULA Y ES ASIGNACIÓN MANUAL ===
        if (createMatriculaDto.idAulaEspecifica && tipoAsignacion === 'manual') {
          // Verificar que el aula existe y pertenece al grado correcto
          const aulaEspecifica = await this.aulaRepository.aulaEspecifica(createMatriculaDto.idAulaEspecifica, createMatriculaDto.idGrado);

          if (!aulaEspecifica) {
            throw new Error("El aula especificada no existe o no pertenece al grado seleccionado");
          }

          // Verificar disponibilidad del aula específica
          const aulasDisponibles = await this.aulaRepository.buscarPorCantidadGrado(createMatriculaDto.idGrado);
          const aulaDisponible = aulasDisponibles.find(aula => aula.idAula === createMatriculaDto.idAulaEspecifica);

          if (!aulaDisponible) {
            throw new Error("El aula especificada no tiene cupos disponibles");
          }

          aulaAsignada = aulaEspecifica;

          // Log para registro administrativo
          console.log(`🎯 Asignación MANUAL de aula: Estudiante asignado a ${aulaEspecifica.seccion} por motivo: ${createMatriculaDto.motivoPreferencia || 'No especificado'}`);

        } else {
          // === ASIGNACIÓN AUTOMÁTICA (LÓGICA ORIGINAL) ===
          const aulasDisponibles = await this.aulaRepository.buscarPorCantidadGrado(createMatriculaDto.idGrado);

          if (aulasDisponibles.length === 0) {
            throw new Error("No hay aulas disponibles para el grado seleccionado");
          }

          aulaAsignada = aulasDisponibles[0]; // Primera aula disponible (mejor opción)

          console.log(`🤖 Asignación AUTOMÁTICA de aula: Estudiante asignado a sección ${aulaAsignada.seccion} (distribución equilibrada)`);
        }

        // === CREAR LA ASIGNACIÓN ===
        const asignacionAula = new MatriculaAula();
        asignacionAula.idMatricula = matriculaCompleta.idMatricula;
        asignacionAula.idAula = aulaAsignada.idAula;
        asignacionAula.fechaAsignacion = new Date().toISOString().split('T')[0];
        asignacionAula.estado = 'activo';

        const asignacionGuardada = await manager.save(MatriculaAula, asignacionAula);

        //cargar asignacion completa y agregar a la respuesta
        const asignacionCompleta = await manager.findOne(MatriculaAula, {
          where: { idMatriculaAula: asignacionGuardada.idMatriculaAula },
          relations: ['aula']
        });

        if (asignacionCompleta) {
          matriculaCompleta.matriculaAula = asignacionCompleta;
        }
      } catch (error) {
        throw new Error("Error al asignar aula a la matrícula", error);
      }

      return matriculaCompleta;
    });
  }

  async findEstudiantesConApoderados(): Promise<any[]> {
    return await this.matriculaRepository.find({
      relations: [
        'idEstudiante',
        'idEstudiante.idUsuario',
        'idEstudiante.contactosEmergencia', // Nueva relación
        'idApoderado',
        'idGrado',
        'idGrado.idPension',
        'matriculaAula',
        'matriculaAula.aula'
      ],
      select: {
        idMatricula: true,
        fechaIngreso: true,
        costoMatricula: true,
        idEstudiante: {
          idEstudiante: true,
          nombre: true,
          apellido: true,
          nroDocumento: true,
          observaciones: true,
          idUsuario: {
            idUsuario: true,
            usuario: true,
            estaActivo: true
          },
          contactosEmergencia: {
            idContactoEmergencia: true,
            nombre: true,
            apellido: true,
            telefono: true,
            email: true,
            tipoContacto: true,
            esPrincipal: true,
            prioridad: true
          }
        },
        idApoderado: {
          idApoderado: true,
          nombre: true,
          apellido: true,
          numero: true,
          correo: true,
          direccion: true,
          documentoIdentidad: true,
          esPrincipal: true,
          tipoApoderado: true
        },
        idGrado: {
          idGrado: true,
          grado: true,
          descripcion: true,
          idPension: {
            idPension: true,
            monto: true
          }
        }
      }
    });
  }

  // === MÉTODO PARA OBTENER ESTUDIANTES CON PADRE Y MADRE ===
  async findEstudiantesConPadres(): Promise<any[]> {
    return await this.matriculaRepository
      .createQueryBuilder('matricula')
      .leftJoinAndSelect('matricula.idEstudiante', 'estudiante')
      .leftJoinAndSelect('matricula.idApoderado', 'apoderado')
      .leftJoinAndSelect('matricula.idGrado', 'grado')
      .leftJoinAndSelect('matricula.matriculaAula', 'matriculaAula')
      .leftJoinAndSelect('matriculaAula.aula', 'aula')
      .leftJoinAndSelect('estudiante.contactosEmergencia', 'contactos')
      .leftJoinAndSelect('estudiante.idUsuario', 'usuario')
      .where('contactos.tipoContacto IN (:...tipos)', { tipos: ['padre', 'madre'] })
      .andWhere('contactos.estaActivo = :activo', { activo: true })
      .orderBy('contactos.prioridad', 'ASC')
      .addOrderBy('matricula.fechaIngreso', 'DESC')
      .getMany();
  }

  // === MÉTODO PARA OBTENER SOLO CONTACTO PRINCIPAL ===
  async findEstudiantesConContactoPrincipal(): Promise<any[]> {
    return await this.matriculaRepository
      .createQueryBuilder('matricula')
      .leftJoinAndSelect('matricula.idEstudiante', 'estudiante')
      .leftJoinAndSelect('matricula.idApoderado', 'apoderado')
      .leftJoinAndSelect('matricula.idGrado', 'grado')
      .leftJoinAndSelect('matricula.matriculaAula', 'matriculaAula')
      .leftJoinAndSelect('matriculaAula.aula', 'aula')
      .leftJoinAndSelect('estudiante.contactosEmergencia', 'contactos')
      .leftJoinAndSelect('estudiante.idUsuario', 'usuario')
      .where('contactos.esPrincipal = :principal', { principal: true })
      .andWhere('contactos.estaActivo = :activo', { activo: true })
      .orderBy('matricula.fechaIngreso', 'DESC')
      .getMany();
  }

  // === MÉTODO PARA OBTENER SOLO APODERADOS PRINCIPALES ===
  async findEstudiantesConApoderadosPrincipales(): Promise<any[]> {
    return await this.matriculaRepository
      .createQueryBuilder('matricula')
      .leftJoinAndSelect('matricula.idEstudiante', 'estudiante')
      .leftJoinAndSelect('matricula.idApoderado', 'apoderado')
      .leftJoinAndSelect('matricula.idGrado', 'grado')
      .leftJoinAndSelect('matricula.matriculaAula', 'matriculaAula')
      .leftJoinAndSelect('matriculaAula.aula', 'aula')
      .leftJoinAndSelect('estudiante.idUsuario', 'usuario')
      .leftJoinAndSelect('estudiante.contactosEmergencia', 'contactos')
      .where('apoderado.esPrincipal = :principal', { principal: true })
      .orderBy('matricula.fechaIngreso', 'DESC')
      .getMany();
  }

  async findAll(): Promise<Matricula[]> {
    return await this.matriculaRepository.find();
  }

  async findOne(id: string): Promise<Matricula | null> {
    return await this.matriculaRepository.findOne({
      where: { idMatricula: id },
      relations: [
        'idApoderado',
        'idEstudiante',
        'idEstudiante.idUsuario',
        'idEstudiante.contactosEmergencia', // Nueva relación
        'idGrado',
        'idGrado.idPension',
        'matriculaAula',
        'matriculaAula.aula'
      ]
    });
  }

  remove(id: string) {
    return `This action removes a #${id} matricula`;
  }

  async search(searchDto: SearchMatriculaDto) {
    const {
      fechaIngresoDesde,
      fechaIngresoHasta,
      idGrado,
      idEstudiante,
      dniEstudiante,
      idApoderado,
      dniApoderado,
      metodoPago,
      costoMinimo,
      costoMaximo,
      nombreEstudiante,
      apellidoEstudiante,
      nombreApoderado,
      page = 1,
      limit = 10,
      sortBy = 'fechaIngreso',
      sortOrder = 'DESC'
    } = searchDto;

    // Crear el query builder con las relaciones necesarias
    let queryBuilder: SelectQueryBuilder<Matricula> = this.matriculaRepository
      .createQueryBuilder('matricula')
      .leftJoinAndSelect('matricula.idEstudiante', 'estudiante')
      .leftJoinAndSelect('matricula.idApoderado', 'apoderado')
      .leftJoinAndSelect('matricula.idGrado', 'grado')
      .leftJoinAndSelect('estudiante.idUsuario', 'usuario')
      .leftJoinAndSelect('estudiante.contactosEmergencia', 'contactos')
      .leftJoinAndSelect('matricula.matriculaAula', 'matriculaAula')
      .leftJoinAndSelect('matriculaAula.aula', 'aula');

    // === FILTROS POR FECHAS ===
    if (fechaIngresoDesde) {
      queryBuilder = queryBuilder.andWhere('matricula.fechaIngreso >= :fechaDesde', {
        fechaDesde: fechaIngresoDesde
      });
    }

    if (fechaIngresoHasta) {
      queryBuilder = queryBuilder.andWhere('matricula.fechaIngreso <= :fechaHasta', {
        fechaHasta: fechaIngresoHasta
      });
    }

    // === FILTROS POR IDs ===
    if (idGrado) {
      queryBuilder = queryBuilder.andWhere('matricula.idGrado = :idGrado', { idGrado });
    }

    if (idEstudiante) {
      queryBuilder = queryBuilder.andWhere('matricula.idEstudiante = :idEstudiante', { idEstudiante });
    }

    if (idApoderado) {
      queryBuilder = queryBuilder.andWhere('matricula.idApoderado = :idApoderado', { idApoderado });
    }

    // === FILTROS POR DNI ===
    if (dniEstudiante) {
      queryBuilder = queryBuilder.andWhere('estudiante.nroDocumento = :dniEstudiante', { dniEstudiante });
    }

    if (dniApoderado) {
      queryBuilder = queryBuilder.andWhere('apoderado.documentoIdentidad = :dniApoderado', { dniApoderado });
    }

    // === FILTROS POR DATOS DE MATRÍCULA ===
    if (metodoPago) {
      queryBuilder = queryBuilder.andWhere('matricula.metodoPago = :metodoPago', { metodoPago });
    }

    if (costoMinimo) {
      queryBuilder = queryBuilder.andWhere('matricula.costoMatricula >= :costoMinimo', { costoMinimo });
    }

    if (costoMaximo) {
      queryBuilder = queryBuilder.andWhere('matricula.costoMatricula <= :costoMaximo', { costoMaximo });
    }

    // === FILTROS POR NOMBRES (BÚSQUEDA PARCIAL) ===
    if (nombreEstudiante) {
      queryBuilder = queryBuilder.andWhere('LOWER(estudiante.nombre) LIKE LOWER(:nombreEstudiante)', {
        nombreEstudiante: `%${nombreEstudiante}%`
      });
    }

    if (apellidoEstudiante) {
      queryBuilder = queryBuilder.andWhere('LOWER(estudiante.apellido) LIKE LOWER(:apellidoEstudiante)', {
        apellidoEstudiante: `%${apellidoEstudiante}%`
      });
    }

    if (nombreApoderado) {
      queryBuilder = queryBuilder.andWhere('LOWER(apoderado.nombre) LIKE LOWER(:nombreApoderado)', {
        nombreApoderado: `%${nombreApoderado}%`
      });
    }

    // === ORDENAMIENTO ===
    switch (sortBy) {
      case 'fechaIngreso':
        queryBuilder = queryBuilder.orderBy('matricula.fechaIngreso', sortOrder);
        break;
      case 'costoMatricula':
        queryBuilder = queryBuilder.orderBy('matricula.costoMatricula', sortOrder);
        break;
      case 'nombreEstudiante':
        queryBuilder = queryBuilder.orderBy('estudiante.nombre', sortOrder);
        break;
      case 'nombreApoderado':
        queryBuilder = queryBuilder.orderBy('apoderado.nombre', sortOrder);
        break;
      default:
        queryBuilder = queryBuilder.orderBy('matricula.fechaIngreso', 'DESC');
    }

    // === PAGINACIÓN ===
    const skip = (page - 1) * limit;
    queryBuilder = queryBuilder.skip(skip).take(limit);

    // === EJECUTAR CONSULTA ===
    const [matriculas, total] = await queryBuilder.getManyAndCount();

    // === RESPUESTA CON METADATOS ===
    return {
      data: matriculas,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1
      },
      filters: {
        applied: this.getAppliedFilters(searchDto),
        total: this.countAppliedFilters(searchDto)
      }
    };
  }

  // === MÉTODOS AUXILIARES ===
  private getAppliedFilters(searchDto: SearchMatriculaDto): string[] {
    const appliedFilters: string[] = [];

    if (searchDto.fechaIngresoDesde) appliedFilters.push('Fecha desde');
    if (searchDto.fechaIngresoHasta) appliedFilters.push('Fecha hasta');
    if (searchDto.idGrado) appliedFilters.push('Grado');
    if (searchDto.dniEstudiante) appliedFilters.push('DNI estudiante');
    if (searchDto.dniApoderado) appliedFilters.push('DNI apoderado');
    if (searchDto.metodoPago) appliedFilters.push('Método de pago');
    if (searchDto.costoMinimo) appliedFilters.push('Costo mínimo');
    if (searchDto.costoMaximo) appliedFilters.push('Costo máximo');
    if (searchDto.nombreEstudiante) appliedFilters.push('Nombre estudiante');
    if (searchDto.apellidoEstudiante) appliedFilters.push('Apellido estudiante');
    if (searchDto.nombreApoderado) appliedFilters.push('Nombre apoderado');

    return appliedFilters;
  }

  private countAppliedFilters(searchDto: SearchMatriculaDto): number {
    return this.getAppliedFilters(searchDto).length;
  }

  // === MÉTODO PARA BÚSQUEDA RÁPIDA ===
  async quickSearch(term: string, limit: number = 5) {
    return await this.matriculaRepository
      .createQueryBuilder('matricula')
      .leftJoinAndSelect('matricula.idEstudiante', 'estudiante')
      .leftJoinAndSelect('matricula.idApoderado', 'apoderado')
      .leftJoinAndSelect('matricula.idGrado', 'grado')
      .leftJoinAndSelect('estudiante.idUsuario', 'usuario')
      .leftJoinAndSelect('estudiante.contactosEmergencia', 'contactos')
      .leftJoinAndSelect('matricula.matriculaAula', 'matriculaAula')
      .leftJoinAndSelect('matriculaAula.aula', 'aula')
      .where('LOWER(estudiante.nombre) LIKE LOWER(:term)', { term: `%${term}%` })
      .orWhere('LOWER(estudiante.apellido) LIKE LOWER(:term)', { term: `%${term}%` })
      .orWhere('LOWER(apoderado.nombre) LIKE LOWER(:term)', { term: `%${term}%` })
      .orWhere('estudiante.nroDocumento LIKE :term', { term: `%${term}%` })
      .orWhere('apoderado.documentoIdentidad LIKE :term', { term: `%${term}%` })
      .orderBy('matricula.fechaIngreso', 'DESC')
      .take(limit)
      .getMany();
  }

}
