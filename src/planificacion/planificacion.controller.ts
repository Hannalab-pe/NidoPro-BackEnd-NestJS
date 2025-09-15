import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { PlanificacionService } from './planificacion.service';
import { CreatePlanificacionDto } from './dto/create-planificacion.dto';
import { UpdatePlanificacionDto } from './dto/update-planificacion.dto';

@ApiTags('Planificación')
@Controller('planificacion')
export class PlanificacionController {
  constructor(private readonly planificacionService: PlanificacionService) { }

  @Post()
  @ApiOperation({ summary: 'Crear nueva planificación' })
  @ApiResponse({
    status: 201,
    description: 'Planificación creada correctamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada inválidos',
  })
  @ApiResponse({
    status: 404,
    description: 'Trabajador o aula no encontrado',
  })
  async create(@Body() createPlanificacionDto: CreatePlanificacionDto) {
    return await this.planificacionService.create(createPlanificacionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las planificaciones' })
  @ApiResponse({
    status: 200,
    description: 'Lista de planificaciones obtenida correctamente',
  })
  async findAll() {
    return await this.planificacionService.findAll();
  }

  @Get('trabajador/:idTrabajador')
  @ApiOperation({ summary: 'Obtener planificaciones por trabajador' })
  @ApiParam({
    name: 'idTrabajador',
    description: 'ID del trabajador',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de planificaciones del trabajador obtenida correctamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Trabajador no encontrado',
  })
  async findByTrabajador(@Param('idTrabajador', ParseUUIDPipe) idTrabajador: string) {
    return await this.planificacionService.findByTrabajador(idTrabajador);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener planificación por ID' })
  @ApiParam({
    name: 'id',
    description: 'ID de la planificación',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiResponse({
    status: 200,
    description: 'Planificación encontrada',
  })
  @ApiResponse({
    status: 404,
    description: 'Planificación no encontrada',
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return await this.planificacionService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar planificación' })
  @ApiParam({
    name: 'id',
    description: 'ID de la planificación',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiResponse({
    status: 200,
    description: 'Planificación actualizada correctamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada inválidos',
  })
  @ApiResponse({
    status: 404,
    description: 'Planificación no encontrada',
  })
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() updatePlanificacionDto: UpdatePlanificacionDto) {
    return await this.planificacionService.update(id, updatePlanificacionDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar planificación' })
  @ApiParam({
    name: 'id',
    description: 'ID de la planificación',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiResponse({
    status: 200,
    description: 'Planificación eliminada correctamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Planificación no encontrada',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return await this.planificacionService.remove(id);
  }
}
