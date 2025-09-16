import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, IsNull, In } from 'typeorm';
import { CreatePensionEstudianteDto } from './dto/create-pension-estudiante.dto';
import { UpdatePensionEstudianteDto } from './dto/update-pension-estudiante.dto';
import { UploadVoucherDto } from './dto/upload-voucher.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
import { VerifyPaymentMasivoDto } from './dto/verify-payment-masivo.dto';
import { FilterPensionDto } from './dto/filter-pension.dto';
import { ConfiguracionPensionesDto } from './dto/configuracion-pensiones.dto';
import { PensionEstudiante } from './entities/pension-estudiante.entity';
import { TrabajadorService } from 'src/trabajador/trabajador.service';
import { PeriodoEscolarService } from 'src/periodo-escolar/periodo-escolar.service';
import { GradoService } from 'src/grado/grado.service';
import { MatriculaService } from 'src/matricula/matricula.service';
import { CajaSimpleService } from 'src/caja-simple/caja-simple.service';

@Injectable()
export class PensionEstudianteService {
  constructor(
    @InjectRepository(PensionEstudiante)
    private pensionRepository: Repository<PensionEstudiante>,
    private readonly trabajadorRepository: TrabajadorService,
    private readonly periodoEscolarService: PeriodoEscolarService,
    private readonly gradoService: GradoService,
    private readonly matriculaService: MatriculaService,
    private readonly cajaSimpleService: CajaSimpleService,
  ) { }

  // 1. CREAR PENSIÓN (Para admin - generar pensiones mensuales)
  async create(createPensionEstudianteDto: CreatePensionEstudianteDto, registradoPorId: string) {
    try {

      const trabajadorEncontrado = await this.trabajadorRepository.findOne(createPensionEstudianteDto.registradoPorId)
      const pension = this.pensionRepository.create({
        ...createPensionEstudianteDto,
        registradoPor: trabajadorEncontrado,
        creadoEn: new Date(),
        estadoPension: 'PENDIENTE',
        montoTotal: createPensionEstudianteDto.montoPension,
      });

      return await this.pensionRepository.save(pension);
    } catch (error) {
      throw new BadRequestException('Error al crear la pensión: ' + error.message);
    }
  }

