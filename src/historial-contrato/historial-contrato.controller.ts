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
import { HistorialContratoService } from './historial-contrato.service';
import { CreateHistorialContratoDto, AccionHistorialEnum } from './dto/create-historial-contrato.dto';
import { UpdateHistorialContratoDto } from './dto/update-historial-contrato.dto';

@ApiTags('historial-contrato')
@Controller('historial-contrato')
export class HistorialContratoController {
  constructor(private readonly historialContratoService: HistorialContratoService) { }

  @Post()
  @ApiOperation({ summary: 'Crear un registro en el historial de contrato' })
  @ApiResponse({ status: 201, description: 'Registro de historial creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  async create(@Body(ValidationPipe) createHistorialContratoDto: CreateHistorialContratoDto) {
    return await this.historialContratoService.create(createHistorialContratoDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todo el historial de contratos con filtros opcionales' })
  @ApiResponse({ status: 200, description: 'Historial obtenido exitosamente' })
  @ApiQuery({ name: 'fechaDesde', required: false, description: 'Fecha desde (YYYY-MM-DD)' })
  @ApiQuery({ name: 'fechaHasta', required: false, description: 'Fecha hasta (YYYY-MM-DD)' })
  @ApiQuery({ name: 'accion', required: false, enum: AccionHistorialEnum, description: 'Tipo de acción' })
  @ApiQuery({ name: 'idContrato', required: false, description: 'ID del contrato' })
  @ApiQuery({ name: 'idTrabajador', required: false, description: 'ID del trabajador' })
  @ApiQuery({ name: 'realizadoPor', required: false, description: 'ID de quien realizó la acción' })
  @ApiQuery({ name: 'page', required: false, description: 'Página (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Límite por página (default: 50)' })
  async findAll(
    @Query('fechaDesde') fechaDesde?: string,
    @Query('fechaHasta') fechaHasta?: string,
    @Query('accion') accion?: AccionHistorialEnum,
    @Query('idContrato') idContrato?: string,
    @Query('idTrabajador') idTrabajador?: string,
    @Query('realizadoPor') realizadoPor?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50
  ) {
    return await this.historialContratoService.findAll({
      fechaDesde,
      fechaHasta,
      accion,
      idContrato,
      idTrabajador,
      realizadoPor,
      page: Number(page),
      limit: Number(limit)
    });
  }

  @Get('estadisticas')
  @ApiOperation({ summary: 'Obtener estadísticas del historial de contratos' })
  @ApiResponse({ status: 200, description: 'Estadísticas obtenidas exitosamente' })
  async getEstadisticas() {
    return await this.historialContratoService.getEstadisticasHistorial();
  }

  @Get('contrato/:idContrato')
  @ApiOperation({ summary: 'Obtener historial de un contrato específico' })
  @ApiResponse({ status: 200, description: 'Historial del contrato obtenido exitosamente' })
  async findByContrato(@Param('idContrato', ParseUUIDPipe) idContrato: string) {
    return await this.historialContratoService.findByContrato(idContrato);
  }

  @Get('trabajador/:idTrabajador')
  @ApiOperation({ summary: 'Obtener historial de contratos de un trabajador' })
  @ApiResponse({ status: 200, description: 'Historial del trabajador obtenido exitosamente' })
  async findByTrabajador(@Param('idTrabajador', ParseUUIDPipe) idTrabajador: string) {
    return await this.historialContratoService.findByTrabajador(idTrabajador);
  }

  @Get('acciones/:accion')
  @ApiOperation({ summary: 'Obtener historial por tipo de acción específica' })
  @ApiResponse({ status: 200, description: 'Historial por acción obtenido exitosamente' })
  async findByAccion(@Param('accion') accion: AccionHistorialEnum) {
    return await this.historialContratoService.findByAccion(accion);
  }

  @Get('renovaciones')
  @ApiOperation({ summary: 'Obtener solo el historial de renovaciones' })
  @ApiResponse({ status: 200, description: 'Historial de renovaciones obtenido exitosamente' })
  async findRenovaciones() {
    return await this.historialContratoService.findByAccion(AccionHistorialEnum.RENOVACION);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un registro de historial por ID' })
  @ApiResponse({ status: 200, description: 'Registro de historial obtenido exitosamente' })
  @ApiResponse({ status: 404, description: 'Registro no encontrado' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return await this.historialContratoService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un registro de historial' })
  @ApiResponse({ status: 200, description: 'Registro actualizado exitosamente' })
  @ApiResponse({ status: 404, description: 'Registro no encontrado' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) updateHistorialContratoDto: UpdateHistorialContratoDto
  ) {
    return await this.historialContratoService.update(id, updateHistorialContratoDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un registro de historial' })
  @ApiResponse({ status: 200, description: 'Registro eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'Registro no encontrado' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return await this.historialContratoService.remove(id);
  }
}
