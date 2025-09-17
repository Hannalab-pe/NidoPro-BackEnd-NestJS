import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateBimestreDto } from './dto/create-bimestre.dto';
import { UpdateBimestreDto } from './dto/update-bimestre.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Bimestre } from './entities/bimestre.entity';
import { Repository } from 'typeorm';
import { PeriodoEscolarService } from 'src/periodo-escolar/periodo-escolar.service';

@Injectable()
export class BimestreService {

  constructor(@InjectRepository(Bimestre) private readonly bimestreRepository: Repository<Bimestre>,
    private readonly periodoService: PeriodoEscolarService) { }

  // Función para determinar bimestres de un periodo escolar
  private obtenerBimestres(fechaInicio: Date, fechaFin: Date) {
    const bimestres: { numero: number; inicio: string; fin: string }[] = [];
    let inicio = new Date(fechaInicio);

    for (let i = 0; i < 4; i++) {

      let inicioBimestre = new Date(inicio);
      let finBimestre = new Date(inicio);
      finBimestre.setMonth(finBimestre.getMonth() + 2);
      finBimestre.setDate(finBimestre.getDate() - 1);

      // Ajustes especiales Perú
      if (i === 2) {
        finBimestre.setDate(finBimestre.getDate() + 7); // vacaciones medio año
      }
      if (i === 3) {
        finBimestre = new Date(fechaFin.getFullYear(), 11, 15); // cierre aprox 15 dic
      }

      bimestres.push({
        numero: i + 1,
        inicio: inicioBimestre.toISOString().split('T')[0],
        fin: finBimestre.toISOString().split('T')[0],
      });

      // Avanzar 2 meses para el siguiente bimestre
      inicio.setMonth(inicio.getMonth() + 2);
    }

    return bimestres;
  }

