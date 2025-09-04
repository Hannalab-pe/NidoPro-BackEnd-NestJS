import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateProgramacionMensualDto } from './dto/create-programacion-mensual.dto';
import { UpdateProgramacionMensualDto } from './dto/update-programacion-mensual.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ProgramacionMensual } from './entities/programacion-mensual.entity';
import { Repository } from 'typeorm';
import { EstadoProgramacionMensual } from '../enums/estado-programacion-mensual.enum';
import { TrabajadorService } from 'src/trabajador/trabajador.service';
import { AulaService } from 'src/aula/aula.service';
import { BimestreService } from 'src/bimestre/bimestre.service';
import * as XLSX from 'xlsx';

@Injectable()
export class ProgramacionMensualService {
  constructor(
    @InjectRepository(ProgramacionMensual)
    private readonly programacionRepository: Repository<ProgramacionMensual>,
    private readonly bimestreRepository: BimestreService,
    private readonly trabajadorRepository: TrabajadorService,
    private readonly aulaRepository: AulaService,
  ) {}

  async create(
    createProgramacionMensualDto: CreateProgramacionMensualDto,
  ): Promise<{
    success: boolean;
    message: string;
    programacion: ProgramacionMensual;
  }> {
    // 1. Validar que el bimestre existe y está activo
    const bimestre = await this.bimestreRepository.findOne(
      createProgramacionMensualDto.idBimestre,
    );

    if (!bimestre) {
      throw new NotFoundException('El bimestre especificado no existe');
    }

    if (!bimestre.estaActivo) {
      throw new BadRequestException(
        'No se puede crear programación para un bimestre inactivo',
      );
    }

    // 2. Validar que el trabajador existe y está activo
    const trabajador = await this.trabajadorRepository.findOne(
      createProgramacionMensualDto.idTrabajador,
    );
    if (!trabajador) {
      throw new NotFoundException('El trabajador especificado no existe');
    }

    if (!trabajador.estaActivo) {
      throw new BadRequestException('El trabajador no está activo');
    }

    // 3. Validar que el aula existe
    const aula = await this.aulaRepository.findOne(
      createProgramacionMensualDto.idAula,
    );

    if (!aula) {
      throw new NotFoundException('El aula especificada no existe');
    }

    // 4. Validar que el año y mes corresponden al bimestre
    const fechaInicioBimestre = new Date(bimestre.fechaInicio);
    const fechaFinBimestre = new Date(bimestre.fechaFin);

    if (
      createProgramacionMensualDto.anio !== fechaInicioBimestre.getFullYear()
    ) {
      throw new BadRequestException(
        'El año no corresponde al período del bimestre',
      );
    }

    // Validar que el mes está dentro del rango del bimestre
    const mesInicioBimestre = fechaInicioBimestre.getMonth() + 1;
    const mesFinBimestre = fechaFinBimestre.getMonth() + 1;

    if (
      createProgramacionMensualDto.mes < mesInicioBimestre ||
      createProgramacionMensualDto.mes > mesFinBimestre
    ) {
      throw new BadRequestException(
        `El mes debe estar entre ${mesInicioBimestre} y ${mesFinBimestre} para este bimestre`,
      );
    }

    // 5. Verificar que no existe ya una programación para este trabajador/mes/bimestre/aula
    const programacionExistente = await this.programacionRepository.findOne({
      where: {
        idTrabajador: createProgramacionMensualDto.idTrabajador,
        mes: createProgramacionMensualDto.mes,
        anio: createProgramacionMensualDto.anio,
        idBimestre: createProgramacionMensualDto.idBimestre,
        idAula: createProgramacionMensualDto.idAula,
      },
    });

    if (programacionExistente) {
      throw new BadRequestException(
        'Ya existe una programación para este trabajador, mes, bimestre y aula',
      );
    }

    // 6. Verificar fechas límite y crear observación automática si es necesario
    const fechaLimite = new Date(bimestre.fechaLimiteProgramacion);
    const fechaActual = new Date();
    let observacionAutomatica = '';

    if (fechaActual > fechaLimite) {
      observacionAutomatica = `La programación fue subida fuera de tiempo. Fecha límite: ${fechaLimite.toLocaleDateString('es-ES')}, Fecha de subida: ${fechaActual.toLocaleDateString('es-ES')}.`;
    } else {
      observacionAutomatica =
        'Programación subida dentro del plazo establecido.';
    }

    // 7. Combinar observaciones del usuario con la observación automática
    let observacionesFinal = observacionAutomatica;
    if (createProgramacionMensualDto.observaciones) {
      observacionesFinal += ` ${createProgramacionMensualDto.observaciones}`;
    }

    // 8. Generar título automático si no se proporciona uno específico
    const tituloAuto = this.generarTituloAutomatico(
      createProgramacionMensualDto.mes,
      createProgramacionMensualDto.anio,
      aula.seccion,
    );

    // 9. Crear la programación
    const programacion = this.programacionRepository.create({
      ...createProgramacionMensualDto,
      titulo: createProgramacionMensualDto.titulo || tituloAuto,
      estado:
        createProgramacionMensualDto.estado ||
        EstadoProgramacionMensual.PENDIENTE,
      observaciones: observacionesFinal,
      fechaSubida: new Date(),
    });

    const savedProgramacion =
      await this.programacionRepository.save(programacion);

    return {
      success: true,
      message: 'Programación mensual creada correctamente',
      programacion: savedProgramacion,
    };
  }