  // PENSIONES AUTOMATICAS POR AÑO ESCOLAR - VERSIÓN OPTIMIZADA
  async generarPensionesPorAnioEscolarOptimizada(anioEscolar: number, configuracion: ConfiguracionPensionesDto, registradoPorId: string) {
    // PASO 1: Usar transacción para garantizar consistencia
    return await this.pensionRepository.manager.transaction(async manager => {
      try {
        console.log(`🚀 Iniciando generación optimizada para año ${anioEscolar}`);

        // PASO 2: Verificaciones previas (igual que antes)
        const verificacion = await this.verificarConfiguracionParaGeneracion(anioEscolar);
        const mesesEscolares = this.calcularMesesDelPeriodoEscolar(
          verificacion.periodoEscolar.fechaInicio,
          verificacion.periodoEscolar.fechaFin
        );

        if (mesesEscolares.length === 0) {
          throw new BadRequestException(`El periodo escolar ${anioEscolar} no tiene un rango de fechas válido para generar pensiones.`);
        }

        const estudiantesMatriculados = await this.matriculaService.findEstudiantesMatriculadosParaPensiones(anioEscolar);
        if (estudiantesMatriculados.length === 0) {
          throw new BadRequestException(`No se encontraron estudiantes matriculados con pensiones configuradas para el año ${anioEscolar}.`);
        }

        const trabajadorRegistra = await this.trabajadorRepository.findOne(registradoPorId);
        if (!trabajadorRegistra) {
          throw new BadRequestException(`Trabajador con ID ${registradoPorId} no encontrado.`);
        }

        console.log(`📊 Procesando ${estudiantesMatriculados.length} estudiantes × ${mesesEscolares.length} meses = ${estudiantesMatriculados.length * mesesEscolares.length} pensiones potenciales`);

        // PASO 3: OPTIMIZACIÓN - Obtener todas las pensiones existentes de una vez
        const estudianteIds = estudiantesMatriculados.map(m => m.idEstudiante.idEstudiante);

        console.log(`📋 IDs de estudiantes a verificar:`, estudianteIds.slice(0, 3), '...');
        console.log(`📅 Meses a verificar:`, mesesEscolares);

        // Obtener pensiones existentes de manera más robusta
        const pensionesExistentesEnBD = await manager
          .createQueryBuilder(PensionEstudiante, 'pension')
          .where('pension.anio = :anio', { anio: anioEscolar })
          .andWhere('pension.idEstudiante IN (:...estudianteIds)', { estudianteIds })
          .andWhere('pension.mes IN (:...meses)', { meses: mesesEscolares })
          .getMany();

        console.log(`🔍 Encontradas ${pensionesExistentesEnBD.length} pensiones existentes en BD`);

        // DEBUG: Mostrar algunos IDs para verificar
        if (pensionesExistentesEnBD.length > 0) {
          console.log(`📋 Ejemplo de pensiones existentes:`,
            pensionesExistentesEnBD.slice(0, 3).map(p => ({
              estudiante: p.idEstudiante,
              mes: p.mes,
              anio: p.anio
            }))
          );
        }

        // PASO 4: Crear un Map para búsqueda rápida O(1) en lugar de O(n)
        const pensionesExistentesMap = new Map<string, PensionEstudiante>();
        pensionesExistentesEnBD.forEach(pension => {
          const clave = `${pension.idEstudiante}-${pension.mes}-${pension.anio}`;
          pensionesExistentesMap.set(clave, pension);
        });

        // PASO 5: Preparar arrays para bulk operations
        const pensionesParaCrear: any[] = [];
        const pensionesParaActualizar: { pension: PensionEstudiante, nuevosDatos: any }[] = [];
        const pensionesExistentes: any[] = [];

        // PASO 6: Procesar todo en memoria (sin queries en loops)
        for (const matricula of estudiantesMatriculados) {
          const estudiante = matricula.idEstudiante;
          const grado = matricula.idGrado;
          const pension = grado?.idPension;

          if (!pension) continue;

          for (const mes of mesesEscolares) {
            const clavePension = `${estudiante.idEstudiante}-${mes}-${anioEscolar}`;
            const existePension = pensionesExistentesMap.get(clavePension);

            if (existePension && !configuracion.regenerarExistentes) {
              pensionesExistentes.push({
                estudiante: `${estudiante.nombre} ${estudiante.apellido}`,
                mes,
                anio: anioEscolar,
                motivo: 'Ya existe'
              });
              continue;
            }

            // Calcular datos de la pensión
            const diaVencimiento = configuracion.diaVencimientoPersonalizado || pension.fechaVencimientoMensual || 15;
            const fechaVencimiento = this.calcularFechaVencimiento(mes, anioEscolar, diaVencimiento);
            const montoPension = parseFloat(pension.monto);
            let montoDescuento = 0;

            if (configuracion.aplicarDescuentosPagoAdelantado && pension.descuentoPagoAdelantado) {
              montoDescuento = parseFloat(pension.descuentoPagoAdelantado);
            }

            const montoTotal = montoPension - montoDescuento;

            if (existePension && configuracion.regenerarExistentes) {
              // Agregar a lista de actualizaciones
              pensionesParaActualizar.push({
                pension: existePension,
                nuevosDatos: {
                  montoPension: montoPension.toFixed(2),
                  montoDescuento: montoDescuento.toFixed(2),
                  montoTotal: montoTotal.toFixed(2),
                  fechaVencimiento,
                  actualizadoEn: new Date(),
                  observaciones: `${existePension.observaciones || ''} | REGENERADO: ${configuracion.descripcion || 'Actualización automática'}`
                }
              });
            } else if (!existePension) {
              // Agregar a lista de creaciones
              pensionesParaCrear.push({
                idEstudiante: estudiante.idEstudiante,
                mes,
                anio: anioEscolar,
                montoPension: montoPension.toFixed(2),
                fechaVencimiento,
                montoDescuento: montoDescuento.toFixed(2),
                montoTotal: montoTotal.toFixed(2),
                registradoPor: trabajadorRegistra,
                estadoPension: 'PENDIENTE',
                diasMora: 0,
                creadoEn: new Date(),
                fechaRegistro: new Date().toISOString().split('T')[0],
                observaciones: configuracion.descripcion || `Generación automática para ${grado.grado || 'grado'} - ${anioEscolar}`
              });
            }
          }
        }

        console.log(`📋 Preparado: ${pensionesParaCrear.length} para crear, ${pensionesParaActualizar.length} para actualizar`);

        // PASO 7: VALIDACIÓN ADICIONAL - Verificar duplicados en el array a crear
        const clavesUnicas = new Set<string>();
        const pensionesParaCrearFiltradas = pensionesParaCrear.filter(pension => {
          const clave = `${pension.idEstudiante}-${pension.mes}-${pension.anio}`;
          if (clavesUnicas.has(clave)) {
            console.log(`⚠️ Duplicado detectado en array: ${clave}`);
            return false;
          }
          clavesUnicas.add(clave);
          return true;
        });

        console.log(`🔍 Después de filtrar duplicados: ${pensionesParaCrearFiltradas.length} pensiones a crear`);

        // PASO 8: BULK OPERATIONS - Mucho más rápido
        let pensionesCreadas: PensionEstudiante[] = [];

        // Crear pensiones en lotes
        if (pensionesParaCrearFiltradas.length > 0) {
          console.log(`⚡ Creando ${pensionesParaCrearFiltradas.length} pensiones en bulk...`);

          try {
            pensionesCreadas = await manager.save(PensionEstudiante, pensionesParaCrearFiltradas);
            console.log(`✅ Pensiones creadas exitosamente`);
          } catch (saveError) {
            console.error(`❌ Error en bulk save:`, saveError.message);

            // Fallback: crear una por una para identificar duplicados específicos
            console.log(`🔄 Intentando crear pensiones una por una...`);
            for (const pension of pensionesParaCrearFiltradas) {
              try {
                const pensionCreada = await manager.save(PensionEstudiante, pension);
                pensionesCreadas.push(pensionCreada);
              } catch (individualError) {
                console.log(`⚠️ No se pudo crear pensión para estudiante ${pension.idEstudiante}, mes ${pension.mes}: ${individualError.message}`);
              }
            }
          }
        }

        // Actualizar pensiones en lotes
        if (pensionesParaActualizar.length > 0) {
          console.log(`⚡ Actualizando ${pensionesParaActualizar.length} pensiones...`);
          for (const { pension, nuevosDatos } of pensionesParaActualizar) {
            await manager.update(PensionEstudiante, pension.idPensionEstudiante, nuevosDatos);
          }
          console.log(`✅ Pensiones actualizadas exitosamente`);
        }

        console.log(`🎉 Proceso completado exitosamente`);

        // PASO 8: Retornar resultado optimizado
        return {
          success: true,
          mensaje: `Proceso optimizado completado para el año escolar ${anioEscolar}`,
          periodoEscolar: {
            anio: verificacion.periodoEscolar.anioEscolar,
            fechaInicio: verificacion.periodoEscolar.fechaInicio,
            fechaFin: verificacion.periodoEscolar.fechaFin,
            mesesIncluidos: mesesEscolares
          },
          estadisticas: {
            estudiantesMatriculados: estudiantesMatriculados.length,
            mesesProcesados: mesesEscolares.length,
            pensionesCreadas: pensionesCreadas.length,
            pensionesActualizadas: pensionesParaActualizar.length,
            pensionesExistentes: pensionesExistentes.length,
            pensionesTotales: pensionesCreadas.length + pensionesParaActualizar.length + pensionesExistentes.length
          },
          configuracionAplicada: {
            regenerarExistentes: configuracion.regenerarExistentes || false,
            aplicarDescuentos: configuracion.aplicarDescuentosPagoAdelantado || false,
            diaVencimientoPersonalizado: configuracion.diaVencimientoPersonalizado
          },
          rendimiento: {
            metodo: 'Optimizado con transacciones y bulk operations',
            tiempoEstimado: 'sub-segundo vs. 20+ segundos del método anterior'
          },
          pensionesExistentes: pensionesExistentes.length > 0 ? pensionesExistentes : undefined
        };

      } catch (error) {
        console.error(`❌ Error en generación optimizada:`, error);
        throw new BadRequestException(`Error al generar pensiones (optimizado): ${error.message}`);
      }
    });
  }