  async create(createBimestreDto: CreateBimestreDto): Promise<{ success: boolean; message: string; bimestre: Bimestre }> {
    // verificamos el periodo escolar
    const periodoEncontrado = await this.periodoService.findOne(createBimestreDto.idPeriodoEscolar);

    if (!periodoEncontrado) {
      throw new NotFoundException('No se encontró el período escolar asociado');
    }

    if (!periodoEncontrado.estaActivo) {
      throw new NotFoundException('El período escolar asociado no está activo');
    }

    // Obtener bimestres automáticos para validación y sugerencias
    const fechaInicioPeriodo = new Date(periodoEncontrado.fechaInicio);
    const fechaFinPeriodo = new Date(periodoEncontrado.fechaFin);
    const bimestresAutomaticos = this.obtenerBimestres(fechaInicioPeriodo, fechaFinPeriodo);

    // Validar que el número de bimestre está en rango válido
    if (createBimestreDto.numeroBimestre < 1 || createBimestreDto.numeroBimestre > 4) {
      throw new BadRequestException('El número de bimestre debe estar entre 1 y 4');
    }

    // Verificar que no existe ya ese número de bimestre para el período
    const bimestreExistente = await this.bimestreRepository.findOne({
      where: {
        numeroBimestre: createBimestreDto.numeroBimestre,
        idPeriodoEscolar: createBimestreDto.idPeriodoEscolar
      }
    });

    if (bimestreExistente) {
      throw new BadRequestException(`Ya existe el bimestre ${createBimestreDto.numeroBimestre} para este período escolar`);
    }

    // Obtener las fechas automáticas sugeridas para este bimestre
    const bimestreAutomatico = bimestresAutomaticos.find(b => b.numero === createBimestreDto.numeroBimestre);

    // Validar fechas del bimestre están dentro del período escolar
    const fechaInicioBimestre = new Date(createBimestreDto.fechaInicio);
    const fechaFinBimestre = new Date(createBimestreDto.fechaFin);
    const fechaLimiteProg = new Date(createBimestreDto.fechaLimiteProgramacion);

    if (fechaInicioBimestre < fechaInicioPeriodo || fechaFinBimestre > fechaFinPeriodo) {
      throw new BadRequestException('Las fechas del bimestre deben estar dentro del período escolar');
    }

    if (fechaFinBimestre <= fechaInicioBimestre) {
      throw new BadRequestException('La fecha de fin debe ser posterior a la fecha de inicio');
    }

    if (fechaLimiteProg >= fechaInicioBimestre) {
      throw new BadRequestException('La fecha límite de programación debe ser anterior a la fecha de inicio del bimestre');
    }

    // Validar que las fechas no se desvíen demasiado de las automáticas (opcional pero recomendado)
    if (bimestreAutomatico) {
      const fechaInicioAutomatica = new Date(bimestreAutomatico.inicio);
      const fechaFinAutomatica = new Date(bimestreAutomatico.fin);

      // Permitir hasta 15 días de diferencia
      const diasDiferenciaInicio = Math.abs((fechaInicioBimestre.getTime() - fechaInicioAutomatica.getTime()) / (1000 * 3600 * 24));
      const diasDiferenciaFin = Math.abs((fechaFinBimestre.getTime() - fechaFinAutomatica.getTime()) / (1000 * 3600 * 24));

      if (diasDiferenciaInicio > 15) {
        throw new BadRequestException(`La fecha de inicio se desvía mucho de la fecha sugerida (${bimestreAutomatico.inicio}). Diferencia: ${Math.round(diasDiferenciaInicio)} días`);
      }

      if (diasDiferenciaFin > 15) {
        throw new BadRequestException(`La fecha de fin se desvía mucho de la fecha sugerida (${bimestreAutomatico.fin}). Diferencia: ${Math.round(diasDiferenciaFin)} días`);
      }
    }

    // Validar orden secuencial (opcional, pero recomendado)
    const bimestresExistentes = await this.bimestreRepository.find({
      where: { idPeriodoEscolar: createBimestreDto.idPeriodoEscolar },
      order: { numeroBimestre: 'ASC' }
    });

    if (bimestresExistentes.length > 0) {
      const ultimoBimestre = bimestresExistentes[bimestresExistentes.length - 1];
      if (createBimestreDto.numeroBimestre !== ultimoBimestre.numeroBimestre + 1) {
        throw new BadRequestException('Los bimestres deben crearse en orden secuencial. Siguiente esperado: ' + (ultimoBimestre.numeroBimestre + 1));
      }

      // Validar que no haya solapamiento de fechas
      const ultimaFechaFin = new Date(ultimoBimestre.fechaFin);
      if (fechaInicioBimestre <= ultimaFechaFin) {
        throw new BadRequestException('Las fechas del bimestre se solapan con el bimestre anterior');
      }
    } else if (createBimestreDto.numeroBimestre !== 1) {
      throw new BadRequestException('El primer bimestre debe ser el número 1');
    }

    // Si se activa este bimestre, desactivar los demás del mismo período
    if (createBimestreDto.estaActivo !== false) {
      await this.bimestreRepository.update(
        { idPeriodoEscolar: createBimestreDto.idPeriodoEscolar, estaActivo: true },
        { estaActivo: false }
      );
    }

    // Crear el bimestre
    const bimestre = this.bimestreRepository.create({
      ...createBimestreDto,
      estaActivo: createBimestreDto.estaActivo ?? true
    });

    const savedBimestre = await this.bimestreRepository.save(bimestre);

    return {
      success: true,
      message: `Bimestre ${createBimestreDto.numeroBimestre} creado correctamente`,
      bimestre: savedBimestre
    };
  }

