import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PresupuestoMensualService } from './presupuesto-mensual.service';
import { CreatePresupuestoMensualDto } from './dto/create-presupuesto-mensual.dto';
import { UpdatePresupuestoMensualDto } from './dto/update-presupuesto-mensual.dto';

@Controller('presupuesto-mensual')
export class PresupuestoMensualController {
  constructor(private readonly presupuestoMensualService: PresupuestoMensualService) {}

  @Post()
  create(@Body() createPresupuestoMensualDto: CreatePresupuestoMensualDto) {
    return this.presupuestoMensualService.create(createPresupuestoMensualDto);
  }

  @Get()
  findAll() {
    return this.presupuestoMensualService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.presupuestoMensualService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePresupuestoMensualDto: UpdatePresupuestoMensualDto) {
    return this.presupuestoMensualService.update(+id, updatePresupuestoMensualDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.presupuestoMensualService.remove(+id);
  }
}