  // PENSIONES AUTOMATICAS POR AÑO ESCOLAR
  async generarPensionesPorAnioEscolar(anioEscolar: number, configuracion: ConfiguracionPensionesDto, registradoPorId: string) {
    try {
      //VERIFICAMOS
      const verificacion = await this.verificarConfiguracionParaGeneracion(anioEscolar);

      // CALCULO DE MESES AUTOMATICO
      const mesesEscolares = this.calcularMesesDelPeriodoEscolar(
        verificacion.periodoEscolar.fechaInicio,
        verificacion.periodoEscolar.fechaFin
      );

      if (mesesEscolares.length === 0) {
        throw new BadRequestException(`El periodo escolar ${anioEscolar} no tiene un rango de fechas válido para generar pensiones.`);
      }

      // DETERMINAR LOS ESTUDIANTES MATRICULADOS CON PENSIONES
      const estudiantesMatriculados = await this.matriculaService.findEstudiantesMatriculadosParaPensiones(anioEscolar);

      if (estudiantesMatriculados.length === 0) {
        throw new BadRequestException(
          `No se encontraron estudiantes matriculados con pensiones configuradas para el año ${anioEscolar}. ` +
          `Verifique que: 1) Hay estudiantes matriculados activos, 2) Los grados tienen pensiones asignadas.`
        );
      }

      const trabajadorRegistra = await this.trabajadorRepository.findOne(registradoPorId);
      if (!trabajadorRegistra) {
        throw new BadRequestException(`Trabajador con ID ${registradoPorId} no encontrado.`);
      }

      const pensionesCreadas: PensionEstudiante[] = [];
      const pensionesExistentes: any[] = [];

      for (const matricula of estudiantesMatriculados) {
        const estudiante = matricula.idEstudiante;
        const grado = matricula.idGrado;
        const pension = grado?.idPension;

        if (!pension) {
          continue;
        }

        for (const mes of mesesEscolares) {
          // Verificar si ya existe pensión para este mes/año/estudiante
          const existePension = await this.pensionRepository.findOne({
            where: {
              idEstudiante: estudiante.idEstudiante,
              mes,
              anio: anioEscolar
            }
          });

          if (existePension && !configuracion.regenerarExistentes) {
            pensionesExistentes.push({
              estudiante: typeof estudiante === 'string' ? estudiante : `${estudiante.nombre} ${estudiante.apellido}`,
              mes,
              anio: anioEscolar,
              motivo: 'Ya existe'
            });
            continue;
          }

          // Calcular fecha de vencimiento usando configuración de la pensión o personalizada
          const diaVencimiento = configuracion.diaVencimientoPersonalizado || pension.fechaVencimientoMensual || 15;
          const fechaVencimiento = this.calcularFechaVencimiento(mes, anioEscolar, diaVencimiento);

          // Calcular montos (directamente desde la configuración de la pensión)
          const montoPension = parseFloat(pension.monto);
          let montoDescuento = 0;

          if (configuracion.aplicarDescuentosPagoAdelantado && pension.descuentoPagoAdelantado) {
            montoDescuento = parseFloat(pension.descuentoPagoAdelantado);
          }

          const montoTotal = montoPension - montoDescuento;

          // Crear la pensión estudiante
          const nuevaPension = this.pensionRepository.create({
            idEstudiante: typeof estudiante === 'string' ? estudiante : estudiante.idEstudiante,
            mes,
            anio: anioEscolar,
            montoPension: montoPension.toFixed(2),
            fechaVencimiento,
            montoDescuento: montoDescuento.toFixed(2),
            montoTotal: montoTotal.toFixed(2),
            registradoPor: trabajadorRegistra,
            estadoPension: 'PENDIENTE',
            diasMora: 0,
            creadoEn: new Date(),
            fechaRegistro: new Date().toISOString().split('T')[0],
            observaciones: configuracion.descripcion || `Generación automática para ${grado.grado || 'grado'} - ${anioEscolar}`
          });

          if (existePension && configuracion.regenerarExistentes) {
            // Actualizar pensión existente
            await this.pensionRepository.update(existePension.idPensionEstudiante, {
              montoPension: nuevaPension.montoPension,
              montoDescuento: nuevaPension.montoDescuento,
              montoTotal: nuevaPension.montoTotal,
              fechaVencimiento: nuevaPension.fechaVencimiento,
              actualizadoEn: new Date(),
              observaciones: `${existePension.observaciones || ''} | REGENERADO: ${configuracion.descripcion || 'Actualización automática'}`
            });

            const pensionActualizada = await this.pensionRepository.findOne({
              where: { idPensionEstudiante: existePension.idPensionEstudiante }
            });

            if (pensionActualizada) {
              pensionesCreadas.push(pensionActualizada);
            }
          } else {
            // Crear nueva pensión
            const pensionCreada = await this.pensionRepository.save(nuevaPension);
            pensionesCreadas.push(pensionCreada);
          }
        }
      }

      return {
        success: true,
        mensaje: `Proceso completado para el año escolar ${anioEscolar}`,
        periodoEscolar: {
          anio: verificacion.periodoEscolar.anioEscolar,
          fechaInicio: verificacion.periodoEscolar.fechaInicio,
          fechaFin: verificacion.periodoEscolar.fechaFin,
          mesesIncluidos: mesesEscolares
        },
        estadisticas: {
          estudiantesMatriculados: estudiantesMatriculados.length,
          mesesProcesados: mesesEscolares.length,
          pensionesCreadas: pensionesCreadas.length,
          pensionesExistentes: pensionesExistentes.length,
          pensionesTotales: pensionesCreadas.length + pensionesExistentes.length
        },
        configuracionAplicada: {
          regenerarExistentes: configuracion.regenerarExistentes || false,
          aplicarDescuentos: configuracion.aplicarDescuentosPagoAdelantado || false,
          diaVencimientoPersonalizado: configuracion.diaVencimientoPersonalizado
        },
        pensionesExistentes: pensionesExistentes.length > 0 ? pensionesExistentes : undefined
      };

    } catch (error) {
      throw new BadRequestException(`Error al generar pensiones: ${error.message}`);
    }
  }

