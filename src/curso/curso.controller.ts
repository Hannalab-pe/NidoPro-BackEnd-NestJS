import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CursoService } from './curso.service';
import { CreateCursoDto } from './dto/create-curso.dto';
import { UpdateCursoDto } from './dto/update-curso.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Cursos')
@Controller('curso')
export class CursoController {
  constructor(private readonly cursoService: CursoService) { }

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo curso' })
  async create(@Body() createCursoDto: CreateCursoDto) {
    const data = await this.cursoService.create(createCursoDto);
    return {
      success: true,
      message: "Curso Registrado Correctamente",
      info: {
        data,
      }
    };
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los cursos' })
  async findAll() {
    const data = await this.cursoService.findAll();
    return {
      success: true,
      message: "Cursos Listados Correctamente",
      info: {
        data,
      }
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un curso específico por ID' })
  async findOne(@Param('id') id: string) {
    const data = await this.cursoService.findOne(id);
    return {
      success: true,
      message: "Curso Encontrado Correctamente",
      info: {
        data,
      }
    };
  }


  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un curso específico' })
  async update(@Param('id') id: string, @Body() updateCursoDto: UpdateCursoDto) {
    const data = await this.cursoService.update(id, updateCursoDto);
    return {
      success: true,
      message: `Curso Actualizado Correctamente con el ID ${id}`,
      info: {
        data,
      }
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un curso específico' })
  async delete(@Param('id') id: string) {
    await this.cursoService.delete(id);
    return {
      success: true,
      message: `Curso Eliminado Correctamente con el ID ${id}`,
    };
  }

}
