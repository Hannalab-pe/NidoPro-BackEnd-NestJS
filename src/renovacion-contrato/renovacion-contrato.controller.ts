import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
  ValidationPipe
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { RenovacionContratoService } from './renovacion-contrato.service';
import { CreateRenovacionContratoDto } from './dto/create-renovacion-contrato.dto';
import { UpdateRenovacionContratoDto } from './dto/update-renovacion-contrato.dto';

@ApiTags('renovacion-contrato')
@Controller('renovacion-contrato')
export class RenovacionContratoController {
  constructor(private readonly renovacionContratoService: RenovacionContratoService) { }

  @Post()
  @ApiOperation({
    summary: 'Crear registro manual de renovación',
    description: 'Solo para crear registros manuales. Para renovar contratos usar el endpoint en contrato-trabajador.'
  })
  @ApiResponse({ status: 201, description: 'Registro de renovación creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  async create(@Body(ValidationPipe) createRenovacionContratoDto: CreateRenovacionContratoDto) {
    return await this.renovacionContratoService.create(createRenovacionContratoDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Consultar historial de renovaciones',
    description: 'Obtiene todas las renovaciones registradas para consulta y reportes.'
  })
  @ApiResponse({ status: 200, description: 'Lista de renovaciones obtenida exitosamente' })
  async findAll(
    @Query('fechaDesde') fechaDesde?: string,
    @Query('fechaHasta') fechaHasta?: string,
    @Query('idTrabajador') idTrabajador?: string,
    @Query('aprobadoPor') aprobadoPor?: string
  ) {
    return await this.renovacionContratoService.findAll();
  }

  @Get('estadisticas')
  @ApiOperation({
    summary: 'Estadísticas de renovaciones',
    description: 'Obtiene métricas y estadísticas sobre las renovaciones de contratos.'
  })
  @ApiResponse({ status: 200, description: 'Estadísticas obtenidas exitosamente' })
  async getEstadisticas() {
    return await this.renovacionContratoService.getEstadisticasRenovaciones();
  }

  @Get('contrato/:idContrato')
  @ApiOperation({
    summary: 'Historial de renovaciones de un contrato',
    description: 'Obtiene todas las renovaciones que ha tenido un contrato específico.'
  })
  @ApiResponse({ status: 200, description: 'Renovaciones del contrato obtenidas exitosamente' })
  async findByContrato(@Param('idContrato', ParseUUIDPipe) idContrato: string) {
    return await this.renovacionContratoService.findByContrato(idContrato);
  }

  @Get('trabajador/:idTrabajador')
  @ApiOperation({
    summary: 'Historial de renovaciones de un trabajador',
    description: 'Obtiene todas las renovaciones de contratos de un trabajador específico.'
  })
  @ApiResponse({ status: 200, description: 'Renovaciones del trabajador obtenidas exitosamente' })
  async findByTrabajador(@Param('idTrabajador', ParseUUIDPipe) idTrabajador: string) {
    return await this.renovacionContratoService.findByTrabajador(idTrabajador);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una renovación por ID' })
  @ApiResponse({ status: 200, description: 'Renovación obtenida exitosamente' })
  @ApiResponse({ status: 404, description: 'Renovación no encontrada' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return await this.renovacionContratoService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una renovación de contrato' })
  @ApiResponse({ status: 200, description: 'Renovación actualizada exitosamente' })
  @ApiResponse({ status: 404, description: 'Renovación no encontrada' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) updateRenovacionContratoDto: UpdateRenovacionContratoDto
  ) {
    return await this.renovacionContratoService.update(id, updateRenovacionContratoDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una renovación de contrato' })
  @ApiResponse({ status: 200, description: 'Renovación eliminada exitosamente' })
  @ApiResponse({ status: 404, description: 'Renovación no encontrada' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return await this.renovacionContratoService.remove(id);
  }
}
