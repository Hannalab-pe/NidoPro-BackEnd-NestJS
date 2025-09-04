import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  ValidationPipe
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery,  } from '@nestjs/swagger';
import { ContratoTrabajadorService } from './contrato-trabajador.service';
import { CreateContratoTrabajadorDto, FiltrosContratoDto } from './dto/create-contrato-trabajador.dto';
import { UpdateContratoTrabajadorDto } from './dto/update-contrato-trabajador.dto';

@ApiTags('contrato-trabajador')
@Controller('contrato-trabajador')
export class ContratoTrabajadorController {
  constructor(private readonly contratoTrabajadorService: ContratoTrabajadorService) { }

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo contrato de trabajador' })
  @ApiResponse({ status: 201, description: 'Contrato creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 409, description: 'Conflicto - El trabajador ya tiene un contrato activo o el número de contrato ya existe' })
  async create(@Body(ValidationPipe) createContratoTrabajadorDto: CreateContratoTrabajadorDto) {
    return await this.contratoTrabajadorService.create(createContratoTrabajadorDto, createContratoTrabajadorDto.creadoPor);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los contratos con filtros opcionales' })
  @ApiResponse({ status: 200, description: 'Lista de contratos obtenida exitosamente' })
  async findAll(@Query(ValidationPipe) filtros?: FiltrosContratoDto) {
    return await this.contratoTrabajadorService.findAll(filtros);
  }

  @Get('estadisticas')
  @ApiOperation({ summary: 'Obtener estadísticas completas de contratos' })
  @ApiResponse({ status: 200, description: 'Estadísticas obtenidas exitosamente' })
  async getEstadisticas() {
    return await this.contratoTrabajadorService.getEstadisticasContratos();
  }

  @Get('proximos-vencer')
  @ApiOperation({ summary: 'Obtener contratos próximos a vencer' })
  @ApiQuery({ name: 'dias', required: false, description: 'Días hasta el vencimiento (default: 30)' })
  @ApiResponse({ status: 200, description: 'Contratos próximos a vencer obtenidos exitosamente' })
  async getProximosAVencer(@Query('dias') dias?: number) {
    return await this.contratoTrabajadorService.getContratosProximosAVencer(dias || 30);
  }

  @Get('trabajador/:idTrabajador')
  @ApiOperation({ summary: 'Obtener todos los contratos de un trabajador específico' })
  @ApiResponse({ status: 200, description: 'Contratos del trabajador obtenidos exitosamente' })
  @ApiResponse({ status: 404, description: 'Trabajador no encontrado' })
  async findByTrabajador(@Param('idTrabajador', ParseUUIDPipe) idTrabajador: string) {
    return await this.contratoTrabajadorService.findByTrabajador(idTrabajador);
  }

  @Get('trabajador/:idTrabajador/activo')
  @ApiOperation({ summary: 'Obtener el contrato activo de un trabajador' })
  @ApiResponse({ status: 200, description: 'Contrato activo obtenido exitosamente' })
  @ApiResponse({ status: 404, description: 'No se encontró contrato activo para el trabajador' })
  async findContratoActivo(@Param('idTrabajador', ParseUUIDPipe) idTrabajador: string) {
    const contrato = await this.contratoTrabajadorService.findContratoActivo(idTrabajador);
    return contrato || { message: 'No hay contrato activo para este trabajador' };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un contrato por ID' })
  @ApiResponse({ status: 200, description: 'Contrato obtenido exitosamente' })
  @ApiResponse({ status: 404, description: 'Contrato no encontrado' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return await this.contratoTrabajadorService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un contrato' })
  @ApiResponse({ status: 200, description: 'Contrato actualizado exitosamente' })
  @ApiResponse({ status: 404, description: 'Contrato no encontrado' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) updateContratoTrabajadorDto: UpdateContratoTrabajadorDto
  ) {
    return await this.contratoTrabajadorService.update(id, updateContratoTrabajadorDto);
  }

  @Patch(':id/finalizar')
  @ApiOperation({ summary: 'Finalizar un contrato' })
  @ApiResponse({ status: 200, description: 'Contrato finalizado exitosamente' })
  @ApiResponse({ status: 404, description: 'Contrato no encontrado' })
  @ApiResponse({ status: 400, description: 'El contrato ya está finalizado' })
  async finalizarContrato(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { motivoFinalizacion: string; fechaFinalizacion?: string }
  ) {
    return await this.contratoTrabajadorService.finalizarContrato(
      id,
      body.motivoFinalizacion,
      body.fechaFinalizacion
    );
  }

  @Patch(':id/renovar')
  @ApiOperation({
    summary: 'RENOVAR CONTRATO - Acción principal que actualiza contrato + historial + renovación',
    description: 'Este es el endpoint principal para renovar contratos. Actualiza el contrato existente, guarda el historial de cambios y registra la renovación.'
  })
  @ApiResponse({ status: 200, description: 'Contrato renovado exitosamente con historial y registro de renovación creados automáticamente' })
  @ApiResponse({ status: 404, description: 'Contrato no encontrado' })
  @ApiResponse({ status: 400, description: 'Solo se pueden renovar contratos activos' })
  async renovarContrato(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) body: {
      nuevaFechaFin: string;
      observaciones?: string;
      realizadoPor?: string;
      ipUsuario?: string;
    }
  ) {
    return await this.contratoTrabajadorService.renovarContrato(
      id,
      body.nuevaFechaFin,
      body.observaciones,
      body.realizadoPor,
      body.ipUsuario
    );
  }

  @Post('renovacion-masiva')
  @ApiOperation({
    summary: 'RENOVACIÓN MASIVA - Renovar múltiples contratos a la vez',
    description: 'Permite renovar varios contratos en una sola operación. Cada renovación genera su historial y registro correspondiente.'
  })
  @ApiResponse({ status: 200, description: 'Renovación masiva completada con reporte de éxitos y fallos' })
  @ApiResponse({ status: 400, description: 'Error en la renovación masiva' })
  async renovarContratosMasivo(
    @Body(ValidationPipe) body: {
      contratos: Array<{
        idContrato: string;
        nuevaFechaFin: string;
        observaciones?: string;
      }>;
      realizadoPor: string;
      ipUsuario?: string;
    }
  ) {
    return await this.contratoTrabajadorService.renovarContratosMasivo(
      body.contratos,
      body.realizadoPor,
      body.ipUsuario
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un contrato' })
  @ApiResponse({ status: 204, description: 'Contrato eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'Contrato no encontrado' })
  @ApiResponse({ status: 400, description: 'No se puede eliminar un contrato activo' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.contratoTrabajadorService.remove(id);
  }
}
