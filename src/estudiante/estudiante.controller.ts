import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EstudianteService } from './estudiante.service';
import { CreateEstudianteDto } from './dto/create-estudiante.dto';
import { UpdateEstudianteDto } from './dto/update-estudiante.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Estudiantes')
@Controller('estudiante')
export class EstudianteController {
  constructor(private readonly estudianteService: EstudianteService) { }

  @Post()
  @ApiOperation({ summary: 'Registrar un nuevo estudiante' })
  create(@Body() createEstudianteDto: CreateEstudianteDto) {
    return this.estudianteService.create(createEstudianteDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los estudiantes' })
  findAll() {
    return this.estudianteService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un estudiante específico por ID' })
  findOne(@Param('id') id: string) {
    return this.estudianteService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar información de un estudiante' })
  update(@Param('id') id: string, @Body() updateEstudianteDto: UpdateEstudianteDto) {
    return this.estudianteService.update(id, updateEstudianteDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un estudiante (desactivar)' })
  remove(@Param('id') id: string) {
    return this.estudianteService.remove(id);
  }
}
