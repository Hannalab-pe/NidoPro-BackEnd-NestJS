import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { EvualuacionDocenteBimestralService } from './evualuacion-docente-bimestral.service';
import { CreateEvualuacionDocenteBimestralDto } from './dto/create-evualuacion-docente-bimestral.dto';
import { UpdateEvualuacionDocenteBimestralDto } from './dto/update-evualuacion-docente-bimestral.dto';

@ApiTags('Evaluación Docente Bimestral')
//@ApiBearerAuth()
@Controller('evaluacion-docente-bimestral')
export class EvualuacionDocenteBimestralController {
  constructor(private readonly evaluacionDocenteBimestralService: EvualuacionDocenteBimestralService) { }

  @Post()
  @ApiOperation({ summary: 'Crear nueva evaluación docente bimestral (solo coordinadores)' })
  @ApiResponse({ status: 201, description: 'Evaluación creada correctamente' })
  @ApiResponse({ status: 403, description: 'Solo coordinadores pueden crear evaluaciones' })
  @ApiResponse({ status: 400, description: 'Ya existe una evaluación para este trabajador en este bimestre' })
  async create(
    @Body() createEvaluacionDto: CreateEvualuacionDocenteBimestralDto,
    @Request() req: any
  ) {
    // Asumiendo que el ID del coordinador viene del token JWT
    const coordinadorId = req.user?.idTrabajador || createEvaluacionDto.idCoordinador;
    return await this.evaluacionDocenteBimestralService.create(createEvaluacionDto, coordinadorId);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las evaluaciones docentes bimestrales' })
  @ApiResponse({ status: 200, description: 'Lista de evaluaciones obtenida correctamente' })
  async findAll() {
    return await this.evaluacionDocenteBimestralService.findAll();
  }

  @Get('trabajador/:idTrabajador')
  @ApiOperation({ summary: 'Obtener evaluaciones por trabajador' })
  @ApiResponse({ status: 200, description: 'Evaluaciones del trabajador obtenidas correctamente' })
  async findByTrabajador(@Param('idTrabajador') idTrabajador: string) {
    return await this.evaluacionDocenteBimestralService.findByTrabajador(idTrabajador);
  }

  @Get('bimestre/:idBimestre')
  @ApiOperation({ summary: 'Obtener evaluaciones por bimestre' })
  @ApiResponse({ status: 200, description: 'Evaluaciones del bimestre obtenidas correctamente' })
  async findByBimestre(@Param('idBimestre') idBimestre: string) {
    return await this.evaluacionDocenteBimestralService.findByBimestre(idBimestre);
  }

  @Get('calificacion/:calificacion')
  @ApiOperation({ summary: 'Obtener evaluaciones por calificación' })
  @ApiResponse({ status: 200, description: 'Evaluaciones por calificación obtenidas correctamente' })
  async findByCalificacion(@Param('calificacion') calificacion: string) {
    return await this.evaluacionDocenteBimestralService.findByCalificacion(calificacion);
  }

  @Get('estadisticas/bimestre/:idBimestre')
  @ApiOperation({ summary: 'Obtener estadísticas del bimestre' })
  @ApiResponse({ status: 200, description: 'Estadísticas del bimestre obtenidas correctamente' })
  async getEstadisticasBimestre(@Param('idBimestre') idBimestre: string) {
    return await this.evaluacionDocenteBimestralService.getEstadisticasBimestre(idBimestre);
  }

  @Get(':id/reporte')
  @ApiOperation({ summary: 'Generar reporte detallado de evaluación' })
  @ApiResponse({ status: 200, description: 'Reporte generado correctamente' })
  @ApiResponse({ status: 404, description: 'Evaluación no encontrada' })
  async generarReporteDetallado(@Param('id') id: string) {
    return await this.evaluacionDocenteBimestralService.generarReporteDetallado(id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener evaluación por ID' })
  @ApiResponse({ status: 200, description: 'Evaluación obtenida correctamente' })
  @ApiResponse({ status: 404, description: 'Evaluación no encontrada' })
  async findOne(@Param('id') id: string) {
    return await this.evaluacionDocenteBimestralService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar evaluación docente bimestral (solo coordinadores)' })
  @ApiResponse({ status: 200, description: 'Evaluación actualizada correctamente' })
  @ApiResponse({ status: 403, description: 'Solo coordinadores pueden actualizar evaluaciones' })
  async update(
    @Param('id') id: string,
    @Body() updateEvaluacionDto: UpdateEvualuacionDocenteBimestralDto,
    @Request() req: any
  ) {
    const coordinadorId = req.user?.idTrabajador;
    return await this.evaluacionDocenteBimestralService.update(id, updateEvaluacionDto, coordinadorId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar evaluación docente bimestral (solo coordinadores)' })
  @ApiResponse({ status: 200, description: 'Evaluación eliminada correctamente' })
  @ApiResponse({ status: 403, description: 'Solo coordinadores pueden eliminar evaluaciones' })
  async remove(@Param('id') id: string, @Request() req: any) {
    const coordinadorId = req.user?.idTrabajador;
    return await this.evaluacionDocenteBimestralService.remove(id, coordinadorId);
  }
}
