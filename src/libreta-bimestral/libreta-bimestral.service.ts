import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateLibretaBimestralDto } from './dto/create-libreta-bimestral.dto';
import { UpdateLibretaBimestralDto } from './dto/update-libreta-bimestral.dto';
import { LibretaBimestral } from './entities/libreta-bimestral.entity';
import { Nota } from '../nota/entities/nota.entity';
import { CalificacionKinderHelper } from '../enums/calificacion-kinder.enum';

@Injectable()
export class LibretaBimestralService {
  constructor(
    @InjectRepository(LibretaBimestral)
    private libretaBimestralRepository: Repository<LibretaBimestral>,
    @InjectRepository(Nota)
    private notaRepository: Repository<Nota>,
  ) { }

  // Generar libreta bimestral automáticamente
  async generarLibretaBimestral(idEstudiante: string, idBimestre: string, idAula: string): Promise<LibretaBimestral> {
    // Validar parámetros
    if (!idEstudiante || !idBimestre || !idAula) {
      throw new BadRequestException('Todos los parámetros son requeridos: idEstudiante, idBimestre, idAula');
    }

    // Verificar si ya existe una libreta para este estudiante y bimestre
    const libretaExistente = await this.libretaBimestralRepository.findOne({
      where: { idEstudiante, idBimestre }
    });

    if (libretaExistente) {
      throw new BadRequestException('Ya existe una libreta bimestral para este estudiante en este bimestre. Use la función de recalcular si desea actualizarla.');
    }

    // Obtener todas las notas del estudiante en el bimestre
    const notas = await this.notaRepository.find({
      where: {
        idEstudiante,
        idBimestre
      },
      relations: ['idEvaluacion2', 'idTarea', 'idBimestre2']
    });


    if (notas.length === 0) {

      const libretaDefecto = this.libretaBimestralRepository.create({
        idEstudiante,
        idBimestre,
        idAula: { idAula } as any,
        promedioEvaluaciones: '0.00',
        promedioTareas: '0.00',
        promedioFinal: '0.00',
        calificacionFinal: 'C',
        conducta: 'A',
        fechaGeneracion: new Date().toISOString().split('T')[0],
        observacionesAcademicas: 'No se han registrado evaluaciones para este bimestre. Libreta pendiente de completar.',
        observacionesConducta: 'Sin observaciones registradas.'
      });

      return await this.libretaBimestralRepository.save(libretaDefecto);
    }

    // Separar notas por tipo (evaluaciones y tareas)
    const notasEvaluaciones = notas.filter(nota => nota.idEvaluacion2 !== null);
    const notasTareas = notas.filter(nota => nota.idTarea !== null);


    // Calcular promedios
    const promedioEvaluaciones = this.calcularPromedioCalificaciones(notasEvaluaciones);
    const promedioTareas = this.calcularPromedioCalificaciones(notasTareas);

    // Calcular promedio final con validación
    const promedioFinal = this.calcularPromedioFinal(promedioEvaluaciones, promedioTareas, notasEvaluaciones.length, notasTareas.length);

    // Convertir promedio final a calificación literal
    const calificacionFinal = CalificacionKinderHelper.numeroACalificacion(promedioFinal);


    // Crear la libreta bimestral
    const nuevaLibreta = this.libretaBimestralRepository.create({
      idEstudiante,
      idBimestre,
      idAula: { idAula } as any,
      promedioEvaluaciones: promedioEvaluaciones.toFixed(2),
      promedioTareas: promedioTareas.toFixed(2),
      promedioFinal: promedioFinal.toFixed(2),
      calificacionFinal,
      conducta: 'A', // Valor por defecto
      fechaGeneracion: new Date().toISOString().split('T')[0],
      observacionesAcademicas: this.generarObservacionesAcademicas(calificacionFinal, notas.length, notasEvaluaciones.length, notasTareas.length),
      observacionesConducta: 'Sin observaciones registradas.'
    });

    return await this.libretaBimestralRepository.save(nuevaLibreta);
  }  // Calcular promedio de calificaciones A, B, C, AD
  private calcularPromedioCalificaciones(notas: Nota[]): number {
    if (notas.length === 0) return 0;

    const totalPuntos = notas.reduce((suma, nota) => {
      // Asumiendo que el puntaje está en formato de letra (A, B, C, AD)
      const puntajeNumerico = this.convertirPuntajeANumero(nota.puntaje);
      return suma + puntajeNumerico;
    }, 0);

    return totalPuntos / notas.length;
  }