  // Método para generar automáticamente todos los bimestres de un período
  async generarBimestresAutomaticos(idPeriodoEscolar: string): Promise<{ success: boolean; message: string; bimestres: Bimestre[] }> {
    // Verificar período escolar
    const periodoEncontrado = await this.periodoService.findOne(idPeriodoEscolar);

    if (!periodoEncontrado) {
      throw new NotFoundException('No se encontró el período escolar asociado');
    }

    if (!periodoEncontrado.estaActivo) {
      throw new BadRequestException('El período escolar asociado no está activo');
    }

    // Verificar si ya existen bimestres para este período
    const bimestresExistentes = await this.bimestreRepository.find({
      where: { idPeriodoEscolar }
    });

    if (bimestresExistentes.length > 0) {
      throw new BadRequestException('Ya existen bimestres para este período escolar');
    }

    // Generar bimestres automáticamente
    const fechaInicioPeriodo = new Date(periodoEncontrado.fechaInicio);
    const fechaFinPeriodo = new Date(periodoEncontrado.fechaFin);
    const bimestresAutomaticos = this.obtenerBimestres(fechaInicioPeriodo, fechaFinPeriodo);

    const bimestresCreados: Bimestre[] = [];

    for (const bimestreAuto of bimestresAutomaticos) {
      // Calcular fecha límite de programación (una semana antes del inicio)
      const fechaInicioBim = new Date(bimestreAuto.inicio);
      const fechaLimiteProg = new Date(fechaInicioBim);
      fechaLimiteProg.setDate(fechaLimiteProg.getDate() - 7);

      const bimestre = this.bimestreRepository.create({
        numeroBimestre: bimestreAuto.numero,
        nombreBimestre: this.obtenerNombreBimestre(bimestreAuto.numero),
        fechaInicio: bimestreAuto.inicio,
        fechaFin: bimestreAuto.fin,
        fechaLimiteProgramacion: fechaLimiteProg.toISOString().split('T')[0],
        idPeriodoEscolar,
        estaActivo: bimestreAuto.numero === 1 // Solo el primer bimestre activo
      });

      const savedBimestre = await this.bimestreRepository.save(bimestre);
      bimestresCreados.push(savedBimestre);
    }

    return {
      success: true,
      message: `Se generaron automáticamente ${bimestresCreados.length} bimestres para el período escolar`,
      bimestres: bimestresCreados
    };
  }

  // Método auxiliar para obtener nombres de bimestres
  private obtenerNombreBimestre(numero: number): string {
    const nombres = {
      1: 'Primer Bimestre',
      2: 'Segundo Bimestre',
      3: 'Tercer Bimestre',
      4: 'Cuarto Bimestre'
    };
    return nombres[numero] || `Bimestre ${numero}`;
  }

  // Método para obtener fechas sugeridas para un bimestre específico
  async obtenerFechasSugeridas(idPeriodoEscolar: string, numeroBimestre: number): Promise<{ success: boolean; message: string; fechasSugeridas: any }> {
    const periodoEncontrado = await this.periodoService.findOne(idPeriodoEscolar);

    if (!periodoEncontrado) {
      throw new NotFoundException('No se encontró el período escolar asociado');
    }

    if (numeroBimestre < 1 || numeroBimestre > 4) {
      throw new BadRequestException('El número de bimestre debe estar entre 1 y 4');
    }

    const fechaInicioPeriodo = new Date(periodoEncontrado.fechaInicio);
    const fechaFinPeriodo = new Date(periodoEncontrado.fechaFin);
    const bimestresAutomaticos = this.obtenerBimestres(fechaInicioPeriodo, fechaFinPeriodo);

    const bimestreAutomatico = bimestresAutomaticos.find(b => b.numero === numeroBimestre);

    if (!bimestreAutomatico) {
      throw new BadRequestException('No se pudo calcular las fechas automáticas para este bimestre');
    }

    // Calcular fecha límite de programación sugerida
    const fechaInicioBim = new Date(bimestreAutomatico.inicio);
    const fechaLimiteProg = new Date(fechaInicioBim);
    fechaLimiteProg.setDate(fechaLimiteProg.getDate() - 7);

    return {
      success: true,
      message: 'Fechas sugeridas calculadas correctamente',
      fechasSugeridas: {
        numeroBimestre,
        nombreBimestre: this.obtenerNombreBimestre(numeroBimestre),
        fechaInicio: bimestreAutomatico.inicio,
        fechaFin: bimestreAutomatico.fin,
        fechaLimiteProgramacion: fechaLimiteProg.toISOString().split('T')[0]
      }
    };
  }


