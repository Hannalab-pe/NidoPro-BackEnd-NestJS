import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PeriodoEscolarService } from './periodo-escolar.service';
import { CreatePeriodoEscolarDto } from './dto/create-periodo-escolar.dto';
import { UpdatePeriodoEscolarDto } from './dto/update-periodo-escolar.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Periodo Escolar')
@Controller('periodo-escolar')
export class PeriodoEscolarController {
  constructor(private readonly periodoEscolarService: PeriodoEscolarService) { }

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo período escolar' })
  create(@Body() createPeriodoEscolarDto: CreatePeriodoEscolarDto) {
    return this.periodoEscolarService.create(createPeriodoEscolarDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los períodos escolares' })
  findAll() {
    return this.periodoEscolarService.findAll();
  }

  @Get('actual')
  @ApiOperation({ summary: 'Obtener el período escolar actual (activo)' })
  findActual() {
    return this.periodoEscolarService.findPeriodoActual();
  }

  @Get('anio/:anio')
  @ApiOperation({ summary: 'Buscar período escolar por año' })
  findByAnio(@Param('anio') anio: number) {
    return this.periodoEscolarService.findByAnio(anio);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un período escolar por ID' })
  findOne(@Param('id') id: string) {
    return this.periodoEscolarService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un período escolar' })
  update(@Param('id') id: string, @Body() updatePeriodoEscolarDto: UpdatePeriodoEscolarDto) {
    return this.periodoEscolarService.update(id, updatePeriodoEscolarDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un período escolar' })
  remove(@Param('id') id: string) {
    return this.periodoEscolarService.remove(id);
  }
}