  // Convertir puntaje de string a número usando la lógica de kinder (mejorado)
  private convertirPuntajeANumero(puntaje: string): number {
    if (!puntaje) return 0;

    // Limpiar el puntaje (remover espacios y convertir a mayúsculas)
    const puntajeLimpio = puntaje.toString().trim().toUpperCase();

    // Si es directamente una calificación de kinder (A, B, C, AD)
    if (['A', 'B', 'C', 'AD'].includes(puntajeLimpio)) {
      return CalificacionKinderHelper.calificacionANumero(puntajeLimpio);
    }

    // Si el puntaje es numérico, convertir según rangos
    if (!isNaN(Number(puntajeLimpio))) {
      const puntos = Number(puntajeLimpio);

      // Verificar si está en escala 0-20 y convertir a kinder
      if (puntos >= 0 && puntos <= 20) {
        if (puntos >= 18) return CalificacionKinderHelper.calificacionANumero('AD');
        if (puntos >= 14) return CalificacionKinderHelper.calificacionANumero('A');
        if (puntos >= 11) return CalificacionKinderHelper.calificacionANumero('B');
        return CalificacionKinderHelper.calificacionANumero('C');
      }

      // Si está en escala 0-4 (ya en formato kinder numérico)
      if (puntos >= 0 && puntos <= 4) {
        return puntos;
      }
    }

    // Si no se puede convertir, retornar valor mínimo
    console.warn(`No se pudo convertir el puntaje: ${puntaje}. Usando valor por defecto.`);
    return CalificacionKinderHelper.calificacionANumero('C');
  }

  // Calcular promedio final con pesos y validaciones mejoradas
  private calcularPromedioFinal(
    promedioEvaluaciones: number,
    promedioTareas: number,
    cantidadEvaluaciones: number = 0,
    cantidadTareas: number = 0
  ): number {
    // Si no hay evaluaciones ni tareas
    if (cantidadEvaluaciones === 0 && cantidadTareas === 0) {
      return 0;
    }

    // Si solo hay evaluaciones
    if (cantidadEvaluaciones > 0 && cantidadTareas === 0) {
      return promedioEvaluaciones;
    }

    // Si solo hay tareas
    if (cantidadTareas > 0 && cantidadEvaluaciones === 0) {
      return promedioTareas;
    }

    // Si hay ambos, aplicar pesos (70% evaluaciones, 30% tareas)
    const pesoEvaluaciones = 0.7;
    const pesoTareas = 0.3;

    return (promedioEvaluaciones * pesoEvaluaciones) + (promedioTareas * pesoTareas);
  }

  // Generar observaciones académicas automáticas mejoradas
  private generarObservacionesAcademicas(
    calificacionFinal: string,
    totalNotas: number,
    cantidadEvaluaciones: number = 0,
    cantidadTareas: number = 0
  ): string {
    const descripcion = CalificacionKinderHelper.obtenerDescripcion(calificacionFinal);
    const detalleNotas = `${cantidadEvaluaciones} evaluaciones y ${cantidadTareas} tareas registradas`;

    switch (calificacionFinal) {
      case 'AD':
        return `El estudiante demuestra un ${descripcion} en todas las competencias evaluadas. Ha superado las expectativas del grado. Registro: ${detalleNotas}.`;
      case 'A':
        return `El estudiante ha alcanzado el ${descripcion} en las competencias del grado. Muestra un buen desempeño académico. Registro: ${detalleNotas}.`;
      case 'B':
        return `El estudiante se encuentra ${descripcion} hacia el logro de las competencias. Se recomienda refuerzo en algunas áreas. Registro: ${detalleNotas}.`;
      case 'C':
        return `El estudiante está ${descripcion} del desarrollo de las competencias. Requiere acompañamiento y refuerzo constante. Registro: ${detalleNotas}.`;
      default:
        return `Evaluación en proceso. Total de registros: ${totalNotas}.`;
    }
  }