  async findAll(): Promise<{ success: boolean; message: string; bimestres: Bimestre[] }> {
    // Verificar y activar automáticamente el bimestre correspondiente a la fecha actual
    await this.verificarYActivarBimestreAutomatico();

    const bimestres = await this.bimestreRepository.find({
      relations: ['idPeriodoEscolar2'],
      order: { numeroBimestre: 'ASC' }
    });

    return {
      success: true,
      message: 'Bimestres encontrados correctamente',
      bimestres
    };
  }

  async findOne(id: string): Promise<Bimestre> {
    const bimestre = await this.bimestreRepository.findOne({
      where: { idBimestre: id },
      relations: ['idPeriodoEscolar2']
    });

    if (!bimestre) {
      throw new NotFoundException(`Bimestre con ID ${id} no encontrado`);
    }

    return bimestre;
  }

  async findByPeriodo(idPeriodoEscolar: string): Promise<{ success: boolean; message: string; bimestres: Bimestre[] }> {
    const bimestres = await this.bimestreRepository.find({
      where: { idPeriodoEscolar },
      relations: ['idPeriodoEscolar2'],
      order: { numeroBimestre: 'ASC' }
    });

    return {
      success: true,
      message: 'Bimestres del período encontrados correctamente',
      bimestres
    };
  }

  async findBimestreActual(): Promise<{ success: boolean; message: string; bimestre: Bimestre | null }> {
    // Verificar y activar automáticamente el bimestre correspondiente a la fecha actual
    await this.verificarYActivarBimestreAutomatico();

    const bimestreActual = await this.bimestreRepository.findOne({
      where: { estaActivo: true },
      relations: ['idPeriodoEscolar2']
    });

    return {
      success: true,
      message: bimestreActual ? 'Bimestre actual encontrado' : 'No hay bimestre activo',
      bimestre: bimestreActual
    };
  }

  // NUEVO MÉTODO: Activar automáticamente el bimestre según la fecha actual
  async activarBimestreAutomatico(): Promise<{ success: boolean; message: string; bimestre: Bimestre | null }> {
    const fechaActual = new Date();
    const fechaActualStr = fechaActual.toISOString().split('T')[0]; // YYYY-MM-DD

    // Buscar el período escolar activo
    const periodoResponse = await this.periodoService.findPeriodoActual();

    if (!periodoResponse.success || !periodoResponse.periodo) {
      return {
        success: false,
        message: 'No hay período escolar activo',
        bimestre: null
      };
    }

    const periodoActivo = periodoResponse.periodo;

    // Buscar el bimestre que corresponde a la fecha actual
    const bimestreCorrespondiente = await this.bimestreRepository
      .createQueryBuilder('bimestre')
      .where('bimestre.idPeriodoEscolar = :periodoId', { periodoId: periodoActivo.idPeriodoEscolar })
      .andWhere('bimestre.fechaInicio <= :fechaActual', { fechaActual: fechaActualStr })
      .andWhere('bimestre.fechaFin >= :fechaActual', { fechaActual: fechaActualStr })
      .getOne();

    if (!bimestreCorrespondiente) {
      return {
        success: false,
        message: 'No se encontró un bimestre que corresponda a la fecha actual',
        bimestre: null
      };
    }

    // Verificar si ya está activo
    if (bimestreCorrespondiente.estaActivo) {
      return {
        success: true,
        message: `El bimestre ${bimestreCorrespondiente.numeroBimestre} ya está activo y corresponde a la fecha actual`,
        bimestre: bimestreCorrespondiente
      };
    }

    // Desactivar todos los bimestres del período
    await this.bimestreRepository.update(
      { idPeriodoEscolar: periodoActivo.idPeriodoEscolar },
      { estaActivo: false }
    );

    // Activar el bimestre correspondiente
    await this.bimestreRepository.update(
      bimestreCorrespondiente.idBimestre,
      { estaActivo: true }
    );

    // Obtener el bimestre actualizado
    const bimestreActivado = await this.findOne(bimestreCorrespondiente.idBimestre);

    return {
      success: true,
      message: `Bimestre ${bimestreActivado.numeroBimestre} activado automáticamente según la fecha actual`,
      bimestre: bimestreActivado
    };
  }

