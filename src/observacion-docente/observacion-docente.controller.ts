import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ObservacionDocenteService } from './observacion-docente.service';
import { CreateObservacionDocenteDto } from './dto/create-observacion-docente.dto';
import { UpdateObservacionDocenteDto } from './dto/update-observacion-docente.dto';
import { EstadoObservacionDocente } from '../enums/estado-observacion-docente.enum';

@ApiTags('Observación Docente')
@ApiBearerAuth()
@Controller('observacion-docente')
export class ObservacionDocenteController {
  constructor(private readonly observacionDocenteService: ObservacionDocenteService) { }

  @Post()
  @ApiOperation({ summary: 'Crear nueva observación docente (solo coordinadores)' })
  @ApiResponse({ status: 201, description: 'Observación creada correctamente' })
  @ApiResponse({ status: 403, description: 'Solo coordinadores pueden crear observaciones' })
  create(
    @Body() createObservacionDocenteDto: CreateObservacionDocenteDto,
    @Request() req: any
  ) {
    // Asumiendo que el ID del coordinador viene del token JWT
    const coordinadorId = req.user?.idTrabajador || createObservacionDocenteDto.idCoordinador;
    return this.observacionDocenteService.create(createObservacionDocenteDto, coordinadorId);
  }

  @Patch(':id/estado')
  @ApiOperation({ summary: 'Cambiar estado de observación (solo coordinadores)' })
  @ApiResponse({ status: 200, description: 'Estado cambiado correctamente' })
  cambiarEstado(
    @Param('id') id: string,
    @Body() body: { estado: EstadoObservacionDocente; observaciones?: string },
    @Request() req: any
  ) {
    const coordinadorId = req.user?.idTrabajador;
    return this.observacionDocenteService.cambiarEstado(id, body.estado, coordinadorId, body.observaciones);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las observaciones docentes' })
  @ApiResponse({ status: 200, description: 'Lista de observaciones obtenida correctamente' })
  findAll() {
    return this.observacionDocenteService.findAll();
  }

  @Get('trabajador/:idTrabajador')
  @ApiOperation({ summary: 'Obtener observaciones por trabajador' })
  @ApiResponse({ status: 200, description: 'Observaciones del trabajador obtenidas correctamente' })
  findByTrabajador(@Param('idTrabajador') idTrabajador: string) {
    return this.observacionDocenteService.findByTrabajador(idTrabajador);
  }

  @Get('bimestre/:idBimestre')
  @ApiOperation({ summary: 'Obtener observaciones por bimestre' })
  @ApiResponse({ status: 200, description: 'Observaciones del bimestre obtenidas correctamente' })
  findByBimestre(@Param('idBimestre') idBimestre: string) {
    return this.observacionDocenteService.findByBimestre(idBimestre);
  }

  @Get('estado')
  @ApiOperation({ summary: 'Obtener observaciones por estado' })
  @ApiQuery({ name: 'estado', enum: EstadoObservacionDocente })
  @ApiResponse({ status: 200, description: 'Observaciones por estado obtenidas correctamente' })
  findByEstado(@Query('estado') estado: EstadoObservacionDocente) {
    return this.observacionDocenteService.findByEstado(estado);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener observación por ID' })
  @ApiResponse({ status: 200, description: 'Observación obtenida correctamente' })
  @ApiResponse({ status: 404, description: 'Observación no encontrada' })
  findOne(@Param('id') id: string) {
    return this.observacionDocenteService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar observación docente (solo coordinadores)' })
  @ApiResponse({ status: 200, description: 'Observación actualizada correctamente' })
  @ApiResponse({ status: 403, description: 'Solo coordinadores pueden actualizar observaciones' })
  update(
    @Param('id') id: string,
    @Body() updateObservacionDocenteDto: UpdateObservacionDocenteDto,
    @Request() req: any
  ) {
    const coordinadorId = req.user?.idTrabajador;
    return this.observacionDocenteService.update(id, updateObservacionDocenteDto, coordinadorId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar observación docente (solo coordinadores)' })
  @ApiResponse({ status: 200, description: 'Observación eliminada correctamente' })
  @ApiResponse({ status: 403, description: 'Solo coordinadores pueden eliminar observaciones' })
  remove(@Param('id') id: string, @Request() req: any) {
    const coordinadorId = req.user?.idTrabajador;
    return this.observacionDocenteService.remove(id, coordinadorId);
  }
}
