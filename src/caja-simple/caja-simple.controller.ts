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
import { CajaSimpleService } from './caja-simple.service';
import { CreateCajaSimpleDto } from './dto/create-caja-simple.dto';
import { UpdateCajaSimpleDto, AnularCajaSimpleDto } from './dto/update-caja-simple.dto';
import {
    CrearIngresoPorPensionDto,
    CrearIngresoPorMatriculaDto,
    CrearEgresoPorPlanillaDto
} from './dto/crear-movimientos.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('caja-simple')
@UseGuards(JwtAuthGuard)
export class CajaSimpleController {
    constructor(private readonly cajaSimpleService: CajaSimpleService) { }

    @Post()
    create(@Body() createCajaSimpleDto: CreateCajaSimpleDto) {
        return this.cajaSimpleService.create(createCajaSimpleDto);
    }

    @Get()
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
    getSaldoActual() {
        return this.cajaSimpleService.getSaldoActual();
    }

    @Get('reportes/por-categoria')
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
    getIngresosPorPensiones(
        @Query('mes') mes?: string,
        @Query('anio') anio?: string,
    ) {
        const mesNum = mes ? parseInt(mes) : undefined;
        const anioNum = anio ? parseInt(anio) : undefined;
        return this.cajaSimpleService.getIngresosPorPensiones(mesNum, anioNum);
    }

    @Get('reportes/gastos-categoria')
    getGastosPorCategoria(
        @Query('fechaInicio') fechaInicio?: string,
        @Query('fechaFin') fechaFin?: string,
    ) {
        const fechaInicioDate = fechaInicio ? new Date(fechaInicio) : undefined;
        const fechaFinDate = fechaFin ? new Date(fechaFin) : undefined;
        return this.cajaSimpleService.getGastosPorCategoria(fechaInicioDate, fechaFinDate);
    }

    @Get('reportes/pagos-trabajadores')
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
    getEstadoFinancieroEstudiante(
        @Param('estudianteId', ParseUUIDPipe) estudianteId: string
    ) {
        return this.cajaSimpleService.getEstadoFinancieroEstudiante(estudianteId);
    }

    @Get('reportes/dashboard')
    getDashboardFinanciero() {
        return this.cajaSimpleService.getDashboardFinanciero();
    }

    // =================== ENDPOINTS ESPECIALIZADOS PARA CREAR MOVIMIENTOS ===================

    @Post('pension')
    crearIngresoPorPension(@Body() data: CrearIngresoPorPensionDto) {
        return this.cajaSimpleService.crearIngresoPorPension(data);
    }

    @Post('matricula')
    crearIngresoPorMatricula(@Body() data: CrearIngresoPorMatriculaDto) {
        return this.cajaSimpleService.crearIngresoPorMatricula(data);
    }

    @Post('planilla')
    crearEgresoPorPlanilla(@Body() data: CrearEgresoPorPlanillaDto) {
        return this.cajaSimpleService.crearEgresoPorPlanilla(data);
    }

    @Get(':id')
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.cajaSimpleService.findOne(id);
    }

    @Patch(':id')
    update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateCajaSimpleDto: UpdateCajaSimpleDto,
    ) {
        return this.cajaSimpleService.update(id, updateCajaSimpleDto);
    }

    @Patch(':id/anular')
    @HttpCode(HttpStatus.OK)
    anular(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() anularDto: AnularCajaSimpleDto,
    ) {
        return this.cajaSimpleService.anular(id, anularDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(@Param('id', ParseUUIDPipe) id: string) {
        return this.cajaSimpleService.remove(id);
    }
}
