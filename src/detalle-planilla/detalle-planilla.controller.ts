import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { DetallePlanillaService } from './detalle-planilla.service';
import { CreateDetallePlanillaDto } from './dto/create-detalle-planilla.dto';
import { UpdateDetallePlanillaDto } from './dto/update-detalle-planilla.dto';
import { EstadoPago } from 'src/enums/estado-pago.enum';

@ApiTags('Detalle Planilla')
@Controller('detalle-planilla')
export class DetallePlanillaController {
  constructor(
    private readonly detallePlanillaService: DetallePlanillaService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear nuevo detalle de planilla' })
  @ApiResponse({ status: 201, description: 'Detalle creado correctamente' })
  @ApiResponse({
    status: 400,
    description: 'Error en los datos proporcionados',
  })
  @ApiResponse({
    status: 409,
    description: 'Ya existe un detalle para este trabajador en esta planilla',
  })
  async create(@Body() createDetallePlanillaDto: CreateDetallePlanillaDto) {
    return await this.detallePlanillaService.create(createDetallePlanillaDto);
  }

  @Get('planilla/:idPlanilla')
  @ApiOperation({ summary: 'Obtener detalles por planilla mensual' })
  @ApiResponse({
    status: 200,
    description: 'Detalles de la planilla obtenidos correctamente',
  })
  @ApiParam({ name: 'idPlanilla', description: 'ID de la planilla mensual' })
  async findByPlanilla(@Param('idPlanilla') idPlanilla: string) {
    return await this.detallePlanillaService.findByPlanilla(idPlanilla);
  }

  @Get('trabajador/:idTrabajador')
  @ApiOperation({ summary: 'Obtener detalles por trabajador' })
  @ApiResponse({
    status: 200,
    description: 'Detalles del trabajador obtenidos correctamente',
  })
  @ApiParam({ name: 'idTrabajador', description: 'ID del trabajador' })
  async findByTrabajador(@Param('idTrabajador') idTrabajador: string) {
    return await this.detallePlanillaService.findByTrabajador(idTrabajador);
  }

  @Get('estado-pago/:estado')
  @ApiOperation({ summary: 'Obtener detalles por estado de pago' })
  @ApiResponse({
    status: 200,
    description: 'Detalles filtrados por estado obtenidos correctamente',
  })
  @ApiParam({
    name: 'estado',
    description: 'Estado de pago',
    enum: EstadoPago,
  })
  async findByEstadoPago(@Param('estado') estado: EstadoPago) {
    return await this.detallePlanillaService.findByEstadoPago(estado);
  }

  @Post(':id/recalcular-totales')
  @ApiOperation({ summary: 'Recalcular totales del detalle de planilla' })
  @ApiResponse({
    status: 200,
    description: 'Totales recalculados correctamente',
  })
  @ApiResponse({ status: 404, description: 'Detalle no encontrado' })
  async recalcularTotales(@Param('id') id: string) {
    return await this.detallePlanillaService.recalcularTotales(id);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los detalles de planilla' })
  @ApiResponse({
    status: 200,
    description: 'Lista de detalles obtenida correctamente',
  })
  async findAll() {
    return await this.detallePlanillaService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalle por ID' })
  @ApiResponse({ status: 200, description: 'Detalle obtenido correctamente' })
  @ApiResponse({ status: 404, description: 'Detalle no encontrado' })
  async findOne(@Param('id') id: string) {
    return await this.detallePlanillaService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar detalle de planilla' })
  @ApiResponse({
    status: 200,
    description: 'Detalle actualizado correctamente',
  })
  @ApiResponse({ status: 404, description: 'Detalle no encontrado' })
  @ApiResponse({ status: 409, description: 'Conflicto con datos existentes' })
  async update(
    @Param('id') id: string,
    @Body() updateDetallePlanillaDto: UpdateDetallePlanillaDto,
  ) {
    return await this.detallePlanillaService.update(id, updateDetallePlanillaDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar detalle de planilla' })
  @ApiResponse({ status: 200, description: 'Detalle eliminado correctamente' })
  @ApiResponse({ status: 404, description: 'Detalle no encontrado' })
  async remove(@Param('id') id: string) {
    return await this.detallePlanillaService.remove(id);
  }
}
