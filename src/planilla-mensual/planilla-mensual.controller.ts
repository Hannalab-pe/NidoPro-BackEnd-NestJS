import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { PlanillaMensualService } from './planilla-mensual.service';
import { CreatePlanillaMensualDto } from './dto/create-planilla-mensual.dto';
import {
  AprobarPlanillaMensualDto,
  AprobarPlanillasMasivasDto,
  GenerarPlanillaConTrabajadoresDto,
} from './dto/operaciones-planilla.dto';
import { EstadoPlanilla } from 'src/enums/estado-planilla.enum';
import { UpdatePlanillaMensualTrabajadorDto } from './dto/update-planilla-trabajadores-mensual.dto';

@ApiTags('Planilla Mensual')
@Controller('planilla-mensual')
export class PlanillaMensualController {
  constructor(
    private readonly planillaMensualService: PlanillaMensualService,
  ) { }

  @Post()
  @ApiOperation({ summary: 'Crear nueva planilla mensual' })
  @ApiResponse({ status: 201, description: 'Planilla creada correctamente' })
  @ApiResponse({
    status: 400,
    description: 'Error en los datos o planilla duplicada',
  })
  async create(@Body() createPlanillaMensualDto: CreatePlanillaMensualDto) {
    return await this.planillaMensualService.create(createPlanillaMensualDto);
  }

  @Post('generar-con-trabajadores')
  @ApiOperation({
    summary: 'Generar planilla mensual con trabajadores específicos',
  })
  @ApiResponse({
    status: 201,
    description: 'Planilla generada con trabajadores correctamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Error en los datos o trabajadores no válidos',
  })
  async generarConTrabajadores(@Body() data: GenerarPlanillaConTrabajadoresDto) {
    return await this.planillaMensualService.generarPlanillaConTrabajadores(data);
  }

  @Patch('aprobar-masivo')
  @ApiOperation({ summary: 'Aprobar múltiples planillas de forma masiva (optimizado para rendimiento)' })
  @ApiResponse({ status: 200, description: 'Planillas procesadas masivamente con registro detallado' })
  @ApiResponse({ status: 400, description: 'Error en validación de datos' })
  @ApiResponse({ status: 404, description: 'Trabajador aprobador no encontrado' })
  async aprobarMasivo(@Body() data: AprobarPlanillasMasivasDto) {
    return await this.planillaMensualService.aprobarPlanillasMasivas(data.idsPlanillas, {
      aprobadoPor: data.aprobadoPor,
      observaciones: data.observaciones,
    });
  }

  @Patch(':id/aprobar')
  @ApiOperation({ summary: 'Aprobar planilla mensual (automáticamente pasa a PAGADA y registra en caja)' })
  @ApiResponse({ status: 200, description: 'Planilla aprobada y pagada automáticamente con registro en caja' })
  @ApiResponse({
    status: 400,
    description: 'La planilla no puede ser aprobada en su estado actual',
  })
  async aprobar(@Param('id') id: string, @Body() data: AprobarPlanillaMensualDto) {
    return await this.planillaMensualService.aprobarPlanilla(id, data);
  }

  @Patch(':id/aprobar-sin-pago')
  @ApiOperation({ summary: 'Aprobar planilla mensual (solo aprobar, sin pagar automáticamente)' })
  @ApiResponse({ status: 200, description: 'Planilla aprobada correctamente sin registro de pago' })
  @ApiResponse({
    status: 400,
    description: 'La planilla no puede ser aprobada en su estado actual',
  })
  async aprobarSinPago(@Param('id') id: string, @Body() data: AprobarPlanillaMensualDto) {
    return await this.planillaMensualService.aprobarPlanillaSinPago(id, data);
  }

  @Post(':id/recalcular-totales')
  @ApiOperation({ summary: 'Recalcular totales de la planilla' })
  @ApiResponse({
    status: 200,
    description: 'Totales recalculados correctamente',
  })
  async recalcularTotales(@Param('id') id: string) {
    return await this.planillaMensualService.recalcularTotales(id);
  }

  @Get('periodo/:mes/:anio')
  @ApiOperation({ summary: 'Buscar planilla por período (mes/año)' })
  @ApiResponse({ status: 200, description: 'Planilla encontrada' })
  @ApiResponse({
    status: 404,
    description: 'Planilla no encontrada para el período especificado',
  })
  async findByPeriodo(@Param('mes') mes: string, @Param('anio') anio: string) {
    return await this.planillaMensualService.findByPeriodo(
      parseInt(mes),
      parseInt(anio),
    );
  }

  @Get('estado/:estado')
  @ApiOperation({ summary: 'Obtener planillas por estado' })
  @ApiResponse({
    status: 200,
    description: 'Planillas obtenidas correctamente',
  })
  async findByEstado(@Param('estado') estado: EstadoPlanilla) {
    return await this.planillaMensualService.findByEstado(estado);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las planillas mensuales' })
  @ApiResponse({ status: 200, description: 'Lista de planillas obtenida correctamente' })
  async findAll() {
    return await this.planillaMensualService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener planilla por ID' })
  @ApiResponse({ status: 200, description: 'Planilla obtenida correctamente' })
  @ApiResponse({ status: 404, description: 'Planilla no encontrada' })
  async findOne(@Param('id') id: string) {
    return await this.planillaMensualService.findOne(id);
  }

  @Patch(':id/agregar-trabajadores')
  @ApiOperation({
    summary: 'Agregar trabajadores a una planilla existente',
    description: 'Agrega trabajadores que no estén ya en la planilla. Filtra automáticamente los duplicados.'
  })
  @ApiResponse({
    status: 200,
    description: 'Trabajadores agregados correctamente a la planilla',
  })
  @ApiResponse({
    status: 400,
    description: 'Error en validación o todos los trabajadores ya están en la planilla',
  })
  @ApiResponse({
    status: 404,
    description: 'Planilla no encontrada',
  })
  async agregarTrabajadores(
    @Param('idPlanilla') idPlanilla: string,
    @Body() body: UpdatePlanillaMensualTrabajadorDto,
  ) {
    return await this.planillaMensualService.updatePlanillaConTrabajadores(idPlanilla, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar planilla mensual' })
  @ApiResponse({ status: 200, description: 'Planilla eliminada correctamente' })
  @ApiResponse({
    status: 400,
    description: 'Solo se pueden eliminar planillas GENERADAS',
  })
  async remove(@Param('id') id: string) {
    return await this.planillaMensualService.remove(id);
  }

  // ==================== ENDPOINTS DE CONSULTA Y REPORTES ====================

  @Get(':id/trabajadores-pendientes')
  @ApiOperation({ summary: 'Obtener trabajadores pendientes de pago en una planilla' })
  @ApiResponse({ status: 200, description: 'Lista de trabajadores pendientes obtenida correctamente' })
  @ApiResponse({ status: 404, description: 'Planilla no encontrada' })
  async obtenerTrabajadoresPendientesPago(@Param('id') id: string) {
    return await this.planillaMensualService.obtenerTrabajadoresPendientesPago(id);
  }

}