  // Método para generar todas las programaciones mensuales de un bimestre para un trabajador
  async generarProgramacionesBimestre(
    idTrabajador: string,
    idBimestre: string,
    idAula: string,
  ): Promise<{
    success: boolean;
    message: string;
    programaciones: ProgramacionMensual[];
  }> {
    const bimestre = await this.bimestreRepository.findOne(idBimestre);

    if (!bimestre) {
      throw new NotFoundException('El bimestre especificado no existe');
    }

    const fechaInicio = new Date(bimestre.fechaInicio);
    const fechaFin = new Date(bimestre.fechaFin);

    const mesesDelBimestre = this.obtenerMesesDelBimestre(
      fechaInicio,
      fechaFin,
    );
    const programacionesCreadas: ProgramacionMensual[] = [];

    for (const mes of mesesDelBimestre) {
      try {
        const dto: CreateProgramacionMensualDto = {
          titulo: this.generarTituloAutomatico(
            mes,
            fechaInicio.getFullYear(),
            '',
          ),
          descripcion: `Programación generada automáticamente para el mes ${mes}`,
          mes,
          anio: fechaInicio.getFullYear(),
          idTrabajador,
          idBimestre,
          idAula,
          estado: EstadoProgramacionMensual.PENDIENTE,
        };

        const resultado = await this.create(dto);
        programacionesCreadas.push(resultado.programacion);
      } catch (error) {
        // Si ya existe, continuamos con el siguiente mes
        if (error.message.includes('Ya existe una programación')) {
          continue;
        }
        throw error;
      }
    }

    return {
      success: true,
      message: `Se generaron ${programacionesCreadas.length} programaciones mensuales`,
      programaciones: programacionesCreadas,
    };
  }