  // MÉTODO AUXILIAR: Verificar y activar bimestre en cada consulta
  async verificarYActivarBimestreAutomatico(): Promise<void> {
    try {
      await this.activarBimestreAutomatico();
    } catch (error) {
      throw new BadRequestException('Error al verificar y activar bimestre automáticamente: ' + error.message);
    }
  }

  async update(id: string, updateBimestreDto: UpdateBimestreDto): Promise<{ success: boolean; message: string; bimestre: Bimestre }> {
    const bimestre = await this.findOne(id);

    // Validar fechas si se están actualizando
    if (updateBimestreDto.fechaInicio || updateBimestreDto.fechaFin || updateBimestreDto.fechaLimiteProgramacion) {
      const fechaInicio = new Date(updateBimestreDto.fechaInicio || bimestre.fechaInicio);
      const fechaFin = new Date(updateBimestreDto.fechaFin || bimestre.fechaFin);
      const fechaLimite = new Date(updateBimestreDto.fechaLimiteProgramacion || bimestre.fechaLimiteProgramacion);

      if (fechaFin <= fechaInicio) {
        throw new BadRequestException('La fecha de fin debe ser posterior a la fecha de inicio');
      }

      if (fechaLimite >= fechaInicio) {
        throw new BadRequestException('La fecha límite de programación debe ser anterior a la fecha de inicio');
      }

      // Validar que esté dentro del período escolar
      const periodoEscolar = bimestre.idPeriodoEscolar2;
      const fechaInicioPeriodo = new Date(periodoEscolar.fechaInicio);
      const fechaFinPeriodo = new Date(periodoEscolar.fechaFin);

      if (fechaInicio < fechaInicioPeriodo || fechaFin > fechaFinPeriodo) {
        throw new BadRequestException('Las fechas del bimestre deben estar dentro del período escolar');
      }
    }

    // Si se activa este bimestre, desactivar los demás
    if (updateBimestreDto.estaActivo === true) {
      await this.bimestreRepository.update(
        { idPeriodoEscolar: bimestre.idPeriodoEscolar, estaActivo: true },
        { estaActivo: false }
      );
    }

    await this.bimestreRepository.update(id, updateBimestreDto);
    const updatedBimestre = await this.findOne(id);

    return {
      success: true,
      message: 'Bimestre actualizado correctamente',
      bimestre: updatedBimestre
    };
  }

  async activar(id: string): Promise<{ success: boolean; message: string; bimestre: Bimestre }> {
    const bimestre = await this.findOne(id);

    // Desactivar todos los bimestres del mismo período
    await this.bimestreRepository.update(
      { idPeriodoEscolar: bimestre.idPeriodoEscolar },
      { estaActivo: false }
    );

    // Activar el bimestre seleccionado
    await this.bimestreRepository.update(id, { estaActivo: true });

    const bimestreActivado = await this.findOne(id);

    return {
      success: true,
      message: `Bimestre ${bimestre.numeroBimestre} activado correctamente`,
      bimestre: bimestreActivado
    };
  }

  async remove(id: string): Promise<{ success: boolean; message: string }> {
    const bimestre = await this.findOne(id);

    // Verificar si tiene datos relacionados (notas, evaluaciones, etc.)
    const relacionesCount = await this.bimestreRepository
      .createQueryBuilder('bimestre')
      .leftJoin('bimestre.notas', 'nota')
      .leftJoin('bimestre.evaluacionDocenteBimestrals', 'evaluacion')
      .leftJoin('bimestre.libretaBimestrals', 'libreta')
      .where('bimestre.idBimestre = :id', { id })
      .andWhere('(nota.id IS NOT NULL OR evaluacion.id IS NOT NULL OR libreta.id IS NOT NULL)')
      .getCount();

    if (relacionesCount > 0) {
      throw new BadRequestException('No se puede eliminar un bimestre que tiene datos relacionados (notas, evaluaciones, libretas)');
    }

    await this.bimestreRepository.delete(id);

    return {
      success: true,
      message: `Bimestre ${bimestre.numeroBimestre} eliminado correctamente`
    };
  }
}