  // MÉTODO AUXILIAR: Calcular los meses del periodo escolar
  private calcularMesesDelPeriodoEscolar(fechaInicio: string, fechaFin: string): number[] {
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    const meses: number[] = [];

    // ✅ Empezar desde el mes real de inicio
    let mesActual = inicio.getMonth(); // 0-11
    let anioActual = inicio.getFullYear();

    const mesFinalizacion = fin.getMonth();
    const anioFinalizacion = fin.getFullYear();

    while (anioActual < anioFinalizacion ||
      (anioActual === anioFinalizacion && mesActual <= mesFinalizacion)) {

      meses.push(mesActual + 1); // Convertir a 1-12

      mesActual++;
      if (mesActual > 11) {
        mesActual = 0;
        anioActual++;
      }
    }

    return meses.sort((a, b) => a - b);
  }



  // MÉTODO INFORMATIVO: Obtener información del periodo escolar y sus meses
  async obtenerInformacionPeriodoEscolar(anioEscolar?: number) {
    try {
      let periodo;

      if (anioEscolar) {
        const periodoResponse = await this.periodoEscolarService.findByAnio(anioEscolar);
        periodo = periodoResponse.periodo;
      } else {
        const periodoResponse = await this.periodoEscolarService.findPeriodoActual();
        periodo = periodoResponse.periodo;
      }

      if (!periodo) {
        throw new NotFoundException(
          anioEscolar
            ? `No se encontró periodo escolar para el año ${anioEscolar}`
            : 'No hay periodo escolar activo'
        );
      }

      // Calcular meses del periodo
      const mesesDelPeriodo = this.calcularMesesDelPeriodoEscolar(periodo.fechaInicio, periodo.fechaFin);

      // Verificar configuración de grados y pensiones
      const verificacionGrados = await this.gradoService.verificarGradosConPensionConfigurada();

      return {
        periodo: {
          idPeriodoEscolar: periodo.idPeriodoEscolar,
          anioEscolar: periodo.anioEscolar,
          fechaInicio: periodo.fechaInicio,
          fechaFin: periodo.fechaFin,
          estaActivo: periodo.estaActivo,
          descripcion: periodo.descripcion
        },
        mesesDelPeriodo,
        cantidadMeses: mesesDelPeriodo.length,
        configuracionGrados: {
          todosConfigurados: verificacionGrados.todosConfigurados,
          gradosSinPension: verificacionGrados.gradosSinPension,
          cantidadGradosSinPension: verificacionGrados.gradosSinPension.length
        },
        recomendaciones: {
          metodoRecomendado: 'generarPensionesPorAnioEscolar - Basado en periodo escolar',
          configuracionValida: verificacionGrados.todosConfigurados,
          accionesRequeridas: !verificacionGrados.todosConfigurados
            ? [`Configurar pensiones para los grados: ${verificacionGrados.gradosSinPension.map(g => g.grado).join(', ')}`]
            : []
        }
      };

    } catch (error) {
      throw new BadRequestException(`Error al obtener información del periodo escolar: ${error.message}`);
    }
  }

  // MÉTODO INFORMATIVO: Obtener resumen de configuración de pensiones
  async obtenerResumenConfiguracionPensiones(anioEscolar?: number) {
    try {
      const anio = anioEscolar || new Date().getFullYear();

      // Obtener información completa
      const infoPeriodo = await this.obtenerInformacionPeriodoEscolar(anio);

      // Obtener estudiantes matriculados (si los hay)
      let estudiantesInfo: any = null;
      try {
        const estudiantes = await this.matriculaService.findEstudiantesMatriculadosParaPensiones(anio);
        estudiantesInfo = {
          cantidad: estudiantes.length,
          gradosRepresentados: [...new Set(estudiantes.map(e => e.idGrado?.grado || 'Sin grado'))],
          pensionesConfiguradas: estudiantes.filter(e => e.idGrado?.idPension).length
        };
      } catch (error) {
        estudiantesInfo = { cantidad: 0, error: 'No se encontraron estudiantes matriculados' };
      }

      return {
        anioEscolar: anio,
        periodoEscolar: infoPeriodo.periodo,
        configuracion: {
          mesesDelPeriodo: infoPeriodo.mesesDelPeriodo,
          cantidadMeses: infoPeriodo.cantidadMeses
        },
        grados: infoPeriodo.configuracionGrados,
        estudiantes: estudiantesInfo,
        estadoGeneral: {
          listo: infoPeriodo.configuracionGrados.todosConfigurados &&
            infoPeriodo.periodo.estaActivo &&
            (estudiantesInfo?.cantidad || 0) > 0,
          problemas: [
            ...(!infoPeriodo.configuracionGrados.todosConfigurados ? ['Grados sin pensión configurada'] : []),
            ...(!infoPeriodo.periodo.estaActivo ? ['Periodo escolar inactivo'] : []),
            ...((estudiantesInfo?.cantidad || 0) === 0 ? ['No hay estudiantes matriculados'] : [])
          ]
        },
        recomendaciones: infoPeriodo.recomendaciones
      };

    } catch (error) {
      throw new BadRequestException(`Error al obtener resumen de configuración: ${error.message}`);
    }
  }

