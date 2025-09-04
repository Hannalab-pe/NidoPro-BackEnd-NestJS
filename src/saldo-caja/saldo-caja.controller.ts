import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SaldoCajaService } from './saldo-caja.service';
import { CreateSaldoCajaDto } from './dto/create-saldo-caja.dto';
import { UpdateSaldoCajaDto } from './dto/update-saldo-caja.dto';

@Controller('saldo-caja')
export class SaldoCajaController {
  constructor(private readonly saldoCajaService: SaldoCajaService) {}

  @Post()
  create(@Body() createSaldoCajaDto: CreateSaldoCajaDto) {
    return this.saldoCajaService.create(createSaldoCajaDto);
  }

  @Get()
  findAll() {
    return this.saldoCajaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.saldoCajaService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSaldoCajaDto: UpdateSaldoCajaDto) {
    return this.saldoCajaService.update(+id, updateSaldoCajaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.saldoCajaService.remove(+id);
  }
}
