import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ReporteProgramadorService } from './reporte-programador.service';
import { CreateReporteProgramadorDto } from './dto/create-reporte-programador.dto';
import { UpdateReporteProgramadorDto } from './dto/update-reporte-programador.dto';

@Controller('reporte-programador')
export class ReporteProgramadorController {
  constructor(private readonly reporteProgramadorService: ReporteProgramadorService) {}

  @Post()
  create(@Body() createReporteProgramadorDto: CreateReporteProgramadorDto) {
    return this.reporteProgramadorService.create(createReporteProgramadorDto);
  }

  @Get()
  findAll() {
    return this.reporteProgramadorService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reporteProgramadorService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateReporteProgramadorDto: UpdateReporteProgramadorDto) {
    return this.reporteProgramadorService.update(+id, updateReporteProgramadorDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reporteProgramadorService.remove(+id);
  }
}
