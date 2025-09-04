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
    UseGuards,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam, ApiBody } from '@nestjs/swagger';
import { CajaSimpleService } from './caja-simple.service';
import { CreateCajaSimpleDto } from './dto/create-caja-simple.dto';
import { UpdateCajaSimpleDto, AnularCajaSimpleDto } from './dto/update-caja-simple.dto';
import {
    CrearIngresoPorPensionDto,
    CrearIngresoPorMatriculaDto,
    CrearEgresoPorPlanillaDto
} from './dto/crear-movimientos.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Caja Simple - Gestión Financiera')
@Controller('caja-simple')
@UseGuards(JwtAuthGuard)
export class CajaSimpleController {
    constructor(private readonly cajaSimpleService: CajaSimpleService) { }

    @Post()
    @ApiOperation({
        summary: 'Crear un nuevo movimiento de caja',
        description: 'Registra un nuevo movimiento financiero (ingreso o egreso) en el sistema de caja simple'
    })
    @ApiResponse({
        status: 201,
        description: 'Movimiento creado exitosamente'
    })
    @ApiResponse({
        status: 400,
        description: 'Datos inválidos en la solicitud'
    })
    create(@Body() createCajaSimpleDto: CreateCajaSimpleDto) {
        return this.cajaSimpleService.create(createCajaSimpleDto);
    }

    @Get()
    @ApiOperation({
        summary: 'Obtener todos los movimientos de caja',
        description: 'Lista todos los movimientos financieros con filtros opcionales'
    })
    @ApiQuery({ name: 'tipo', required: false, description: 'Filtrar por tipo de movimiento (INGRESO/EGRESO)' })
    @ApiQuery({ name: 'categoria', required: false, description: 'Filtrar por categoría' })
    @ApiQuery({ name: 'fechaInicio', required: false, description: 'Fecha de inicio para filtrar (YYYY-MM-DD)' })
    @ApiQuery({ name: 'fechaFin', required: false, description: 'Fecha de fin para filtrar (YYYY-MM-DD)' })
    @ApiQuery({ name: 'estado', required: false, description: 'Filtrar por estado (CONFIRMADO/PENDIENTE/ANULADO)' })
    @ApiResponse({
        status: 200,
        description: 'Lista de movimientos obtenida exitosamente'
    })
    findAll(
        @Query('tipo') tipo?: string,
        @Query('categoria') categoria?: string,
        @Query('fechaInicio') fechaInicio?: string,
        @Query('fechaFin') fechaFin?: string,
        @Query('estado') estado?: string,
    ) {
        const fechaInicioDate = fechaInicio ? new Date(fechaInicio) : undefined;
        const fechaFinDate = fechaFin ? new Date(fechaFin) : undefined;

        return this.cajaSimpleService.findAll(
            tipo,
            categoria,
            fechaInicioDate,
            fechaFinDate,
            estado,
        );
    }

    @Get('saldo')
    @ApiOperation({
        summary: 'Obtener saldo actual de caja',
        description: 'Obtiene el saldo actual, total de ingresos y egresos confirmados'
    })
    @ApiResponse({
        status: 200,
        description: 'Saldo obtenido exitosamente',
        schema: {
            example: {
                saldo: 15750.50,
                ingresos: 25000.00,
                egresos: 9249.50
            }
        }
    })
    getSaldoActual() {
        return this.cajaSimpleService.getSaldoActual();
    }

    @Get('reportes/por-categoria')
    @ApiOperation({
        summary: 'Reporte de movimientos por categoría',
        description: 'Obtiene un resumen de movimientos agrupados por categoría en un período específico'
    })
    @ApiQuery({ name: 'fechaInicio', required: false, description: 'Fecha de inicio para el reporte (YYYY-MM-DD)' })
    @ApiQuery({ name: 'fechaFin', required: false, description: 'Fecha de fin para el reporte (YYYY-MM-DD)' })
    @ApiResponse({
        status: 200,
        description: 'Reporte generado exitosamente'
    })
    getMovimientosPorCategoria(
        @Query('fechaInicio') fechaInicio?: string,
        @Query('fechaFin') fechaFin?: string,
    ) {
        const fechaInicioDate = fechaInicio ? new Date(fechaInicio) : undefined;
        const fechaFinDate = fechaFin ? new Date(fechaFin) : undefined;

        return this.cajaSimpleService.getMovimientosPorCategoria(
            fechaInicioDate,
            fechaFinDate,
        );
    }

    // =================== NUEVOS ENDPOINTS DE REPORTES ===================

