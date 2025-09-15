import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { AnotacionesEstudianteService } from './anotaciones-estudiante.service';
import { CreateAnotacionesEstudianteDto } from './dto/create-anotaciones-estudiante.dto';
import { UpdateAnotacionesEstudianteDto } from './dto/update-anotaciones-estudiante.dto';

@ApiTags('anotaciones-estudiante')
@Controller('anotaciones-estudiante')
export class AnotacionesEstudianteController {
  constructor(private readonly anotacionesEstudianteService: AnotacionesEstudianteService) { }

  @Post()
  @ApiOperation({ summary: 'Crear una nueva anotación de estudiante' })
  @ApiResponse({ status: 201, description: 'Anotación creada correctamente.' })
  @ApiResponse({ status: 400, description: 'Datos inválidos.' })
  @ApiResponse({ status: 404, description: 'Trabajador, estudiante o curso no encontrado.' })
  async create(@Body() createAnotacionesEstudianteDto: CreateAnotacionesEstudianteDto) {
    return await this.anotacionesEstudianteService.create(createAnotacionesEstudianteDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las anotaciones de estudiantes' })
  @ApiResponse({ status: 200, description: 'Lista de anotaciones obtenida correctamente.' })
  async findAll() {
    return await this.anotacionesEstudianteService.findAll();
  }

  @Get('estudiante/:idEstudiante')
  @ApiOperation({ summary: 'Obtener anotaciones por estudiante' })
  @ApiParam({ name: 'idEstudiante', description: 'ID del estudiante' })
  @ApiResponse({ status: 200, description: 'Anotaciones del estudiante obtenidas correctamente.' })
  async findByEstudiante(@Param('idEstudiante') idEstudiante: string) {
    return await this.anotacionesEstudianteService.findByEstudiante(idEstudiante);
  }

  @Get('trabajador/:idTrabajador')
  @ApiOperation({ summary: 'Obtener anotaciones por trabajador (docente)' })
  @ApiParam({ name: 'idTrabajador', description: 'ID del trabajador' })
  @ApiResponse({ status: 200, description: 'Anotaciones del trabajador obtenidas correctamente.' })
  async findByTrabajador(@Param('idTrabajador') idTrabajador: string) {
    return await this.anotacionesEstudianteService.findByTrabajador(idTrabajador);
  }

  @Get('curso/:idCurso')
  @ApiOperation({ summary: 'Obtener anotaciones por curso' })
  @ApiParam({ name: 'idCurso', description: 'ID del curso' })
  @ApiResponse({ status: 200, description: 'Anotaciones del curso obtenidas correctamente.' })
  async findByCurso(@Param('idCurso') idCurso: string) {
    return await this.anotacionesEstudianteService.findByCurso(idCurso);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una anotación por ID' })
  @ApiParam({ name: 'id', description: 'ID de la anotación' })
  @ApiResponse({ status: 200, description: 'Anotación obtenida correctamente.' })
  @ApiResponse({ status: 404, description: 'Anotación no encontrada.' })
  async findOne(@Param('id') id: string) {
    return await this.anotacionesEstudianteService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una anotación' })
  @ApiParam({ name: 'id', description: 'ID de la anotación' })
  @ApiResponse({ status: 200, description: 'Anotación actualizada correctamente.' })
  @ApiResponse({ status: 404, description: 'Anotación no encontrada.' })
  async update(@Param('id') id: string, @Body() updateAnotacionesEstudianteDto: UpdateAnotacionesEstudianteDto) {
    return await this.anotacionesEstudianteService.update(id, updateAnotacionesEstudianteDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una anotación (soft delete)' })
  @ApiParam({ name: 'id', description: 'ID de la anotación' })
  @ApiResponse({ status: 200, description: 'Anotación eliminada correctamente.' })
  @ApiResponse({ status: 404, description: 'Anotación no encontrada.' })
  async remove(@Param('id') id: string) {
    return await this.anotacionesEstudianteService.remove(id);
  }
}
