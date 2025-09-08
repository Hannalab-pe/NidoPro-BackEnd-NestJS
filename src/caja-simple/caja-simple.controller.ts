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
    @ApiOperation({ summary: 'Crear un nuevo movimiento de caja', description: 'Registra un nuevo movimiento financiero (ingreso o egreso) en el sistema de caja simple' })
    @ApiResponse({ status: 201, description: 'Movimiento creado exitosamente' })
    @ApiResponse({ status: 400, description: 'Datos inválidos en la solicitud' })
    async create(@Body() createCajaSimpleDto: CreateCajaSimpleDto) {
        return await this.cajaSimpleService.create(createCajaSimpleDto);
    }

    @Get()
    @ApiOperation({ summary: 'Obtener todos los movimientos de caja', description: 'Lista todos los movimientos financieros con filtros opcionales'  })
    @ApiQuery({ name: 'tipo', required: false, description: 'Filtrar por tipo de movimiento (INGRESO/EGRESO)' })
    @ApiQuery({ name: 'categoria', required: false, description: 'Filtrar por categoría' })
    @ApiQuery({ name: 'fechaInicio', required: false, description: 'Fecha de inicio para filtrar (YYYY-MM-DD)' })
    @ApiQuery({ name: 'fechaFin', required: false, description: 'Fecha de fin para filtrar (YYYY-MM-DD)' })
    @ApiQuery({ name: 'estado', required: false, description: 'Filtrar por estado (CONFIRMADO/PENDIENTE/ANULADO)' })
    @ApiResponse({ status: 200, description: 'Lista de movimientos obtenida exitosamente' })
    async findAll( @Query('tipo') tipo?: string, @Query('categoria') categoria?: string, @Query('fechaInicio') fechaInicio?: string, @Query('fechaFin') fechaFin?: string, @Query('estado') estado?: string, ) {
        const fechaInicioDate = fechaInicio ? new Date(fechaInicio) : undefined;
        const fechaFinDate = fechaFin ? new Date(fechaFin) : undefined;

        return await this.cajaSimpleService.findAll(
            tipo,
            categoria,
            fechaInicioDate,
            fechaFinDate,
            estado,
        );
    }

    @Get('saldo')
    @ApiOperation({  summary: 'Obtener saldo actual de caja',  description: 'Obtiene el saldo actual, total de ingresos y egresos confirmados'})
    @ApiResponse({status: 200,description: 'Saldo obtenido exitosamente'})
    async getSaldoActual() {
        return await this.cajaSimpleService.getSaldoActual();
    }

    @Get('reportes/por-categoria')
    @ApiOperation({summary: 'Reporte de movimientos por categoría',description: 'Obtiene un resumen de movimientos agrupados por categoría en un período específico'})
    @ApiQuery({ name: 'fechaInicio', required: false, description: 'Fecha de inicio para el reporte (YYYY-MM-DD)' })
    @ApiQuery({ name: 'fechaFin', required: false, description: 'Fecha de fin para el reporte (YYYY-MM-DD)' })
    @ApiResponse({ status: 200, description: 'Reporte generado exitosamente' })
    async getMovimientosPorCategoria(@Query('fechaInicio') fechaInicio?: string,@Query('fechaFin') fechaFin?: string, ) {
        const fechaInicioDate = fechaInicio ? new Date(fechaInicio) : undefined;
        const fechaFinDate = fechaFin ? new Date(fechaFin) : undefined;

        return await this.cajaSimpleService.getMovimientosPorCategoria(
            fechaInicioDate,
            fechaFinDate,
        );
    }

    // =================== NUEVOS ENDPOINTS DE REPORTES ===================

    @Get('reportes/flujo-caja')
    @ApiOperation({summary: 'Reporte de flujo de caja por período',description: 'Obtiene el flujo de caja diario en un período específico con ingresos, egresos y saldo neto'})
    @ApiQuery({ name: 'fechaInicio', required: true, description: 'Fecha de inicio (YYYY-MM-DD)' })
    @ApiQuery({ name: 'fechaFin', required: true, description: 'Fecha de fin (YYYY-MM-DD)' })
    @ApiResponse({ status: 200, description: 'Flujo de caja obtenido exitosamente' })
    async getFlujoCajaPorPeriodo(@Query('fechaInicio') fechaInicio: string, @Query('fechaFin') fechaFin: string,) {
        return await this.cajaSimpleService.getFlujoCajaPorPeriodo(
            new Date(fechaInicio),
            new Date(fechaFin)
        );
    }

    @Get('reportes/pensiones')
    @ApiOperation({summary: 'Reporte de ingresos por pensiones',description: 'Obtiene estadísticas y detalles de los pagos de pensiones por mes y año'})
    @ApiQuery({ name: 'mes', required: false, description: 'Mes específico (1-12)' })
    @ApiQuery({ name: 'anio', required: false, description: 'Año específico' })
    @ApiResponse({status: 200,description: 'Reporte de pensiones generado exitosamente'})
    async getIngresosPorPensiones(@Query('mes') mes?: string,@Query('anio') anio?: string,) {
        const mesNum = mes ? parseInt(mes) : undefined;
        const anioNum = anio ? parseInt(anio) : undefined;
        return await this.cajaSimpleService.getIngresosPorPensiones(mesNum, anioNum);
    }

    @Get('reportes/gastos-categoria')
    @ApiOperation({summary: 'Reporte de gastos por categoría',description: 'Obtiene un análisis detallado de gastos organizados por categoría y subcategoría'})
    @ApiQuery({ name: 'fechaInicio', required: false, description: 'Fecha de inicio para filtrar (YYYY-MM-DD)' })
    @ApiQuery({ name: 'fechaFin', required: false, description: 'Fecha de fin para filtrar (YYYY-MM-DD)' })
    @ApiResponse({status: 200,description: 'Reporte de gastos generado exitosamente'})
    async getGastosPorCategoria( @Query('fechaInicio') fechaInicio?: string, @Query('fechaFin') fechaFin?: string,) {
        const fechaInicioDate = fechaInicio ? new Date(fechaInicio) : undefined;
        const fechaFinDate = fechaFin ? new Date(fechaFin) : undefined;
        return await this.cajaSimpleService.getGastosPorCategoria(fechaInicioDate, fechaFinDate);
    }

    @Get('reportes/pagos-trabajadores')
    @ApiOperation({summary: 'Reporte de pagos a trabajadores',description: 'Obtiene el historial de pagos realizados a trabajadores (planillas)'})
    @ApiQuery({ name: 'trabajadorId', required: false, description: 'ID específico de trabajador' })
    @ApiQuery({ name: 'mes', required: false, description: 'Mes específico (1-12)' })
    @ApiQuery({ name: 'anio', required: false, description: 'Año específico' })
    @ApiResponse({ status: 200, description: 'Reporte de pagos a trabajadores generado exitosamente' })
    async getPagosPorTrabajador( @Query('trabajadorId') trabajadorId?: string, @Query('mes') mes?: string, @Query('anio') anio?: string,
    ) {
        const mesNum = mes ? parseInt(mes) : undefined;
        const anioNum = anio ? parseInt(anio) : undefined;
        return await this.cajaSimpleService.getPagosPorTrabajador(trabajadorId, mesNum, anioNum);
    }

    @Get('reportes/estudiante/:estudianteId')
    @ApiOperation({ summary: 'Estado financiero de un estudiante', description: 'Obtiene el historial completo de pagos y estado financiero de un estudiante específico' })
    @ApiParam({ name: 'estudianteId', description: 'ID del estudiante' })
    @ApiResponse({ status: 200, description: 'Estado financiero del estudiante obtenido exitosamente' })
    async getEstadoFinancieroEstudiante(@Param('estudianteId', ParseUUIDPipe) estudianteId: string) {
        return await this.cajaSimpleService.getEstadoFinancieroEstudiante(estudianteId);
    }

    @Get('reportes/dashboard')
    @ApiOperation({ summary: 'Dashboard financiero general', description: 'Obtiene un resumen ejecutivo con KPIs financieros: saldo actual, movimientos del día y del mes'})
    @ApiResponse({ status: 200, description: 'Dashboard financiero obtenido exitosamente' })
    async getDashboardFinanciero() {
        return await this.cajaSimpleService.getDashboardFinanciero();
    }

    // =================== ENDPOINTS ESPECIALIZADOS PARA CREAR MOVIMIENTOS ===================


    @Post('matricula')
    @ApiOperation({summary: 'Registrar pago de matrícula',description: 'Crea un ingreso específico por pago de matrícula estudiantil'    })
    @ApiResponse({ status: 201, description: 'Pago de matrícula registrado exitosamente'})
    @ApiResponse({ status: 400, description: 'Datos inválidos en la solicitud' })
    async crearIngresoPorMatricula(@Body() data: CrearIngresoPorMatriculaDto) {
        return await this.cajaSimpleService.crearIngresoPorMatricula(data);
    }

    @Get(':id')
    @ApiOperation({summary: 'Obtener un movimiento específico',description: 'Obtiene los detalles completos de un movimiento de caja por su ID' })
    @ApiParam({ name: 'id', description: 'ID del movimiento de caja' })
    @ApiResponse({ status: 200, description: 'Movimiento encontrado exitosamente' })
    @ApiResponse({ status: 404, description: 'Movimiento no encontrado' })
    async findOne(@Param('id', ParseUUIDPipe) id: string) {
        return await this.cajaSimpleService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Actualizar un movimiento de caja', description: 'Actualiza los datos de un movimiento de caja existente (no permite modificar movimientos anulados)'})
    @ApiParam({ name: 'id', description: 'ID del movimiento a actualizar' })
    @ApiResponse({ status: 200, description: 'Movimiento actualizado exitosamente'  })
    @ApiResponse({ status: 400, description: 'No se puede modificar un movimiento anulado' })
    @ApiResponse({ status: 404, description: 'Movimiento no encontrado' })
    async update( @Param('id', ParseUUIDPipe) id: string, @Body() updateCajaSimpleDto: UpdateCajaSimpleDto) {
        return await this.cajaSimpleService.update(id, updateCajaSimpleDto);
    }

    @Patch(':id/anular')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({summary: 'Anular un movimiento de caja',description: 'Anula un movimiento de caja especificando el motivo. Una vez anulado no se puede revertir.' })
    @ApiParam({ name: 'id', description: 'ID del movimiento a anular' })
    @ApiResponse({status: 200,description: 'Movimiento anulado exitosamente'})
    @ApiResponse({status: 400,description: 'El movimiento ya está anulado'})
    @ApiResponse({  status: 404,  description: 'Movimiento no encontrado'})
    async anular(@Param('id', ParseUUIDPipe) id: string,@Body() anularDto: AnularCajaSimpleDto, ) {
        return await this.cajaSimpleService.anular(id, anularDto);
    }

    // =================== NUEVOS ENDPOINTS PARA INTEGRACIÓN CON PENSIONES ===================

    @Get('reportes/pensiones-detallado/:mes/:anio')
    @ApiOperation({ summary: 'Reporte detallado de pensiones vs caja simple', description: 'Reporte completo que muestra la relación entre pensiones pagadas y sus ingresos registrados en caja simple'})
    @ApiParam({ name: 'mes', description: 'Mes a analizar (1-12)' })
    @ApiParam({ name: 'anio', description: 'Año a analizar' })
    @ApiResponse({status: 200,description: 'Reporte detallado generado exitosamente'})
    async getReportePensionesDetallado( @Param('mes') mes: number, @Param('anio') anio: number) {
        return await this.cajaSimpleService.getIngresosPorPensiones(mes, anio);
    }

    @Get('conciliacion/verificar/:mes/:anio')
    @ApiOperation({ summary: 'Verificar conciliación pension-caja simple', description: 'Verifica la consistencia entre pensiones pagadas y sus ingresos en caja simple' })
    @ApiParam({ name: 'mes', description: 'Mes a verificar (1-12)' })
    @ApiParam({ name: 'anio', description: 'Año a verificar' })
    @ApiResponse({status: 200,description: 'Verificación de conciliación completada'})
    async verificarConciliacionPensiones(@Param('mes') mes: number, @Param('anio') anio: number) {
        // Este endpoint llama al método en el servicio de pensiones pero lo exponemos también aquí para conveniencia
        return {
            mensaje: 'Para verificación completa de conciliación, usar el endpoint GET /pension-estudiante/reporte-conciliacion/:mes/:anio',
            linkDirecto: `/pension-estudiante/reporte-conciliacion/${mes}/${anio}`,
            resumenBasico: await this.cajaSimpleService.getIngresosPorPensiones(mes, anio)
        };
    }

    @Get('pension/:pensionId')
    @ApiOperation({ summary: 'Buscar ingreso por ID de pensión', description: 'Encuentra el ingreso en caja simple asociado a una pensión específica' })
    @ApiParam({ name: 'pensionId', description: 'ID de la pensión estudiante' })
    @ApiResponse({ status: 200, description: 'Ingreso encontrado (o mensaje si no existe)' })
    async findIngresoByPensionId(@Param('pensionId', ParseUUIDPipe) pensionId: string) {
        const movimientos = await this.cajaSimpleService.findAll();
        const ingresoRelacionado = movimientos.find(mov =>
            mov.idPensionRelacionada === pensionId &&
            mov.categoria === 'PENSION_MENSUAL' &&
            mov.tipo === 'INGRESO'
        );

        if (!ingresoRelacionado) {
            return {
                success: false,
                mensaje: `No se encontró ingreso en caja simple para la pensión ${pensionId}`,
                pensionId,
                sugerencia: 'Verificar si la pensión está marcada como PAGADO y procesar el ingreso manualmente'
            };
        }

        return {
            success: true,
            mensaje: 'Ingreso encontrado exitosamente',
            pensionId,
            ingreso: ingresoRelacionado
        };
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Eliminar un movimiento de caja', description: 'Elimina permanentemente un movimiento de caja del sistema. ⚠️ Usar con precaución.'
    })
    @ApiParam({ name: 'id', description: 'ID del movimiento a eliminar' })
    @ApiResponse({ status: 204, description: 'Movimiento eliminado exitosamente' })
    @ApiResponse({ status: 404, description: 'Movimiento no encontrado' })
    async remove(@Param('id', ParseUUIDPipe) id: string) {
        return await this.cajaSimpleService.remove(id);
    }
}
