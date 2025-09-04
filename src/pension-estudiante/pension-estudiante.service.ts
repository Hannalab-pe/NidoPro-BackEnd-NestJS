import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, IsNull } from 'typeorm';
import { CreatePensionEstudianteDto } from './dto/create-pension-estudiante.dto';
import { UpdatePensionEstudianteDto } from './dto/update-pension-estudiante.dto';
import { UploadVoucherDto } from './dto/upload-voucher.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
import { FilterPensionDto } from './dto/filter-pension.dto';
import { ConfiguracionPensionesDto } from './dto/configuracion-pensiones.dto';
import { PensionEstudiante } from './entities/pension-estudiante.entity';
import { TrabajadorService } from 'src/trabajador/trabajador.service';

@Injectable()
export class PensionEstudianteService {
  constructor(
    @InjectRepository(PensionEstudiante)
    private pensionRepository: Repository<PensionEstudiante>,
    private readonly trabajadorRepository: TrabajadorService,
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

    }
  }

  // 2. GENERAR PENSIONES AUTOMÁTICAS POR AÑO ESCOLAR
  async generarPensionesPorAnioEscolar(anioEscolar: number, configuracion: ConfiguracionPensionesDto, registradoPorId: string) {
    try {
      // 1. Obtener todos los estudiantes matriculados para el año escolar
      const estudiantesMatriculados = await this.obtenerEstudiantesMatriculados(anioEscolar);

      // 2. Generar pensiones para cada mes del año escolar (marzo a diciembre típicamente)
      const mesesEscolares = configuracion.mesesEscolares || [3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
      const pensionesCreadas: PensionEstudiante[] = [];

      for (const estudiante of estudiantesMatriculados) {
        for (const mes of mesesEscolares) {
          // Verificar si ya existe pensión para este mes/año/estudiante
          const existePension = await this.pensionRepository.findOne({
            where: {
              idEstudiante: estudiante.idEstudiante,
              mes,
              anio: anioEscolar
            }
          });

          if (!existePension) {
            const fechaVencimiento = this.calcularFechaVencimiento(mes, anioEscolar, configuracion.diaVencimiento);

            // Determinar el monto según el grado
            let montoFinal = configuracion.montoBase.toString();
            if (configuracion.montoPorGrado && estudiante.grado && configuracion.montoPorGrado[estudiante.grado]) {
              montoFinal = configuracion.montoPorGrado[estudiante.grado].toString();
            }

            const trabajadorRegistra = await this.trabajadorRepository.findOne(registradoPorId);

            const pension = this.pensionRepository.create({
              idEstudiante: estudiante.idEstudiante,
              mes,
              anio: anioEscolar,
              montoPension: montoFinal,
              fechaVencimiento,
              registradoPor: trabajadorRegistra,
              estadoPension: 'PENDIENTE',
              montoTotal: montoFinal,
              creadoEn: new Date(),
            });

            const pensionCreada = await this.pensionRepository.save(pension);
            pensionesCreadas.push(pensionCreada);
          }
        }
      }

      return {
        mensaje: `Se generaron ${pensionesCreadas.length} pensiones para el año escolar ${anioEscolar}`,
        pensionesCreadas: pensionesCreadas.length,
        estudiantesAfectados: estudiantesMatriculados.length
      };

    } catch (error) {
      throw new BadRequestException(`Error al generar pensiones: ${error.message}`);
    }
  }

  // MÉTODO AUXILIAR: Obtener estudiantes matriculados
  private async obtenerEstudiantesMatriculados(anioEscolar: number) {
    // Necesitamos acceso al repositorio de Estudiante y Matricula
    // Por ahora, haremos la consulta desde PensionEstudiante pero conectando correctamente
    const query = `
      SELECT DISTINCT 
        e.id_estudiante as "idEstudiante",
        g.nombre as "grado"
      FROM estudiante e
      INNER JOIN matricula m ON e.id_estudiante = m.id_estudiante
      INNER JOIN grado g ON m.id_grado = g.id_grado
      WHERE EXTRACT(YEAR FROM m.fecha_ingreso) = $1
      AND m.fecha_ingreso BETWEEN $2 AND $3
    `;

    const inicioAnio = `${anioEscolar}-03-01`;
    const finAnio = `${anioEscolar}-12-31`;

    const result = await this.pensionRepository.query(query, [anioEscolar, inicioAnio, finAnio]);
    return result;
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
      where: { idPensionEstudiante: pensionId }
    });

    if (!pension) {
      throw new NotFoundException('Pensión no encontrada');
    }

    pension.estadoPension = verifyData.estadoPension;
    pension.observaciones = verifyData.observaciones;

    // Si se rechaza el pago, limpiar datos del voucher
    if (verifyData.estadoPension === 'PENDIENTE' && verifyData.motivoRechazo) {
      pension.comprobanteUrl = null;
      pension.numeroComprobante = null;
      pension.fechaPago = null;
      pension.montoPagado = null;
      pension.observaciones = `RECHAZADO: ${verifyData.motivoRechazo}`;
    }

    pension.actualizadoEn = new Date();

    return await this.pensionRepository.save(pension);
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