  // Método para presentar la programación (cambiar estado)
  async presentarProgramacion(
    id: string,
    archivoUrl: string,
    observaciones?: string,
  ): Promise<{
    success: boolean;
    message: string;
    programacion: ProgramacionMensual;
  }> {
    const programacion = await this.findOne(id);

    if (programacion.estado !== EstadoProgramacionMensual.PENDIENTE) {
      throw new BadRequestException(
        'Solo se pueden presentar programaciones en estado PENDIENTE',
      );
    }

    // Validar fecha límite y crear observación automática
    const bimestre = await this.bimestreRepository.findOne(
      programacion.idBimestre,
    );

    if (!bimestre) {
      throw new NotFoundException('Bimestre no encontrado');
    }

    const fechaLimite = new Date(bimestre.fechaLimiteProgramacion);
    const fechaActual = new Date();
    let observacionAutomatica = '';

    if (fechaActual > fechaLimite) {
      observacionAutomatica = `La programación fue presentada fuera de tiempo. Fecha límite: ${fechaLimite.toLocaleDateString('es-ES')}, Fecha de presentación: ${fechaActual.toLocaleDateString('es-ES')}.`;
    } else {
      observacionAutomatica =
        'Programación presentada dentro del plazo establecido.';
    }

    // Combinar observaciones existentes, del usuario y la automática
    let observacionesFinal = observacionAutomatica;
    if (programacion.observaciones) {
      observacionesFinal = `${programacion.observaciones} ${observacionAutomatica}`;
    }
    if (observaciones) {
      observacionesFinal += ` ${observaciones}`;
    }

    await this.programacionRepository.update(id, {
      estado: EstadoProgramacionMensual.PRESENTADA,
      archivoUrl,
      observaciones: observacionesFinal,
      fechaSubida: new Date(),
    });

    const updatedProgramacion = await this.findOne(id);

    return {
      success: true,
      message: 'Programación presentada correctamente',
      programacion: updatedProgramacion,
    };
  }

  // Método para aprobar/rechazar programación (solo coordinadores)
  async evaluarProgramacion(
    id: string,
    estado:
      | EstadoProgramacionMensual.APROBADA
      | EstadoProgramacionMensual.RECHAZADA,
    observaciones: string,
  ): Promise<{
    success: boolean;
    message: string;
    programacion: ProgramacionMensual;
  }> {
    const programacion = await this.findOne(id);

    if (
      ![
        EstadoProgramacionMensual.PRESENTADA,
        EstadoProgramacionMensual.REVISION,
      ].includes(programacion.estado as any)
    ) {
      throw new BadRequestException(
        'Solo se pueden evaluar programaciones PRESENTADAS o en REVISION',
      );
    }

    const updateData: any = {
      estado,
      observaciones,
    };

    if (estado === EstadoProgramacionMensual.APROBADA) {
      updateData.fechaAprobacion = new Date();
    }

    await this.programacionRepository.update(id, updateData);
    const updatedProgramacion = await this.findOne(id);

    return {
      success: true,
      message: `Programación ${estado.toLowerCase()} correctamente`,
      programacion: updatedProgramacion,
    };
  }

  // Métodos auxiliares
  private generarTituloAutomatico(
    mes: number,
    anio: number,
    seccion: string,
  ): string {
    const nombresMeses = [
      '',
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
    ];

    return `Programación ${nombresMeses[mes]} ${anio}${seccion ? ` - Aula ${seccion}` : ''}`;
  }

  private obtenerMesesDelBimestre(fechaInicio: Date, fechaFin: Date): number[] {
    const meses: number[] = [];
    const mesInicio = fechaInicio.getMonth() + 1;
    const mesFin = fechaFin.getMonth() + 1;

    for (let mes = mesInicio; mes <= mesFin; mes++) {
      meses.push(mes);
    }

    return meses;
  }

  async findAll(): Promise<{
    success: boolean;
    message: string;
    programaciones: ProgramacionMensual[];
  }> {
    const programaciones = await this.programacionRepository.find({
      relations: ['bimestre', 'trabajador', 'aula'],
      order: { fechaSubida: 'DESC' },
    });

    return {
      success: true,
      message: 'Programaciones encontradas correctamente',
      programaciones,
    };
  }

