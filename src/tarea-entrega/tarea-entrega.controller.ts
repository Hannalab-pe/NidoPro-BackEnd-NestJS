import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { TareaEntregaService } from './tarea-entrega.service';
import { CreateTareaEntregaDto } from './dto/create-tarea-entrega.dto';
import { UpdateTareaEntregaDto } from './dto/update-tarea-entrega.dto';

@ApiTags('tarea-entrega')
@Controller('tarea-entrega')
export class TareaEntregaController {
  constructor(private readonly tareaEntregaService: TareaEntregaService) {}

  @Post()
  @ApiOperation({
    summary: 'Registrar la entrega de una tarea por parte de un estudiante',
  })
  @ApiResponse({
    status: 201,
    description: 'Entrega registrada correctamente.',
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos o tarea cerrada.' })
  @ApiResponse({
    status: 404,
    description: 'Tarea o estudiante no encontrado.',
  })
  async registrarTareaEntrega(
    @Body() createTareaEntregaDto: CreateTareaEntregaDto,
  ) {
    return await this.tareaEntregaService.registrarEntrega(
      createTareaEntregaDto,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las entregas de tareas' })
  @ApiResponse({
    status: 200,
    description: 'Entregas obtenidas correctamente.',
  })
  findAll() {
    return this.tareaEntregaService.findAll();
  }

  @Get('tarea/:idTarea')
  @ApiOperation({
    summary:
      'Obtener todas las entregas de una tarea específica con estadísticas',
  })
  @ApiParam({ name: 'idTarea', description: 'ID de la tarea' })
  @ApiResponse({
    status: 200,
    description: 'Entregas de la tarea obtenidas correctamente.',
  })
  findByTarea(@Param('idTarea') idTarea: string) {
    return this.tareaEntregaService.findByTarea(idTarea);
  }

  @Get('estudiante/:idEstudiante')
  @ApiOperation({
    summary: 'Obtener todas las entregas de un estudiante específico',
  })
  @ApiParam({ name: 'idEstudiante', description: 'ID del estudiante' })
  @ApiResponse({
    status: 200,
    description: 'Entregas del estudiante obtenidas correctamente.',
  })
  findByEstudiante(@Param('idEstudiante') idEstudiante: string) {
    return this.tareaEntregaService.findByEstudiante(idEstudiante);
  }

  @Get('estado/:estado')
  @ApiOperation({ summary: 'Obtener entregas por estado' })
  @ApiParam({
    name: 'estado',
    description:
      'Estado de la entrega (pendiente, entregado, tarde, no_realizado, revisado)',
  })
  @ApiResponse({
    status: 200,
    description: 'Entregas obtenidas correctamente.',
  })
  findByEstado(@Param('estado') estado: string) {
    return this.tareaEntregaService.findByEstado(estado);
  }

  @Get('aula/:idAula')
  @ApiOperation({ summary: 'Obtener todas las entregas de un aula específica' })
  @ApiParam({ name: 'idAula', description: 'ID del aula' })
  @ApiResponse({
    status: 200,
    description: 'Entregas del aula obtenidas correctamente.',
  })
  findByAula(@Param('idAula') idAula: string) {
    return this.tareaEntregaService.findByAula(idAula);
  }

  @Get('pendientes/por-vencer')
  @ApiOperation({
    summary:
      'Obtener entregas pendientes que están por vencer (próximas 48 horas)',
  })
  @ApiResponse({
    status: 200,
    description: 'Entregas pendientes por vencer obtenidas correctamente.',
  })
  obtenerPendientesPorVencer() {
    return this.tareaEntregaService.obtenerEntregasPendientesPorVencer();
  }

  @Get('reporte/tarea/:idTarea')
  @ApiOperation({ summary: 'Generar reporte completo de una tarea' })
  @ApiParam({ name: 'idTarea', description: 'ID de la tarea' })
  @ApiResponse({ status: 200, description: 'Reporte generado correctamente.' })
  @ApiResponse({ status: 404, description: 'Tarea no encontrada.' })
  generarReporteTarea(@Param('idTarea') idTarea: string) {
    return this.tareaEntregaService.generarReporteTarea(idTarea);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una entrega específica por ID' })
  @ApiParam({ name: 'id', description: 'ID de la entrega' })
  @ApiResponse({ status: 200, description: 'Entrega obtenida correctamente.' })
  @ApiResponse({ status: 404, description: 'Entrega no encontrada.' })
  findOne(@Param('id') id: string) {
    return this.tareaEntregaService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una entrega de tarea' })
  @ApiParam({ name: 'id', description: 'ID de la entrega' })
  @ApiResponse({
    status: 200,
    description: 'Entrega actualizada correctamente.',
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos o tarea cerrada.' })
  @ApiResponse({ status: 404, description: 'Entrega no encontrada.' })
  update(
    @Param('id') id: string,
    @Body() updateTareaEntregaDto: UpdateTareaEntregaDto,
  ) {
    return this.tareaEntregaService.update(id, updateTareaEntregaDto);
  }

  @Patch(':id/revisar')
  @ApiOperation({ summary: 'Marcar una entrega como revisada por el docente' })
  @ApiParam({ name: 'id', description: 'ID de la entrega' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        observacionesDocente: {
          type: 'string',
          description: 'Observaciones del docente',
        },
      },
      required: ['observacionesDocente'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Entrega marcada como revisada correctamente.',
  })
  @ApiResponse({
    status: 400,
    description: 'La entrega no está en estado válido para revisar.',
  })
  @ApiResponse({ status: 404, description: 'Entrega no encontrada.' })
  marcarComoRevisado(
    @Param('id') id: string,
    @Body() body: { observacionesDocente: string },
  ) {
    return this.tareaEntregaService.marcarComoRevisado(
      id,
      body.observacionesDocente,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una entrega de tarea' })
  @ApiParam({ name: 'id', description: 'ID de la entrega' })
  @ApiResponse({ status: 200, description: 'Entrega eliminada correctamente.' })
  @ApiResponse({
    status: 400,
    description: 'No se puede eliminar una entrega de tarea cerrada.',
  })
  @ApiResponse({ status: 404, description: 'Entrega no encontrada.' })
  @ApiResponse({
    status: 409,
    description: 'Conflicto: No se puede eliminar entrega ya realizada.',
  })
  remove(@Param('id') id: string) {
    return this.tareaEntregaService.remove(id);
  }
}