    @Get('reportes/flujo-caja')
    @ApiOperation({
        summary: 'Reporte de flujo de caja por período',
        description: 'Obtiene el flujo de caja diario en un período específico con ingresos, egresos y saldo neto'
    })
    @ApiQuery({ name: 'fechaInicio', required: true, description: 'Fecha de inicio (YYYY-MM-DD)' })
    @ApiQuery({ name: 'fechaFin', required: true, description: 'Fecha de fin (YYYY-MM-DD)' })
    @ApiResponse({
        status: 200,
        description: 'Flujo de caja obtenido exitosamente'
    })
    getFlujoCajaPorPeriodo(
        @Query('fechaInicio') fechaInicio: string,
        @Query('fechaFin') fechaFin: string,
    ) {
        return this.cajaSimpleService.getFlujoCajaPorPeriodo(
            new Date(fechaInicio),
            new Date(fechaFin)
        );
    }

    @Get('reportes/pensiones')
    @ApiOperation({
        summary: 'Reporte de ingresos por pensiones',
        description: 'Obtiene estadísticas y detalles de los pagos de pensiones por mes y año'
    })
    @ApiQuery({ name: 'mes', required: false, description: 'Mes específico (1-12)' })
    @ApiQuery({ name: 'anio', required: false, description: 'Año específico' })
    @ApiResponse({
        status: 200,
        description: 'Reporte de pensiones generado exitosamente'
    })
    getIngresosPorPensiones(
        @Query('mes') mes?: string,
        @Query('anio') anio?: string,
    ) {
        const mesNum = mes ? parseInt(mes) : undefined;
        const anioNum = anio ? parseInt(anio) : undefined;
        return this.cajaSimpleService.getIngresosPorPensiones(mesNum, anioNum);
    }

    @Get('reportes/gastos-categoria')
    @ApiOperation({
        summary: 'Reporte de gastos por categoría',
        description: 'Obtiene un análisis detallado de gastos organizados por categoría y subcategoría'
    })
    @ApiQuery({ name: 'fechaInicio', required: false, description: 'Fecha de inicio para filtrar (YYYY-MM-DD)' })
    @ApiQuery({ name: 'fechaFin', required: false, description: 'Fecha de fin para filtrar (YYYY-MM-DD)' })
    @ApiResponse({
        status: 200,
        description: 'Reporte de gastos generado exitosamente'
    })
    getGastosPorCategoria(
        @Query('fechaInicio') fechaInicio?: string,
        @Query('fechaFin') fechaFin?: string,
    ) {
        const fechaInicioDate = fechaInicio ? new Date(fechaInicio) : undefined;
        const fechaFinDate = fechaFin ? new Date(fechaFin) : undefined;
        return this.cajaSimpleService.getGastosPorCategoria(fechaInicioDate, fechaFinDate);
    }

    @Get('reportes/pagos-trabajadores')
    @ApiOperation({
        summary: 'Reporte de pagos a trabajadores',
        description: 'Obtiene el historial de pagos realizados a trabajadores (planillas)'
    })
    @ApiQuery({ name: 'trabajadorId', required: false, description: 'ID específico de trabajador' })
    @ApiQuery({ name: 'mes', required: false, description: 'Mes específico (1-12)' })
    @ApiQuery({ name: 'anio', required: false, description: 'Año específico' })
    @ApiResponse({
        status: 200,
        description: 'Reporte de pagos a trabajadores generado exitosamente'
    })
    getPagosPorTrabajador(
        @Query('trabajadorId') trabajadorId?: string,
        @Query('mes') mes?: string,
        @Query('anio') anio?: string,
    ) {
        const mesNum = mes ? parseInt(mes) : undefined;
        const anioNum = anio ? parseInt(anio) : undefined;
        return this.cajaSimpleService.getPagosPorTrabajador(trabajadorId, mesNum, anioNum);
    }

    @Get('reportes/estudiante/:estudianteId')
    @ApiOperation({
        summary: 'Estado financiero de un estudiante',
        description: 'Obtiene el historial completo de pagos y estado financiero de un estudiante específico'
    })
    @ApiParam({ name: 'estudianteId', description: 'ID del estudiante' })
    @ApiResponse({
        status: 200,
        description: 'Estado financiero del estudiante obtenido exitosamente'
    })
    getEstadoFinancieroEstudiante(
        @Param('estudianteId', ParseUUIDPipe) estudianteId: string
    ) {
        return this.cajaSimpleService.getEstadoFinancieroEstudiante(estudianteId);
    }

