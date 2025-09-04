import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TareaEntregaService } from './tarea-entrega.service';
import { CreateTareaEntregaDto } from './dto/create-tarea-entrega.dto';
import { UpdateTareaEntregaDto } from './dto/update-tarea-entrega.dto';

@Controller('tarea-entrega')
export class TareaEntregaController {
  constructor(private readonly tareaEntregaService: TareaEntregaService) { }

  @Post()
  async registrarTareaEntrega(@Body() createTareaEntregaDto: CreateTareaEntregaDto) {
    const tareaRegistrada = this.tareaEntregaService.registrarEntrega(createTareaEntregaDto);
    return {
      success: true,
      message: "Tarea registrada exitosamente",
      info: {
        tareaRegistrada
      }
    };
  }

  @Get()
  findAll() {
    return this.tareaEntregaService.findAll();
  }
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTareaEntregaDto: UpdateTareaEntregaDto) {
    return this.tareaEntregaService.update(+id, updateTareaEntregaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tareaEntregaService.remove(+id);
  }
}