  async findByTrabajador(
    idTrabajador: string,
  ): Promise<{
    success: boolean;
    message: string;
    programaciones: ProgramacionMensual[];
  }> {
    const programaciones = await this.programacionRepository.find({
      where: { idTrabajador },
      relations: ['bimestre', 'trabajador', 'aula'],
      order: { anio: 'DESC', mes: 'DESC' },
    });

    return {
      success: true,
      message: 'Programaciones del trabajador encontradas correctamente',
      programaciones,
    };
  }

  async findByBimestre(
    idBimestre: string,
  ): Promise<{
    success: boolean;
    message: string;
    programaciones: ProgramacionMensual[];
  }> {
    const programaciones = await this.programacionRepository.find({
      where: { idBimestre },
      relations: ['bimestre', 'trabajador', 'aula'],
      order: { mes: 'ASC' },
    });

    return {
      success: true,
      message: 'Programaciones del bimestre encontradas correctamente',
      programaciones,
    };
  }

  async findByEstado(
    estado: EstadoProgramacionMensual,
  ): Promise<{
    success: boolean;
    message: string;
    programaciones: ProgramacionMensual[];
  }> {
    const programaciones = await this.programacionRepository.find({
      where: { estado },
      relations: ['bimestre', 'trabajador', 'aula'],
      order: { fechaSubida: 'DESC' },
    });

    return {
      success: true,
      message: `Programaciones en estado ${estado} encontradas correctamente`,
      programaciones,
    };
  }

  async findOne(id: string): Promise<ProgramacionMensual> {
    const programacion = await this.programacionRepository.findOne({
      where: { idProgramacionMensual: id },
      relations: ['bimestre', 'trabajador', 'aula'],
    });

    if (!programacion) {
      throw new NotFoundException(
        `Programación mensual con ID ${id} no encontrada`,
      );
    }

    return programacion;
  }

  async update(
    id: string,
    updateProgramacionMensualDto: UpdateProgramacionMensualDto,
  ): Promise<{
    success: boolean;
    message: string;
    programacion: ProgramacionMensual;
  }> {
    const programacion = await this.findOne(id);

    // Solo permitir edición si está en estado PENDIENTE o RECHAZADA
    if (
      ![
        EstadoProgramacionMensual.PENDIENTE,
        EstadoProgramacionMensual.RECHAZADA,
      ].includes(programacion.estado as any)
    ) {
      throw new BadRequestException(
        'Solo se pueden editar programaciones PENDIENTES o RECHAZADAS',
      );
    }

    // Verificar si es una corrección (estaba RECHAZADA)
    const esFrecorreccion =
      programacion.estado === EstadoProgramacionMensual.RECHAZADA;

    // Validar fechas límite y crear observación automática actualizada
    const bimestre = await this.bimestreRepository.findOne(
      programacion.idBimestre,
    );

    if (!bimestre) {
      throw new NotFoundException('Bimestre no encontrado');
    }

    const fechaLimite = new Date(bimestre.fechaLimiteProgramacion);
    const fechaActual = new Date();
    let observacionAutomatica = '';

    // Crear observación según el contexto
    if (esFrecorreccion) {
      if (fechaActual > fechaLimite) {
        observacionAutomatica = `Programación corregida fuera de tiempo. Fecha límite: ${fechaLimite.toLocaleDateString('es-ES')}, Fecha de corrección: ${fechaActual.toLocaleDateString('es-ES')}.`;
      } else {
        observacionAutomatica = `Programación corregida dentro del plazo. Fecha de corrección: ${fechaActual.toLocaleDateString('es-ES')}.`;
      }
    } else {
      // Es una modificación regular
      if (fechaActual > fechaLimite) {
        observacionAutomatica = `Programación modificada fuera de tiempo. Fecha límite: ${fechaLimite.toLocaleDateString('es-ES')}, Fecha de modificación: ${fechaActual.toLocaleDateString('es-ES')}.`;
      } else {
        observacionAutomatica = `Programación modificada dentro del plazo. Fecha de modificación: ${fechaActual.toLocaleDateString('es-ES')}.`;
      }
    }

    // Combinar observaciones existentes con las nuevas
    let observacionesFinal = observacionAutomatica;
    if (programacion.observaciones) {
      observacionesFinal = `${programacion.observaciones} | ${observacionAutomatica}`;
    }
    if (updateProgramacionMensualDto.observaciones) {
      observacionesFinal += ` ${updateProgramacionMensualDto.observaciones}`;
    }

    // Preparar datos de actualización
    const updateData = {
      ...updateProgramacionMensualDto,
      observaciones: observacionesFinal,
      fechaSubida: new Date(), // Actualizar fecha de última modificación
      estado: esFrecorreccion
        ? EstadoProgramacionMensual.PENDIENTE
        : programacion.estado, // Si era rechazada, vuelve a pendiente
    };

    await this.programacionRepository.update(id, updateData);
    const updatedProgramacion = await this.findOne(id);

    const mensaje = esFrecorreccion
      ? 'Programación corregida y reenviada para revisión correctamente'
      : 'Programación mensual actualizada correctamente';

    return {
      success: true,
      message: mensaje,
      programacion: updatedProgramacion,
    };
  }