  // MÉTODO AUXILIAR: Verificar configuración antes de generar pensiones
  private async verificarConfiguracionParaGeneracion(anioEscolar: number) {
    // 1. Verificar que existe el periodo escolar
    const periodoResponse = await this.periodoEscolarService.findByAnio(anioEscolar);
    if (!periodoResponse.periodo) {
      throw new BadRequestException(`No existe periodo escolar configurado para ${anioEscolar}`);
    }

    // 2. Verificar que todos los grados activos tengan pensión configurada
    const verificacionGrados = await this.gradoService.verificarGradosConPensionConfigurada();
    if (!verificacionGrados.todosConfigurados) {
      const gradosSinPension = verificacionGrados.gradosSinPension.map(g => g.grado).join(', ');
      throw new BadRequestException(
        `Los siguientes grados no tienen pensión configurada: ${gradosSinPension}. ` +
        `Por favor configure las pensiones para todos los grados antes de generar.`
      );
    }

    return {
      periodoEscolar: periodoResponse.periodo,
      configuracionValida: true,
      gradosVerificados: verificacionGrados
    };
  }

  // MÉTODO AUXILIAR: Calcular fecha de vencimiento
  private calcularFechaVencimiento(mes: number, anio: number, diaVencimiento: number = 15): string {
    const fecha = new Date(anio, mes - 1, diaVencimiento);
    return fecha.toISOString().split('T')[0];
  }

  // 3. CONFIGURAR PENSIONES (Para coordinadora)
  async configurarPensionesPorAnio(configuracion: ConfiguracionPensionesDto, registradoPorId: string) {
    try {
      // Generar pensiones con la nueva configuración
      return await this.generarPensionesPorAnioEscolar(
        configuracion.anioEscolar,
        configuracion,
        registradoPorId
      );
    } catch (error) {
      throw new BadRequestException(`Error en configuración: ${error.message}`);
    }
  }

  // 3. VER PENSIONES POR APODERADO (Para padres)
  async findByApoderado(apoderadoId: string, filters?: FilterPensionDto) {
    const queryBuilder = this.pensionRepository
      .createQueryBuilder('pension')
      .leftJoinAndSelect('pension.estudiante', 'estudiante')
      .leftJoinAndSelect('estudiante.matriculas', 'matricula')
      .where('matricula.id_apoderado = :apoderadoId', { apoderadoId });

    if (filters?.estadoPension) {
      queryBuilder.andWhere('pension.estado_pension = :estado', { estado: filters.estadoPension });
    }

    if (filters?.anio) {
      queryBuilder.andWhere('pension.anio = :anio', { anio: filters.anio });
    }

    if (filters?.mes) {
      queryBuilder.andWhere('pension.mes = :mes', { mes: filters.mes });
    }

    return await queryBuilder.getMany();
  }

  // 4. SUBIR VOUCHER (Para padres)
  async uploadVoucher(pensionId: string, uploadData: UploadVoucherDto, fileUrl: string) {
    const pension = await this.pensionRepository.findOne({
      where: { idPensionEstudiante: pensionId }
    });

    if (!pension) {
      throw new NotFoundException('Pensión no encontrada');
    }

    if (pension.estadoPension === 'PAGADO') {
      throw new BadRequestException('Esta pensión ya está pagada');
    }

    pension.numeroComprobante = uploadData.numeroComprobante;
    pension.metodoPago = uploadData.metodoPago;
    pension.fechaPago = uploadData.fechaPago;
    pension.montoPagado = uploadData.montoPagado;
    pension.comprobanteUrl = fileUrl;
    pension.observaciones = `Voucher subido: ${uploadData.observaciones || 'Sin observaciones'}`;
    pension.actualizadoEn = new Date();

    return await this.pensionRepository.save(pension);
  }

