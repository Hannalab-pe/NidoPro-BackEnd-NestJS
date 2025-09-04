import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AsignacionCursoService } from './asignacion-curso.service';
import { CreateAsignacionCursoDto } from './dto/create-asignacion-curso.dto';
import { UpdateAsignacionCursoDto } from './dto/update-asignacion-curso.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Asignación de Cursos')
@Controller('asignacion-curso')
export class AsignacionCursoController {
  constructor(private readonly asignacionCursoService: AsignacionCursoService) { }

  @Post()
  @ApiOperation({ summary: 'Asignar un curso a un docente' })
  create(@Body() createAsignacionCursoDto: CreateAsignacionCursoDto) {
    return this.asignacionCursoService.create(createAsignacionCursoDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las asignaciones de cursos' })
  findAll() {
    return this.asignacionCursoService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una asignación de curso específica por ID' })
  findOne(@Param('id') id: string) {
    return this.asignacionCursoService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una asignación de curso' })
  update(@Param('id') id: string, @Body() updateAsignacionCursoDto: UpdateAsignacionCursoDto) {
    return this.asignacionCursoService.update(id, updateAsignacionCursoDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desactivar una asignación de curso (eliminación lógica)' })
  remove(@Param('id') id: string) {
    return this.asignacionCursoService.remove(id);
  }
}