  // Método específico para que el coordinador rechace una programación
  async rechazarProgramacion(
    id: string,
    motivoRechazo: string,
    coordinadorId: string,
  ): Promise<{
    success: boolean;
    message: string;
    programacion: ProgramacionMensual;
  }> {
    const programacion = await this.findOne(id);

    // Solo se pueden rechazar programaciones PENDIENTES o EN_REVISION
    if (
      ![EstadoProgramacionMensual.PENDIENTE, 'EN_REVISION'].includes(
        programacion.estado as any,
      )
    ) {
      throw new BadRequestException(
        'Solo se pueden rechazar programaciones PENDIENTES o EN REVISION',
      );
    }

    // Actualizar programación con estado RECHAZADA
    const fechaActual = new Date();
    const observacionRechazo = `Programación rechazada el ${fechaActual.toLocaleDateString('es-ES')}. Motivo: ${motivoRechazo}`;

    let observacionesFinal = observacionRechazo;
    if (programacion.observaciones) {
      observacionesFinal = `${programacion.observaciones} | ${observacionRechazo}`;
    }

    await this.programacionRepository.update(id, {
      estado: EstadoProgramacionMensual.RECHAZADA,
      observaciones: observacionesFinal,
    });

    const updatedProgramacion = await this.findOne(id);

    return {
      success: true,
      message:
        'Programación rechazada correctamente. El docente podrá corregirla y reenviarla.',
      programacion: updatedProgramacion,
    };
  }

  async remove(id: string): Promise<{ success: boolean; message: string }> {
    const programacion = await this.findOne(id);

    // Solo permitir eliminación si está en estado PENDIENTE
    if (programacion.estado !== EstadoProgramacionMensual.PENDIENTE) {
      throw new BadRequestException(
        'Solo se pueden eliminar programaciones en estado PENDIENTE',
      );
    }

    await this.programacionRepository.delete(id);

    return {
      success: true,
      message: 'Programación mensual eliminada correctamente',
    };
  }

  // Método para verificar programaciones vencidas y marcarlas
  async marcarProgramacionesVencidas(): Promise<{
    success: boolean;
    message: string;
    marcadas: number;
  }> {
    const fechaActual = new Date();

    const programacionesPendientes = await this.programacionRepository
      .createQueryBuilder('programacion')
      .leftJoin('programacion.bimestre', 'bimestre')
      .where('programacion.estado = :estado', {
        estado: EstadoProgramacionMensual.PENDIENTE,
      })
      .andWhere('bimestre.fechaLimiteProgramacion < :fechaActual', {
        fechaActual,
      })
      .getMany();

    if (programacionesPendientes.length > 0) {
      await this.programacionRepository.update(
        {
          idProgramacionMensual: programacionesPendientes.map(
            (p) => p.idProgramacionMensual,
          ) as any,
        },
        { estado: EstadoProgramacionMensual.VENCIDA },
      );
    }

    return {
      success: true,
      message: `Se marcaron ${programacionesPendientes.length} programaciones como vencidas`,
      marcadas: programacionesPendientes.length,
    };
  }