  // 5. VERIFICAR PAGO (Para admin)
  async verifyPayment(pensionId: string, verifyData: VerifyPaymentDto, verificadoPorId: string) {
    const pension = await this.pensionRepository.findOne({
      where: { idPensionEstudiante: pensionId },
      relations: ['estudiante']
    });

    if (!pension) {
      throw new NotFoundException('Pensión no encontrada');
    }

    const estadoAnterior = pension.estadoPension;
    pension.estadoPension = verifyData.estadoPension;
    pension.observaciones = verifyData.observaciones;

    // Si se APRUEBA el pago (pasa a PAGADO), establecer fecha_pago
    if (verifyData.estadoPension === 'PAGADO') {
      if (!pension.fechaPago) {
        pension.fechaPago = new Date().toISOString().split('T')[0]; // Fecha actual
      }
      // Si no hay monto pagado, usar el monto total
      if (!pension.montoPagado || parseFloat(pension.montoPagado) === 0) {
        pension.montoPagado = pension.montoTotal;
      }
    }

    // Si se rechaza el pago, limpiar datos del voucher
    if (verifyData.estadoPension === 'PENDIENTE' && verifyData.motivoRechazo) {
      pension.comprobanteUrl = null;
      pension.numeroComprobante = null;
      pension.fechaPago = null;
      pension.montoPagado = null;
      pension.observaciones = `RECHAZADO: ${verifyData.motivoRechazo}`;
    }

    pension.actualizadoEn = new Date();

    // 🔥 NUEVO: Cuando se APRUEBA el pago (pasa a PAGADO), crear automáticamente el ingreso en Caja Simple
    if (verifyData.estadoPension === 'PAGADO' && estadoAnterior !== 'PAGADO') {
      // Validar que el verificadoPorId sea un UUID válido antes de crear ingreso automático
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

      if (uuidRegex.test(verificadoPorId)) {
        try {
          // Crear el ingreso por pensión automáticamente usando el servicio inyectado
          await this.cajaSimpleService.crearIngresoPorPension({
            idEstudiante: pension.idEstudiante,
            idPensionRelacionada: pension.idPensionEstudiante,
            monto: parseFloat(pension.montoPagado || pension.montoTotal),
            metodoPago: pension.metodoPago || 'NO_ESPECIFICADO',
            numeroComprobante: pension.numeroComprobante || undefined,
            registradoPor: verificadoPorId,
            observaciones: `INGRESO AUTOMÁTICO - Pago aprobado: ${pension.observaciones || 'Sin observaciones'}`
          });

          console.log(`💰 INGRESO AUTOMÁTICO CREADO - Pensión ${pensionId} → Caja Simple`);

          // Actualizar observaciones para indicar que se creó el ingreso
          pension.observaciones = `${pension.observaciones} | ✅ INGRESO REGISTRADO EN CAJA SIMPLE`;

        } catch (error) {
          console.error(`❌ Error al crear ingreso automático para pensión ${pensionId}:`, error.message);
          // No fallar la verificación por esto, solo registrar el error
          pension.observaciones = `${pension.observaciones} | ⚠️ ERROR AL REGISTRAR EN CAJA SIMPLE: ${error.message}`;
        }
      } else {
        console.warn(`⚠️ Ingreso automático omitido para pensión ${pensionId}: ID de verificador no válido (${verificadoPorId})`);
        pension.observaciones = `${pension.observaciones} | ⚠️ INGRESO AUTOMÁTICO OMITIDO: ID verificador no válido`;
      }
    }

    return await this.pensionRepository.save(pension);
  }

  // 5.1. VERIFICAR PAGOS MASIVOS (Para admin) - Optimizado con transacciones
  async verifyPaymentMasivo(verifyData: VerifyPaymentMasivoDto, verificadoPorId: string) {
    return await this.pensionRepository.manager.transaction(async manager => {
      const { idsPensiones, estadoPension, observaciones, motivoRechazo } = verifyData;

      // Obtener todas las pensiones a verificar
      const pensiones = await manager.findBy(PensionEstudiante, {
        idPensionEstudiante: In(idsPensiones)
      });

      if (pensiones.length !== idsPensiones.length) {
        const encontrados = pensiones.map(p => p.idPensionEstudiante);
        const noEncontrados = idsPensiones.filter(id => !encontrados.includes(id));
        throw new NotFoundException(`Pensiones no encontradas: ${noEncontrados.join(', ')}`);
      }

      const resultados = {
        totalProcesadas: pensiones.length,
        exitosas: 0,
        errores: 0,
        detalles: [] as any[]
      };

      // Procesar cada pensión
      for (const pension of pensiones) {
        try {
          const estadoAnterior = pension.estadoPension;
          pension.estadoPension = estadoPension;
          pension.observaciones = observaciones;

          // Si se APRUEBA el pago (pasa a PAGADO), establecer fecha_pago
          if (estadoPension === 'PAGADO') {
            if (!pension.fechaPago) {
              pension.fechaPago = new Date().toISOString().split('T')[0]; // Fecha actual
            }
            // Si no hay monto pagado, usar el monto total
            if (!pension.montoPagado || parseFloat(pension.montoPagado) === 0) {
              pension.montoPagado = pension.montoTotal;
            }
          }

          // Si se rechaza el pago, limpiar datos del voucher
          if (estadoPension === 'PENDIENTE' && motivoRechazo) {
            pension.comprobanteUrl = null;
            pension.numeroComprobante = null;
            pension.fechaPago = null;
            pension.montoPagado = null;
            pension.observaciones = `RECHAZADO MASIVO: ${motivoRechazo}`;
          }

          pension.actualizadoEn = new Date();

          // Crear ingreso automático en Caja Simple si se aprueba
          if (estadoPension === 'PAGADO' && estadoAnterior !== 'PAGADO') {
            // Validar que el verificadoPorId sea un UUID válido antes de crear ingreso automático
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

            if (uuidRegex.test(verificadoPorId)) {
              try {
                await this.cajaSimpleService.crearIngresoPorPension({
                  idEstudiante: pension.idEstudiante,
                  idPensionRelacionada: pension.idPensionEstudiante,
                  monto: parseFloat(pension.montoPagado || pension.montoTotal),
                  metodoPago: pension.metodoPago || 'NO_ESPECIFICADO',
                  numeroComprobante: pension.numeroComprobante || undefined,
                  registradoPor: verificadoPorId,
                  observaciones: `INGRESO AUTOMÁTICO MASIVO - ${observaciones}`
                });

                pension.observaciones = `${pension.observaciones} | ✅ INGRESO REGISTRADO EN CAJA SIMPLE`;
              } catch (error) {
                console.error(`❌ Error en ingreso automático para pensión ${pension.idPensionEstudiante}:`, error.message);
                pension.observaciones = `${pension.observaciones} | ⚠️ ERROR AL REGISTRAR EN CAJA SIMPLE: ${error.message}`;
              }
            } else {
              console.warn(`⚠️ Ingreso automático omitido para pensión ${pension.idPensionEstudiante}: ID de verificador no válido (${verificadoPorId})`);
              pension.observaciones = `${pension.observaciones} | ⚠️ INGRESO AUTOMÁTICO OMITIDO: ID verificador no válido`;
            }
          }

          await manager.save(PensionEstudiante, pension);

          resultados.exitosas++;
          resultados.detalles.push({
            idPension: pension.idPensionEstudiante,
            estado: 'EXITOSO',
            estadoAnterior,
            estadoNuevo: estadoPension,
            mensaje: 'Verificación procesada correctamente'
          });

        } catch (error) {
          resultados.errores++;
          resultados.detalles.push({
            idPension: pension.idPensionEstudiante,
            estado: 'ERROR',
            mensaje: error.message
          });
        }
      }

      return {
        success: true,
        message: `Verificación masiva completada: ${resultados.exitosas} exitosas, ${resultados.errores} errores`,
        ...resultados
      };
    });
  }

