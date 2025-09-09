import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { TareaService } from './tarea.service';
import { CreateTareaDto } from './dto/create-tarea.dto';
import { UpdateTareaDto } from './dto/update-tarea.dto';

@ApiTags('tareas')
@Controller('tarea')
export class TareaController {
  constructor(private readonly tareaService: TareaService) { }

  @Post()
  @ApiOperation({
    summary:
      'Crear una nueva tarea y asignarla a todos los estudiantes del aula',
  })
  @ApiResponse({ status: 201, description: 'Tarea creada correctamente.' })
  @ApiResponse({ status: 400, description: 'Datos inválidos.' })
  @ApiResponse({ status: 404, description: 'Aula o trabajador no encontrado.' })
  async create(@Body() createTareaDto: CreateTareaDto) {
    return await this.tareaService.create(createTareaDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las tareas' })
  @ApiResponse({ status: 200, description: 'Tareas obtenidas correctamente.' })
  async findAll() {
    return await this.tareaService.findAll();
  }

  @Get('estado/:estado')
  @ApiOperation({ summary: 'Obtener tareas por estado' })
  @ApiParam({ name: 'estado', description: 'Estado de la tarea (pendiente, activa, cerrada)', })
  @ApiResponse({ status: 200, description: 'Tareas obtenidas correctamente.' })
  async findByEstado(@Param('estado') estado: string) {
    return await this.tareaService.findByEstado(estado);
  }

  @Get('trabajador/:idTrabajador')
  @ApiOperation({ summary: 'Obtener tareas de un trabajador específico' })
  @ApiParam({ name: 'idTrabajador', description: 'ID del trabajador' })
  @ApiResponse({
    status: 200,
    description: 'Tareas del trabajador obtenidas correctamente.',
  })
  @ApiResponse({ status: 404, description: 'Trabajador no encontrado.' })
  async findByTrabajador(@Param('idTrabajador') idTrabajador: string) {
    return await this.tareaService.findByTrabajador(idTrabajador);
  }

  @Get('estudiante/:idEstudiante')
  @ApiOperation({ summary: 'Obtener tareas de un estudiante específico' })
  @ApiParam({ name: 'idEstudiante', description: 'ID del estudiante' })
  @ApiResponse({ status: 200, description: 'Tareas del estudiante obtenidas correctamente.', })
  @ApiResponse({ status: 404, description: 'Estudiante no encontrado.' })
  async findByEstudiante(@Param('idEstudiante') idEstudiante: string) {
    return await this.tareaService.obtenerTareaPorEstudianteId(idEstudiante);
  }

  @Get('aula/:idAula')
  @ApiOperation({ summary: 'Obtener tareas de un aula específica' })
  @ApiParam({ name: 'idAula', description: 'ID del aula' })
  @ApiResponse({ status: 200, description: 'Tareas del aula obtenidas correctamente.', })
  async findByAula(@Param('idAula') idAula: string) {
    return await this.tareaService.findByAula(idAula);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una tarea por ID' })
  @ApiParam({ name: 'id', description: 'ID de la tarea' })
  @ApiResponse({ status: 200, description: 'Tarea obtenida correctamente.' })
  @ApiResponse({ status: 404, description: 'Tarea no encontrada.' })
  async findOne(@Param('id') id: string) {
    return await this.tareaService.findOne(id);
  }

  @Get(':id/estadisticas')
  @ApiOperation({ summary: 'Obtener estadísticas de una tarea (entregas realizadas, pendientes, etc.)' })
  @ApiParam({ name: 'id', description: 'ID de la tarea' })
  @ApiResponse({ status: 200, description: 'Estadísticas obtenidas correctamente.' })
  @ApiResponse({ status: 404, description: 'Tarea no encontrada.' })
  async obtenerEstadisticas(@Param('id') id: string) {
    return await this.tareaService.obtenerEstadisticasTarea(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una tarea' })
  @ApiParam({ name: 'id', description: 'ID de la tarea' })
  @ApiResponse({ status: 200, description: 'Tarea actualizada correctamente.' })
  @ApiResponse({ status: 400, description: 'Datos inválidos.' })
  @ApiResponse({ status: 404, description: 'Tarea no encontrada.' })
  @ApiResponse({ status: 409, description: 'Conflicto: No se puede editar tarea con entregas realizadas.' })
  async update(@Param('id') id: string, @Body() updateTareaDto: UpdateTareaDto) {
    return await this.tareaService.update(id, updateTareaDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una tarea' })
  @ApiParam({ name: 'id', description: 'ID de la tarea' })
  @ApiResponse({ status: 200, description: 'Tarea eliminada correctamente.' })
  @ApiResponse({ status: 404, description: 'Tarea no encontrada.' })
  @ApiResponse({ status: 409, description: 'Conflicto: No se puede eliminar tarea con entregas realizadas.' })
  async remove(@Param('id') id: string) {
    return await this.tareaService.remove(id);
  }
}