  // ==================== MÉTODOS PARA CARGA MASIVA CON EXCEL ====================

  /**
   * Genera una plantilla de Excel para carga masiva de programaciones mensuales
   */
  async generarPlantillaExcel(): Promise<Buffer> {
    // Crear un nuevo workbook
    const workbook = XLSX.utils.book_new();

    // Crear hoja de datos con headers
    const headers = [
      'Titulo',
      'Descripcion',
      'Mes (1-12)',
      'Año (4 dígitos)',
      'Fecha (Automática)',
      'Estado (PENDIENTE)',
      'Archivo URL',
      'Observaciones',
      'Fecha Aprobación (Automática)',
      'ID Trabajador',
      'ID Bimestre',
      'ID Aula',
    ];

    // Crear datos de ejemplo
    const datosEjemplo = [
      [
        'Programación Enero 2025 - Aula A1',
        'Programación curricular para el mes de enero correspondiente al primer bimestre',
        1,
        2025,
        'Se calcula automáticamente',
        'PENDIENTE',
        'https://ejemplo.com/archivo.pdf',
        'Sin observaciones adicionales',
        'Se llena automáticamente al aprobar',
        'Buscar en sistema - Ej: 123e4567-e89b-12d3-a456-426614174000',
        'Buscar en sistema - Ej: 456e7890-e89b-12d3-a456-426614174001',
        'Buscar en sistema - Ej: 789e0123-e89b-12d3-a456-426614174002',
      ],
    ];

    // Combinar headers con datos de ejemplo
    const worksheetData = [headers, ...datosEjemplo];

    // Crear worksheet principal
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // Configurar ancho de columnas
    worksheet['!cols'] = [
      { wch: 30 }, // Titulo
      { wch: 50 }, // Descripcion
      { wch: 12 }, // Mes
      { wch: 12 }, // Año
      { wch: 20 }, // Fecha
      { wch: 15 }, // Estado
      { wch: 40 }, // Archivo URL
      { wch: 30 }, // Observaciones
      { wch: 20 }, // Fecha Aprobación
      { wch: 40 }, // ID Trabajador
      { wch: 40 }, // ID Bimestre
      { wch: 40 }, // ID Aula
    ];

    // Agregar worksheet al workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Programaciones');

    // Crear hoja de instrucciones
    const instrucciones = [
      ['INSTRUCCIONES PARA CARGA MASIVA DE PROGRAMACIONES MENSUALES'],
      [''],
      ['COLUMNAS OBLIGATORIAS:'],
      [
        'A - Titulo: Título descriptivo de la programación (máximo 200 caracteres)',
      ],
      ['B - Descripcion: Descripción detallada del contenido'],
      ['C - Mes: Número del mes (1-12)'],
      ['D - Año: Año en formato de 4 dígitos (ej: 2025)'],
      ['E - Fecha: SE CALCULA AUTOMÁTICAMENTE - No llenar'],
      ['F - Estado: Siempre "PENDIENTE" - Se actualiza automáticamente'],
      ['G - Archivo URL: URL del archivo PDF (opcional)'],
      ['H - Observaciones: Comentarios adicionales (opcional)'],
      ['I - Fecha Aprobación: SE LLENA AUTOMÁTICAMENTE - No llenar'],
      [''],
      ['COLUMNAS DE IDs - MUY IMPORTANTE:'],
      ['J - ID Trabajador: Debe obtener este ID del sistema'],
      ['K - ID Bimestre: Debe obtener este ID del sistema'],
      ['L - ID Aula: Debe obtener este ID del sistema'],
      [''],
      ['CÓMO OBTENER LOS IDs:'],
      ['1. Ingrese al sistema y vaya a la sección correspondiente'],
      [
        '2. Para ID Trabajador: Vaya a "Trabajadores" y copie el ID del trabajador deseado',
      ],
      [
        '3. Para ID Bimestre: Vaya a "Bimestres" y copie el ID del bimestre actual',
      ],
      [
        '4. Para ID Aula: Vaya a "Aulas" y copie el ID del aula correspondiente',
      ],
      [''],
      ['IMPORTANTE:'],
      ['- Los IDs son únicos para cada registro'],
      [
        '- No puede existir duplicados de: trabajador + mes + año + bimestre + aula',
      ],
      ['- El mes debe estar dentro del rango del bimestre seleccionado'],
      ['- El año debe corresponder al período del bimestre'],
      ['- Elimine esta fila de ejemplo antes de subir el archivo'],
      [''],
      ['FORMATO DEL ARCHIVO:'],
      ['- Guarde como archivo Excel (.xlsx)'],
      ['- No modifique los nombres de las columnas'],
      ['- Complete desde la fila 2 en adelante'],
    ];

    const worksheetInstrucciones = XLSX.utils.aoa_to_sheet(instrucciones);

    // Configurar ancho de columnas para instrucciones
    worksheetInstrucciones['!cols'] = [{ wch: 80 }];

    // Agregar hoja de instrucciones
    XLSX.utils.book_append_sheet(
      workbook,
      worksheetInstrucciones,
      'Instrucciones',
    );

    // Convertir a buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    return buffer;
  }