  // 6. VER PAGOS PENDIENTES DE VERIFICACIÓN (Para admin)
  async findPendingVerifications() {
    return await this.pensionRepository.find({
      where: {
        estadoPension: 'PENDIENTE',
        comprobanteUrl: Not(IsNull()) // Solo los que tienen voucher subido
      },
      relations: ['estudiante'],
      order: { fechaPago: 'ASC' }
    });
  }

  // 7. MARCAR PENSIONES VENCIDAS (Cron job)
  async markOverduePensions() {
    const today = new Date().toISOString().split('T')[0];

    const result = await this.pensionRepository
      .createQueryBuilder()
      .update(PensionEstudiante)
      .set({
        estadoPension: 'VENCIDO',
        actualizadoEn: new Date()
      })
      .where('fecha_vencimiento < :today', { today })
      .andWhere('estado_pension = :pendiente', { pendiente: 'PENDIENTE' })
      .execute();

    return result.affected;
  }

  // 🔥 NUEVO: PROCESAR INGRESOS MASIVOS DE PENSIONES APROBADAS
  async procesarIngresosMasivosPensiones(mes: number, anio: number, registradoPorId: string) {
    try {
      console.log(`📊 Iniciando procesamiento masivo de pensiones pagadas - ${mes}/${anio}`);

      // Buscar todas las pensiones pagadas del mes que NO tengan ingreso en caja simple
      const pensionesPagadas = await this.pensionRepository
        .createQueryBuilder('pension')
        .leftJoinAndSelect('pension.estudiante', 'estudiante')
        .leftJoin('caja_simple', 'caja', 'caja.id_pension_relacionada = pension.id_pension_estudiante')
        .where('pension.mes = :mes', { mes })
        .andWhere('pension.anio = :anio', { anio })
        .andWhere('pension.estado_pension = :estado', { estado: 'PAGADO' })
        .andWhere('caja.id_movimiento IS NULL') // Solo las que NO tienen ingreso en caja simple
        .getMany();

      if (pensionesPagadas.length === 0) {
        return {
          success: true,
          mensaje: `No se encontraron pensiones pagadas sin registrar en caja simple para ${mes}/${anio}`,
          estadisticas: {
            pensionesEncontradas: 0,
            ingresosCreados: 0,
            errores: 0
          }
        };
      }

      console.log(`📋 Encontradas ${pensionesPagadas.length} pensiones pagadas pendientes de registro`);

      const ingresosCreados: any[] = [];
      const errores: any[] = [];

      // Procesar en lotes para evitar problemas de memoria
      const LOTE_SIZE = 50;
      for (let i = 0; i < pensionesPagadas.length; i += LOTE_SIZE) {
        const lote = pensionesPagadas.slice(i, i + LOTE_SIZE);
        console.log(`⚡ Procesando lote ${Math.floor(i / LOTE_SIZE) + 1}/${Math.ceil(pensionesPagadas.length / LOTE_SIZE)}`);

        for (const pension of lote) {
          try {
            const ingresoCreado = await this.cajaSimpleService.crearIngresoPorPension({
              idEstudiante: pension.idEstudiante,
              idPensionRelacionada: pension.idPensionEstudiante,
              monto: parseFloat(pension.montoPagado || pension.montoTotal),
              metodoPago: pension.metodoPago || 'NO_ESPECIFICADO',
              numeroComprobante: pension.numeroComprobante || undefined,
              registradoPor: registradoPorId,
              observaciones: `PROCESAMIENTO MASIVO ${mes}/${anio} - ${pension.estudiante?.nombre || 'Estudiante'} ${pension.estudiante?.apellido || ''}`
            });

            ingresosCreados.push({
              pensionId: pension.idPensionEstudiante,
              estudianteNombre: `${pension.estudiante?.nombre || ''} ${pension.estudiante?.apellido || ''}`,
              monto: pension.montoPagado || pension.montoTotal,
              ingresoId: ingresoCreado.idMovimiento
            });

            // Actualizar la pensión para indicar que se procesó masivamente
            await this.pensionRepository.update(pension.idPensionEstudiante, {
              observaciones: `${pension.observaciones || ''} | ✅ PROCESADO MASIVAMENTE EN CAJA SIMPLE`,
              actualizadoEn: new Date()
            });

          } catch (error) {
            console.error(`❌ Error procesando pensión ${pension.idPensionEstudiante}:`, error.message);
            errores.push({
              pensionId: pension.idPensionEstudiante,
              estudianteNombre: `${pension.estudiante?.nombre || ''} ${pension.estudiante?.apellido || ''}`,
              error: error.message
            });
          }
        }

        // Pequeña pausa entre lotes para no sobrecargar la BD
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      console.log(`🎉 Procesamiento masivo completado: ${ingresosCreados.length} éxitos, ${errores.length} errores`);

      return {
        success: true,
        mensaje: `Procesamiento masivo completado para ${mes}/${anio}`,
        estadisticas: {
          pensionesEncontradas: pensionesPagadas.length,
          ingresosCreados: ingresosCreados.length,
          errores: errores.length,
          porcentajeExito: ((ingresosCreados.length / pensionesPagadas.length) * 100).toFixed(2)
        },
        detalles: {
          ingresosCreados: ingresosCreados.length > 0 ? ingresosCreados : undefined,
          errores: errores.length > 0 ? errores : undefined
        },
        recomendaciones: [
          errores.length > 0 ? 'Revisar errores y procesar manualmente las pensiones fallidas' : null,
          'Verificar en Caja Simple que los ingresos se registraron correctamente',
          'Ejecutar reporte de conciliación pension-caja para validar consistencia'
        ].filter(Boolean)
      };

    } catch (error) {
      console.error(`❌ Error en procesamiento masivo:`, error);
      throw new BadRequestException(`Error en procesamiento masivo de pensiones: ${error.message}`);
    }
  }

  // 🔥 NUEVO: REPORTE DE CONCILIACIÓN PENSIONES vs CAJA SIMPLE
  async generarReporteConciliacion(mes: number, anio: number) {
    try {
      console.log(`📊 Generando reporte de conciliación ${mes}/${anio}`);

      // Obtener todas las pensiones del mes
      const todasLasPensiones = await this.pensionRepository
        .createQueryBuilder('pension')
        .leftJoinAndSelect('pension.estudiante', 'estudiante')
        .where('pension.mes = :mes', { mes })
        .andWhere('pension.anio = :anio', { anio })
        .getMany();

      // Obtener ingresos por pensiones en caja simple del mismo período
      const ingresosCajaSimple = await this.cajaSimpleService.getIngresosPorPensiones(mes, anio);

      // Análisis de conciliación
      const pensionesConIngreso = todasLasPensiones.filter(p =>
        ingresosCajaSimple.movimientos.some(ing => ing.idPensionRelacionada === p.idPensionEstudiante)
      );

      const pensionesSinIngreso = todasLasPensiones.filter(p =>
        !ingresosCajaSimple.movimientos.some(ing => ing.idPensionRelacionada === p.idPensionEstudiante)
      );

      const pensionesInconsistentes = pensionesConIngreso.filter(pension => {
        const ingreso = ingresosCajaSimple.movimientos.find(ing => ing.idPensionRelacionada === pension.idPensionEstudiante);
        return ingreso && Math.abs(parseFloat(ingreso.monto) - parseFloat(pension.montoPagado || pension.montoTotal)) > 0.01;
      });

      return {
        periodo: `${mes}/${anio}`,
        resumen: {
          totalPensiones: todasLasPensiones.length,
          pensionesConIngreso: pensionesConIngreso.length,
          pensionesSinIngreso: pensionesSinIngreso.length,
          pensionesInconsistentes: pensionesInconsistentes.length,
          porcentajeConciliacion: ((pensionesConIngreso.length / todasLasPensiones.length) * 100).toFixed(2)
        },
        estadosPensiones: {
          pendientes: todasLasPensiones.filter(p => p.estadoPension === 'PENDIENTE').length,
          pagadas: todasLasPensiones.filter(p => p.estadoPension === 'PAGADO').length,
          vencidas: todasLasPensiones.filter(p => p.estadoPension === 'VENCIDO').length,
          condonadas: todasLasPensiones.filter(p => p.estadoPension === 'CONDONADO').length
        },
        problemas: {
          pensionesSinIngreso: pensionesSinIngreso.length > 0 ? pensionesSinIngreso.map(p => ({
            id: p.idPensionEstudiante,
            estudiante: `${p.estudiante?.nombre || ''} ${p.estudiante?.apellido || ''}`,
            estado: p.estadoPension,
            monto: p.montoTotal
          })) : undefined,
          pensionesInconsistentes: pensionesInconsistentes.length > 0 ? pensionesInconsistentes.map(p => {
            const ingreso = ingresosCajaSimple.movimientos.find(ing => ing.idPensionRelacionada === p.idPensionEstudiante);
            return {
              id: p.idPensionEstudiante,
              estudiante: `${p.estudiante?.nombre || ''} ${p.estudiante?.apellido || ''}`,
              montoPension: p.montoTotal,
              montoIngreso: ingreso?.monto,
              diferencia: (parseFloat(ingreso?.monto || '0') - parseFloat(p.montoTotal)).toFixed(2)
            };
          }) : undefined
        },
        recomendaciones: [
          pensionesSinIngreso.length > 0 ? `Hay ${pensionesSinIngreso.length} pensiones sin ingreso registrado en caja simple` : null,
          pensionesInconsistentes.length > 0 ? `Hay ${pensionesInconsistentes.length} pensiones con inconsistencias de montos` : null,
          'Ejecutar procesamiento masivo para pensiones pagadas sin registro',
          'Verificar manualmente las inconsistencias encontradas'
        ].filter(Boolean)
      };

    } catch (error) {
      throw new BadRequestException(`Error al generar reporte de conciliación: ${error.message}`);
    }
  }

  // 8. MÉTODOS BÁSICOS
  async findAll(filters?: FilterPensionDto) {
    const queryBuilder = this.pensionRepository.createQueryBuilder('pension')
      .leftJoinAndSelect('pension.estudiante', 'estudiante');

    if (filters?.estadoPension) {
      queryBuilder.where('pension.estado_pension = :estado', { estado: filters.estadoPension });
    }

    return await queryBuilder.getMany();
  }

  async findOne(id: string) {
    const pension = await this.pensionRepository.findOne({
      where: { idPensionEstudiante: id },
      relations: ['estudiante', 'registradoPor']
    });

    if (!pension) {
      throw new NotFoundException('Pensión no encontrada');
    }

    return pension;
  }

  async update(id: string, updatePensionEstudianteDto: UpdatePensionEstudianteDto) {
    const pension = await this.findOne(id);
    Object.assign(pension, updatePensionEstudianteDto);
    pension.actualizadoEn = new Date();

    return await this.pensionRepository.save(pension);
  }

  async remove(id: string) {
    const pension = await this.findOne(id);
    return await this.pensionRepository.remove(pension);
  }
}
