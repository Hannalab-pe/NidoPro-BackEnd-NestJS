import { Injectable } from '@nestjs/common';
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
    // Verificar si ya existe una libreta para este estudiante y bimestre
    const libretaExistente = await this.libretaBimestralRepository.findOne({
      where: { idEstudiante, idBimestre }
    });

    if (libretaExistente) {
      throw new Error('Ya existe una libreta bimestral para este estudiante en este bimestre');
    }

    // Obtener todas las notas del estudiante en el bimestre
    const notas = await this.notaRepository.find({
      where: {
        idEstudiante,
        idBimestre
      },
      relations: ['idEvaluacion2', 'idTarea']
    });

    if (notas.length === 0) {
      throw new Error('No se encontraron notas para generar la libreta bimestral');
    }

    // Separar notas por tipo (evaluaciones y tareas)
    const notasEvaluaciones = notas.filter(nota => nota.idEvaluacion2 !== null);
    const notasTareas = notas.filter(nota => nota.idTarea !== null);

    // Calcular promedios
    const promedioEvaluaciones = this.calcularPromedioCalificaciones(notasEvaluaciones);
    const promedioTareas = this.calcularPromedioCalificaciones(notasTareas);

    // Calcular promedio final (peso: 70% evaluaciones, 30% tareas)
    const promedioFinal = this.calcularPromedioFinal(promedioEvaluaciones, promedioTareas);

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
      fechaGeneracion: new Date().toISOString().split('T')[0],
      observacionesAcademicas: this.generarObservacionesAcademicas(calificacionFinal, notas.length)
    });

    return await this.libretaBimestralRepository.save(nuevaLibreta);
  }

  // Calcular promedio de calificaciones A, B, C, AD
  private calcularPromedioCalificaciones(notas: Nota[]): number {
    if (notas.length === 0) return 0;

    const totalPuntos = notas.reduce((suma, nota) => {
      // Asumiendo que el puntaje está en formato de letra (A, B, C, AD)
      const puntajeNumerico = this.convertirPuntajeANumero(nota.puntaje);
      return suma + puntajeNumerico;
    }, 0);

    return totalPuntos / notas.length;
  }

  // Convertir puntaje de string a número usando la lógica de kinder
  private convertirPuntajeANumero(puntaje: string): number {
    // Si el puntaje ya es un número, verificar si está en escala 0-20 y convertir
    if (!isNaN(Number(puntaje))) {
      const puntos = Number(puntaje);
      if (puntos >= 18) return CalificacionKinderHelper.calificacionANumero('AD');
      if (puntos >= 14) return CalificacionKinderHelper.calificacionANumero('A');
      if (puntos >= 11) return CalificacionKinderHelper.calificacionANumero('B');
      return CalificacionKinderHelper.calificacionANumero('C');
    }

    // Si es una letra, usar el helper
    return CalificacionKinderHelper.calificacionANumero(puntaje);
  }

  // Calcular promedio final con pesos
  private calcularPromedioFinal(promedioEvaluaciones: number, promedioTareas: number): number {
    const pesoEvaluaciones = 0.7; // 70%
    const pesoTareas = 0.3; // 30%

    return (promedioEvaluaciones * pesoEvaluaciones) + (promedioTareas * pesoTareas);
  }

  // Generar observaciones académicas automáticas
  private generarObservacionesAcademicas(calificacionFinal: string, totalNotas: number): string {
    const descripcion = CalificacionKinderHelper.obtenerDescripcion(calificacionFinal);

    switch (calificacionFinal) {
      case 'AD':
        return `El estudiante demuestra un ${descripcion} en todas las competencias evaluadas. Ha superado las expectativas del grado con ${totalNotas} evaluaciones registradas.`;
      case 'A':
        return `El estudiante ha alcanzado el ${descripcion} en las competencias del grado. Muestra un buen desempeño con ${totalNotas} evaluaciones registradas.`;
      case 'B':
        return `El estudiante se encuentra ${descripcion} hacia el logro de las competencias. Se recomienda refuerzo en algunas áreas. Total de evaluaciones: ${totalNotas}.`;
      case 'C':
        return `El estudiante está ${descripcion} del desarrollo de las competencias. Requiere acompañamiento y refuerzo constante. Total de evaluaciones: ${totalNotas}.`;
      default:
        return `Evaluación en proceso con ${totalNotas} registros.`;
    }
  }

  // Recalcular libreta bimestral existente
  async recalcularLibretaBimestral(idEstudiante: string, idBimestre: string): Promise<LibretaBimestral> {
    // Buscar la libreta existente
    const libretaExistente = await this.libretaBimestralRepository.findOne({
      where: { idEstudiante, idBimestre }
    });

    if (!libretaExistente) {
      throw new Error('No se encontró libreta bimestral para recalcular');
    }

    // Obtener todas las notas actualizadas
    const notas = await this.notaRepository.find({
      where: {
        idEstudiante,
        idBimestre
      },
      relations: ['idEvaluacion2', 'idTarea']
    });

    if (notas.length === 0) {
      throw new Error('No se encontraron notas para recalcular la libreta bimestral');
    }

    // Recalcular promedios
    const notasEvaluaciones = notas.filter(nota => nota.idEvaluacion2 !== null);
    const notasTareas = notas.filter(nota => nota.idTarea !== null);

    const promedioEvaluaciones = this.calcularPromedioCalificaciones(notasEvaluaciones);
    const promedioTareas = this.calcularPromedioCalificaciones(notasTareas);
    const promedioFinal = this.calcularPromedioFinal(promedioEvaluaciones, promedioTareas);
    const calificacionFinal = CalificacionKinderHelper.numeroACalificacion(promedioFinal);

    // Actualizar la libreta
    libretaExistente.promedioEvaluaciones = promedioEvaluaciones.toFixed(2);
    libretaExistente.promedioTareas = promedioTareas.toFixed(2);
    libretaExistente.promedioFinal = promedioFinal.toFixed(2);
    libretaExistente.calificacionFinal = calificacionFinal;
    libretaExistente.observacionesAcademicas = this.generarObservacionesAcademicas(calificacionFinal, notas.length);
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
      throw new Error('No se encontró libreta bimestral para este estudiante y bimestre');
    }

    return libreta;
  }

  create(createLibretaBimestralDto: CreateLibretaBimestralDto) {
    return 'This action adds a new libretaBimestral';
  }

  findAll() {
    return `This action returns all libretaBimestral`;
  }

  findOne(id: number) {
    return `This action returns a #${id} libretaBimestral`;
  }

  update(id: number, updateLibretaBimestralDto: UpdateLibretaBimestralDto) {
    return `This action updates a #${id} libretaBimestral`;
  }

  remove(id: number) {
    return `This action removes a #${id} libretaBimestral`;
  }
}