  /**
   * Procesa un archivo Excel para carga masiva de programaciones mensuales
   */
  async procesarArchivoExcel(archivoBuffer: Buffer): Promise<{
    success: boolean;
    message: string;
    resultados: {
      exitosas: number;
      fallidas: number;
      errores: Array<{ fila: number; error: string; datos: any }>;
      programacionesCreadas: ProgramacionMensual[];
    };
  }> {
    try {
      // Leer el archivo Excel
      const workbook = XLSX.read(archivoBuffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0]; // Tomar la primera hoja
      const worksheet = workbook.Sheets[sheetName];

      // Convertir a JSON
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      // Verificar que hay datos
      if (data.length < 2) {
        throw new BadRequestException(
          'El archivo Excel debe contener al menos una fila de datos además de los headers',
        );
      }

      // Obtener headers (primera fila)
      const headers = data[0] as string[];

      // Validar headers esperados
      const headersEsperados = [
        'Titulo',
        'Descripcion',
        'Mes (1-12)',
        'Año (4 dígitos)',
        'Fecha (Automática)',
        'Estado (PENDIENTE)',
        'Archivo URL',
        'Observaciones',
        'Fecha Aprobación (Automática)',
        'ID Trabajador',
        'ID Bimestre',
        'ID Aula',
      ];

      const headersValidos = this.validarHeaders(headers, headersEsperados);
      if (!headersValidos) {
        throw new BadRequestException(
          'Los headers del archivo Excel no coinciden con la plantilla esperada',
        );
      }

      // Procesar cada fila
      const resultados = {
        exitosas: 0,
        fallidas: 0,
        errores: [] as Array<{ fila: number; error: string; datos: any }>,
        programacionesCreadas: [] as ProgramacionMensual[],
      };

      // Iterar desde la fila 2 (índice 1)
      for (let i = 1; i < data.length; i++) {
        const fila = data[i] as any[];
        const numeroFila = i + 1;

        try {
          // Extraer datos de la fila
          const programacionData = {
            titulo: fila[0]?.toString().trim(),
            descripcion: fila[1]?.toString().trim(),
            mes: parseInt(fila[2]?.toString()),
            anio: parseInt(fila[3]?.toString()),
            // fila[4] es fecha automática - ignorar
            // fila[5] es estado - usar PENDIENTE por defecto
            archivoUrl: fila[6]?.toString().trim() || null,
            observaciones: fila[7]?.toString().trim() || null,
            // fila[8] es fecha aprobación automática - ignorar
            idTrabajador: fila[9]?.toString().trim(),
            idBimestre: fila[10]?.toString().trim(),
            idAula: fila[11]?.toString().trim(),
          };

          // Validar datos básicos
          this.validarDatosFila(programacionData, numeroFila);

          // Crear DTO
          const createDto: CreateProgramacionMensualDto = {
            titulo: programacionData.titulo,
            descripcion: programacionData.descripcion,
            mes: programacionData.mes,
            anio: programacionData.anio,
            estado: EstadoProgramacionMensual.PENDIENTE,
            archivoUrl: programacionData.archivoUrl,
            observaciones: programacionData.observaciones,
            idTrabajador: programacionData.idTrabajador,
            idBimestre: programacionData.idBimestre,
            idAula: programacionData.idAula,
          };

          // Crear la programación
          const resultado = await this.create(createDto);
          resultados.programacionesCreadas.push(resultado.programacion);
          resultados.exitosas++;
        } catch (error) {
          resultados.fallidas++;
          resultados.errores.push({
            fila: numeroFila,
            error: error.message,
            datos: fila,
          });
        }
      }

      return {
        success: true,
        message: `Procesamiento completado: ${resultados.exitosas} exitosas, ${resultados.fallidas} fallidas`,
        resultados,
      };
    } catch (error) {
      throw new BadRequestException(
        `Error al procesar archivo Excel: ${error.message}`,
      );
    }
  }