    @Get('reportes/dashboard')
    @ApiOperation({
        summary: 'Dashboard financiero general',
        description: 'Obtiene un resumen ejecutivo con KPIs financieros: saldo actual, movimientos del día y del mes'
    })
    @ApiResponse({
        status: 200,
        description: 'Dashboard financiero obtenido exitosamente',
        schema: {
            example: {
                saldoActual: { saldo: 15750.50, ingresos: 25000.00, egresos: 9249.50 },
                movimientosHoy: { ingresos_cantidad: "5", ingresos_monto: "1750.00", egresos_cantidad: "2", egresos_monto: "800.00" },
                movimientosMes: { ingresos_mes: "18500.00", egresos_mes: "7200.00" },
                fecha: "2025-09-04T..."
            }
        }
    })
    getDashboardFinanciero() {
        return this.cajaSimpleService.getDashboardFinanciero();
    }

    // =================== ENDPOINTS ESPECIALIZADOS PARA CREAR MOVIMIENTOS ===================

    @Post('pension')
    @ApiOperation({
        summary: 'Registrar pago de pensión',
        description: 'Crea un ingreso específico por pago de pensión mensual con trazabilidad completa'
    })
    @ApiResponse({
        status: 201,
        description: 'Pago de pensión registrado exitosamente'
    })
    @ApiResponse({
        status: 400,
        description: 'Datos inválidos en la solicitud'
    })
    crearIngresoPorPension(@Body() data: CrearIngresoPorPensionDto) {
        return this.cajaSimpleService.crearIngresoPorPension(data);
    }

    @Post('matricula')
    @ApiOperation({
        summary: 'Registrar pago de matrícula',
        description: 'Crea un ingreso específico por pago de matrícula estudiantil'
    })
    @ApiResponse({
        status: 201,
        description: 'Pago de matrícula registrado exitosamente'
    })
    @ApiResponse({
        status: 400,
        description: 'Datos inválidos en la solicitud'
    })
    crearIngresoPorMatricula(@Body() data: CrearIngresoPorMatriculaDto) {
        return this.cajaSimpleService.crearIngresoPorMatricula(data);
    }

    @Post('planilla')
    @ApiOperation({
        summary: 'Registrar pago de planilla',
        description: 'Crea un egreso específico por pago de planilla/sueldo a trabajador'
    })
    @ApiResponse({
        status: 201,
        description: 'Pago de planilla registrado exitosamente'
    })
    @ApiResponse({
        status: 400,
        description: 'Datos inválidos en la solicitud'
    })
    crearEgresoPorPlanilla(@Body() data: CrearEgresoPorPlanillaDto) {
        return this.cajaSimpleService.crearEgresoPorPlanilla(data);
    }

    @Get(':id')
    @ApiOperation({
        summary: 'Obtener un movimiento específico',
        description: 'Obtiene los detalles completos de un movimiento de caja por su ID'
    })
    @ApiParam({ name: 'id', description: 'ID del movimiento de caja' })
    @ApiResponse({
        status: 200,
        description: 'Movimiento encontrado exitosamente'
    })
    @ApiResponse({
        status: 404,
        description: 'Movimiento no encontrado'
    })
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.cajaSimpleService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({
        summary: 'Actualizar un movimiento de caja',
        description: 'Actualiza los datos de un movimiento de caja existente (no permite modificar movimientos anulados)'
    })
    @ApiParam({ name: 'id', description: 'ID del movimiento a actualizar' })
    @ApiResponse({
        status: 200,
        description: 'Movimiento actualizado exitosamente'
    })
    @ApiResponse({
        status: 400,
        description: 'No se puede modificar un movimiento anulado'
    })
    @ApiResponse({
        status: 404,
        description: 'Movimiento no encontrado'
    })
    update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateCajaSimpleDto: UpdateCajaSimpleDto,
    ) {
        return this.cajaSimpleService.update(id, updateCajaSimpleDto);
    }

    @Patch(':id/anular')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Anular un movimiento de caja',
        description: 'Anula un movimiento de caja especificando el motivo. Una vez anulado no se puede revertir.'
    })
    @ApiParam({ name: 'id', description: 'ID del movimiento a anular' })
    @ApiResponse({
        status: 200,
        description: 'Movimiento anulado exitosamente'
    })
    @ApiResponse({
        status: 400,
        description: 'El movimiento ya está anulado'
    })
    @ApiResponse({
        status: 404,
        description: 'Movimiento no encontrado'
    })
    anular(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() anularDto: AnularCajaSimpleDto,
    ) {
        return this.cajaSimpleService.anular(id, anularDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({
        summary: 'Eliminar un movimiento de caja',
        description: 'Elimina permanentemente un movimiento de caja del sistema. ⚠️ Usar con precaución.'
    })
    @ApiParam({ name: 'id', description: 'ID del movimiento a eliminar' })
    @ApiResponse({
        status: 204,
        description: 'Movimiento eliminado exitosamente'
    })
    @ApiResponse({
        status: 404,
        description: 'Movimiento no encontrado'
    })
    remove(@Param('id', ParseUUIDPipe) id: string) {
        return this.cajaSimpleService.remove(id);
    }
}
