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
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { PlanillaMensualService } from './planilla-mensual.service';
import { CreatePlanillaMensualDto } from './dto/create-planilla-mensual.dto';
import { UpdatePlanillaMensualDto } from './dto/update-planilla-mensual.dto';
import {
  AprobarPlanillaMensualDto,
  RegistrarPagoPlanillaMensualDto,
  GenerarPlanillaConTrabajadoresDto,
} from './dto/operaciones-planilla.dto';
import { EstadoPlanilla } from 'src/enums/estado-planilla.enum';

@ApiTags('Planilla Mensual')
@Controller('planilla-mensual')
export class PlanillaMensualController {
  constructor(
    private readonly planillaMensualService: PlanillaMensualService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear nueva planilla mensual' })
  @ApiResponse({ status: 201, description: 'Planilla creada correctamente' })
  @ApiResponse({
    status: 400,
    description: 'Error en los datos o planilla duplicada',
  })
  create(@Body() createPlanillaMensualDto: CreatePlanillaMensualDto) {
    return this.planillaMensualService.create(createPlanillaMensualDto);
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
  generarConTrabajadores(@Body() data: GenerarPlanillaConTrabajadoresDto) {
    return this.planillaMensualService.generarPlanillaConTrabajadores(data);
  }

  @Patch(':id/aprobar')
  @ApiOperation({ summary: 'Aprobar planilla mensual' })
  @ApiResponse({ status: 200, description: 'Planilla aprobada correctamente' })
  @ApiResponse({
    status: 400,
    description: 'La planilla no puede ser aprobada en su estado actual',
  })
  aprobar(@Param('id') id: string, @Body() data: AprobarPlanillaMensualDto) {
    return this.planillaMensualService.aprobarPlanilla(id, data);
  }

  @Patch(':id/registrar-pago')
  @ApiOperation({ summary: 'Registrar pago de planilla mensual' })
  @ApiResponse({ status: 200, description: 'Pago registrado correctamente' })
  @ApiResponse({
    status: 400,
    description: 'La planilla debe estar aprobada para registrar pago',
  })
  registrarPago(
    @Param('id') id: string,
    @Body() data: RegistrarPagoPlanillaMensualDto,
  ) {
    return this.planillaMensualService.registrarPago(id, data);
  }

  @Post(':id/recalcular-totales')
  @ApiOperation({ summary: 'Recalcular totales de la planilla' })
  @ApiResponse({
    status: 200,
    description: 'Totales recalculados correctamente',
  })
  recalcularTotales(@Param('id') id: string) {
    return this.planillaMensualService.recalcularTotales(id);
  }

  @Get('periodo/:mes/:anio')
  @ApiOperation({ summary: 'Buscar planilla por período (mes/año)' })
  @ApiResponse({ status: 200, description: 'Planilla encontrada' })
  @ApiResponse({
    status: 404,
    description: 'Planilla no encontrada para el período especificado',
  })
  findByPeriodo(@Param('mes') mes: string, @Param('anio') anio: string) {
    return this.planillaMensualService.findByPeriodo(
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
  findByEstado(@Param('estado') estado: EstadoPlanilla) {
    return this.planillaMensualService.findByEstado(estado);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las planillas mensuales' })
  @ApiResponse({
    status: 200,
    description: 'Lista de planillas obtenida correctamente',
  })
  findAll() {
    return this.planillaMensualService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener planilla por ID' })
  @ApiResponse({ status: 200, description: 'Planilla obtenida correctamente' })
  @ApiResponse({ status: 404, description: 'Planilla no encontrada' })
  findOne(@Param('id') id: string) {
    return this.planillaMensualService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar planilla mensual' })
  @ApiResponse({
    status: 200,
    description: 'Planilla actualizada correctamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Solo se pueden editar planillas GENERADAS o EN_REVISION',
  })
  update(
    @Param('id') id: string,
    @Body() updatePlanillaMensualDto: UpdatePlanillaMensualDto,
  ) {
    return this.planillaMensualService.update(id, updatePlanillaMensualDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar planilla mensual' })
  @ApiResponse({ status: 200, description: 'Planilla eliminada correctamente' })
  @ApiResponse({
    status: 400,
    description: 'Solo se pueden eliminar planillas GENERADAS',
  })
  remove(@Param('id') id: string) {
    return this.planillaMensualService.remove(id);
  }
}