  /**
   * Valida que los headers del archivo coincidan con la plantilla
   */
  private validarHeaders(
    headers: string[],
    headersEsperados: string[],
  ): boolean {
    if (headers.length !== headersEsperados.length) {
      return false;
    }

    for (let i = 0; i < headersEsperados.length; i++) {
      if (headers[i]?.toString().trim() !== headersEsperados[i]) {
        return false;
      }
    }

    return true;
  }

  /**
   * Valida los datos de una fila del Excel
   */
  private validarDatosFila(datos: any, numeroFila: number): void {
    const errores: string[] = [];

    // Validar campos obligatorios
    if (!datos.titulo) {
      errores.push('Titulo es obligatorio');
    } else if (datos.titulo.length > 200) {
      errores.push('Titulo no debe exceder 200 caracteres');
    }

    if (!datos.descripcion) {
      errores.push('Descripcion es obligatoria');
    }

    if (isNaN(datos.mes) || datos.mes < 1 || datos.mes > 12) {
      errores.push('Mes debe ser un número entre 1 y 12');
    }

    if (isNaN(datos.anio) || datos.anio.toString().length !== 4) {
      errores.push('Año debe ser un número de 4 dígitos');
    }

    if (!datos.idTrabajador) {
      errores.push('ID Trabajador es obligatorio');
    } else if (!this.esUuidValido(datos.idTrabajador)) {
      errores.push('ID Trabajador debe ser un UUID válido');
    }

    if (!datos.idBimestre) {
      errores.push('ID Bimestre es obligatorio');
    } else if (!this.esUuidValido(datos.idBimestre)) {
      errores.push('ID Bimestre debe ser un UUID válido');
    }

    if (!datos.idAula) {
      errores.push('ID Aula es obligatorio');
    } else if (!this.esUuidValido(datos.idAula)) {
      errores.push('ID Aula debe ser un UUID válido');
    }

    // Si hay errores, lanzar excepción
    if (errores.length > 0) {
      throw new Error(`Fila ${numeroFila}: ${errores.join(', ')}`);
    }
  }

  /**
   * Valida si una cadena es un UUID válido
   */
  private esUuidValido(uuid: string): boolean {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }
}