  // Recalcular libreta bimestral existente
  async recalcularLibretaBimestral(idEstudiante: string, idBimestre: string): Promise<LibretaBimestral> {
    // Buscar la libreta existente
    const libretaExistente = await this.libretaBimestralRepository.findOne({
      where: { idEstudiante, idBimestre }
    });

    if (!libretaExistente) {
      throw new NotFoundException('No se encontró libreta bimestral para recalcular');
    }

    // Obtener todas las notas actualizadas
    const notas = await this.notaRepository.find({
      where: {
        idEstudiante,
        idBimestre
      },
      relations: ['idEvaluacion2', 'idTarea', 'idBimestre2']
    });


    // Si no hay notas, mantener valores mínimos
    if (notas.length === 0) {
      libretaExistente.promedioEvaluaciones = '0.00';
      libretaExistente.promedioTareas = '0.00';
      libretaExistente.promedioFinal = '0.00';
      libretaExistente.calificacionFinal = 'C';
      libretaExistente.observacionesAcademicas = 'No se han registrado evaluaciones para este bimestre. Libreta pendiente de completar.';
      libretaExistente.fechaGeneracion = new Date().toISOString().split('T')[0];

      return await this.libretaBimestralRepository.save(libretaExistente);
    }

    // Recalcular promedios
    const notasEvaluaciones = notas.filter(nota => nota.idEvaluacion2 !== null);
    const notasTareas = notas.filter(nota => nota.idTarea !== null);

    const promedioEvaluaciones = this.calcularPromedioCalificaciones(notasEvaluaciones);
    const promedioTareas = this.calcularPromedioCalificaciones(notasTareas);
    const promedioFinal = this.calcularPromedioFinal(promedioEvaluaciones, promedioTareas, notasEvaluaciones.length, notasTareas.length);
    const calificacionFinal = CalificacionKinderHelper.numeroACalificacion(promedioFinal);

    // Actualizar la libreta
    libretaExistente.promedioEvaluaciones = promedioEvaluaciones.toFixed(2);
    libretaExistente.promedioTareas = promedioTareas.toFixed(2);
    libretaExistente.promedioFinal = promedioFinal.toFixed(2);
    libretaExistente.calificacionFinal = calificacionFinal;
    libretaExistente.observacionesAcademicas = this.generarObservacionesAcademicas(calificacionFinal, notas.length, notasEvaluaciones.length, notasTareas.length);
    libretaExistente.fechaGeneracion = new Date().toISOString().split('T')[0];

    return await this.libretaBimestralRepository.save(libretaExistente);
  }

  // Obtener libreta por estudiante y bimestre
  async obtenerLibretaPorEstudianteYBimestre(idEstudiante: string, idBimestre: string): Promise<LibretaBimestral> {
    const libreta = await this.libretaBimestralRepository.findOne({
      where: { idEstudiante, idBimestre },
      relations: ['idEstudiante2', 'idBimestre2', 'idAula']
    });

    if (!libreta) {
      throw new NotFoundException('No se encontró libreta bimestral para este estudiante y bimestre');
    }

    return libreta;
  }

  create(createLibretaBimestralDto: CreateLibretaBimestralDto) {
    return this.generarLibretaBimestral(
      createLibretaBimestralDto.idEstudiante,
      createLibretaBimestralDto.idBimestre,
      createLibretaBimestralDto.idAula
    );
  }

  async findAll() {
    const libretas = await this.libretaBimestralRepository.find({
      relations: ['idEstudiante2', 'idBimestre2', 'idAula'],
      order: { fechaGeneracion: 'DESC' }
    });
    return libretas;
  }

  async findOne(id: string) {
    const libreta = await this.libretaBimestralRepository.findOne({
      where: { idLibretaBimestral: id },
      relations: ['idEstudiante2', 'idBimestre2', 'idAula']
    });

    if (!libreta) {
      throw new NotFoundException('Libreta bimestral no encontrada');
    }

    return libreta;
  }

  async update(id: string, updateLibretaBimestralDto: UpdateLibretaBimestralDto) {
    const libreta = await this.libretaBimestralRepository.findOne({
      where: { idLibretaBimestral: id }
    });

    if (!libreta) {
      throw new NotFoundException('Libreta bimestral no encontrada');
    }

    // Actualizar solo los campos permitidos manualmente
    if (updateLibretaBimestralDto.observacionesConducta !== undefined) {
      libreta.observacionesConducta = updateLibretaBimestralDto.observacionesConducta;
    }

    if (updateLibretaBimestralDto.conducta !== undefined) {
      libreta.conducta = updateLibretaBimestralDto.conducta;
    }

    return await this.libretaBimestralRepository.save(libreta);
  }

  async remove(id: string) {
    const result = await this.libretaBimestralRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException('Libreta bimestral no encontrada');
    }

    return { message: 'Libreta bimestral eliminada exitosamente' };
  }
}
