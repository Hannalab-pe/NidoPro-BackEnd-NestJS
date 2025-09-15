import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { EstudianteService } from './estudiante.service';
import { CreateEstudianteDto } from './dto/create-estudiante.dto';
import { UpdateEstudianteDto } from './dto/update-estudiante.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Estudiantes')
@Controller('estudiante')
export class EstudianteController {
  constructor(private readonly estudianteService: EstudianteService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar un nuevo estudiante' })
  async create(@Body() createEstudianteDto: CreateEstudianteDto) {
    return await this.estudianteService.create(createEstudianteDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los estudiantes' })
  async findAll() {
    return await this.estudianteService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un estudiante específico por ID' })
  async findOne(@Param('id') id: string) {
    return await this.estudianteService.findOne(id);
  }

  @Get('aula/:idAula')
  @ApiOperation({
    summary:
      'Estudiantes por Aula - Obtener todos los estudiantes de un aula específica',
  })
  async findEstudiantesPorAula(@Param('idAula') idAula: string) {
    return await this.estudianteService.findEstudiantesPorAula(idAula);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar información de un estudiante' })
  async update(
    @Param('id') id: string,
    @Body() updateEstudianteDto: UpdateEstudianteDto,
  ) {
    return await this.estudianteService.update(id, updateEstudianteDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un estudiante (desactivar)' })
  async remove(@Param('id') id: string) {
    return await this.estudianteService.remove(id);
  }
}
