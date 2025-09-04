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
