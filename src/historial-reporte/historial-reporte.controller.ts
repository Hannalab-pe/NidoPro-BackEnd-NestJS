import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { HistorialReporteService } from './historial-reporte.service';
import { CreateHistorialReporteDto } from './dto/create-historial-reporte.dto';
import { UpdateHistorialReporteDto } from './dto/update-historial-reporte.dto';

@Controller('historial-reporte')
export class HistorialReporteController {
  constructor(private readonly historialReporteService: HistorialReporteService) {}

  @Post()
  create(@Body() createHistorialReporteDto: CreateHistorialReporteDto) {
    return this.historialReporteService.create(createHistorialReporteDto);
  }

  @Get()
  findAll() {
    return this.historialReporteService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.historialReporteService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateHistorialReporteDto: UpdateHistorialReporteDto) {
    return this.historialReporteService.update(+id, updateHistorialReporteDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.historialReporteService.remove(+id);
  }
}
