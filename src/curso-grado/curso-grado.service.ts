import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCursoGradoDto } from './dto/create-curso-grado.dto';
import { UpdateCursoGradoDto } from './dto/update-curso-grado.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CursoGrado } from './entities/curso-grado.entity';
import { CursoService } from 'src/curso/curso.service';
import { GradoService } from 'src/grado/grado.service';
import { CreateCursoDto } from '../curso/dto/create-curso.dto';
import { Curso } from 'src/curso/entities/curso.entity';

@Injectable()
export class CursoGradoService {

  constructor(
    @InjectRepository(CursoGrado)
    private readonly cursoGradoRepository: Repository<CursoGrado>,
    private cursoService: CursoService,
    private gradoService: GradoService,
    private datasource: DataSource
  ) { }

  // 📝 DOCUMENTACIÓN DE LA TRANSACCIÓN PASO A PASO:

  async create(createCursoGradoDto: CreateCursoGradoDto): Promise<CursoGrado | null> {
    return await this.datasource.transaction(async manager => {

      // 🔍 PASO 1: MANEJO DEL CURSO
      let curso: Curso;

      if (createCursoGradoDto.idCurso) {
        // ✅ Escenario A: ID de curso proporcionado
        curso = await this.cursoService.findOne(createCursoGradoDto.idCurso);
        if (!curso) {
          throw new NotFoundException(`Curso con ID ${createCursoGradoDto.idCurso} no encontrado`);
        }
      } else if (createCursoGradoDto.cursoData) {
        // ✅ Escenario B: Crear nuevo curso
        const createCursoDto = {
          nombreCurso: createCursoGradoDto.cursoData.nombreCurso,
          descripcion: createCursoGradoDto.cursoData.descripcion,
          estaActivo: createCursoGradoDto.cursoData.estaActivo ?? true
        };
        curso = await this.cursoService.create(createCursoDto);
      } else {
        throw new BadRequestException('Debe proporcionar idCurso o cursoData');
      }

      // 🔍 PASO 2: VALIDACIÓN DEL GRADO (OBLIGATORIO)
      if (!createCursoGradoDto.idGrado) {
        throw new BadRequestException('idGrado es requerido');
      }

      const grado = await this.gradoService.findOne(createCursoGradoDto.idGrado);
      if (!grado) {
        throw new NotFoundException(`Grado con ID ${createCursoGradoDto.idGrado} no encontrado`);
      }

      // 🔍 PASO 3: VERIFICAR DUPLICADOS
      const existeAsignacion = await this.cursoGradoRepository.findOne({
        where: {
          idCurso: curso.idCurso,
          idGrado: grado.idGrado
        }
      });

      if (existeAsignacion) {
        throw new ConflictException(`Ya existe una asignación entre el curso ${curso.nombreCurso} y el grado ${grado.grado}`);
      }

      // 🔍 PASO 4: CREAR LA ASIGNACIÓN CURSO-GRADO
      const nuevoCursoGrado = this.cursoGradoRepository.create({
        curso: curso,
        grado: grado,
        estaActivo: createCursoGradoDto.estaActivo ?? true,
        fechaAsignacion: createCursoGradoDto.fechaAsignacion || new Date().toISOString().split('T')[0]
      });

      const cursoGradoGuardado = await manager.save(CursoGrado, nuevoCursoGrado);

      // 🔍 PASO 5: RETORNAR CON RELACIONES
      return cursoGradoGuardado;
    });
  }

  findAll() {
    return `This action returns all cursoGrado`;
  }

  findOne(id: number) {
    return `This action returns a #${id} cursoGrado`;
  }

  update(id: number, updateCursoGradoDto: UpdateCursoGradoDto) {
    return `This action updates a #${id} cursoGrado`;
  }

  remove(id: number) {
    return `This action removes a #${id} cursoGrado`;
  }
}
