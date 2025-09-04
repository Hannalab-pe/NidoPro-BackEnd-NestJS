import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AuditoriaFinancieraService } from './auditoria-financiera.service';
import { CreateAuditoriaFinancieraDto } from './dto/create-auditoria-financiera.dto';
import { UpdateAuditoriaFinancieraDto } from './dto/update-auditoria-financiera.dto';

@Controller('auditoria-financiera')
export class AuditoriaFinancieraController {
  constructor(private readonly auditoriaFinancieraService: AuditoriaFinancieraService) {}

  @Post()
  create(@Body() createAuditoriaFinancieraDto: CreateAuditoriaFinancieraDto) {
    return this.auditoriaFinancieraService.create(createAuditoriaFinancieraDto);
  }

  @Get()
  findAll() {
    return this.auditoriaFinancieraService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.auditoriaFinancieraService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAuditoriaFinancieraDto: UpdateAuditoriaFinancieraDto) {
    return this.auditoriaFinancieraService.update(+id, updateAuditoriaFinancieraDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.auditoriaFinancieraService.remove(+id);
  }
}
