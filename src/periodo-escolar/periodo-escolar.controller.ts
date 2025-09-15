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
  async create(@Body() createPeriodoEscolarDto: CreatePeriodoEscolarDto) {
    return await this.periodoEscolarService.create(createPeriodoEscolarDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los períodos escolares' })
  async findAll() {
    return await this.periodoEscolarService.findAll();
  }

  @Get('actual')
  @ApiOperation({ summary: 'Obtener el período escolar actual (activo)' })
  async findActual() {
    return await this.periodoEscolarService.findPeriodoActual();
  }

  @Get('anio/:anio')
  @ApiOperation({ summary: 'Buscar período escolar por año' })
  async findByAnio(@Param('anio') anio: number) {
    return await this.periodoEscolarService.findByAnio(anio);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un período escolar por ID' })
  async findOne(@Param('id') id: string) {
    return await this.periodoEscolarService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un período escolar' })
  async update(@Param('id') id: string, @Body() updatePeriodoEscolarDto: UpdatePeriodoEscolarDto) {
    return await this.periodoEscolarService.update(id, updatePeriodoEscolarDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un período escolar' })
  async remove(@Param('id') id: string) {
    return await this.periodoEscolarService.remove(id);
  }
}
