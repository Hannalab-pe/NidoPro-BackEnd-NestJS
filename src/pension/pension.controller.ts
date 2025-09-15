import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PensionService } from './pension.service';
import { CreatePensionDto } from './dto/create-pension.dto';
import { UpdatePensionDto } from './dto/update-pension.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Pensiones')
@Controller('pension')
export class PensionController {
  constructor(private readonly pensionService: PensionService) { }

  @Post()
  @ApiOperation({ summary: 'Registrar una nueva pensión mensual para un estudiante' })
  async create(@Body() createPensionDto: CreatePensionDto) {
    const data = await this.pensionService.create(createPensionDto);
    return {
      success: true,
      message: "Pensión Registrada Correctamente",
      info: {
        data,
      }
    };
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las pensiones registradas' })
  async findAll() {
    const data = await this.pensionService.findAll();
    return {
      success: true,
      message: "Pensiones Listadas Correctamente",
      info: {
        data,
      }
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una pensión específica por ID' })
  async findOne(@Param('id') id: string) {
    const data = await this.pensionService.findOne(id);
    return {
      success: true,
      message: "Pensión Encontrada Correctamente",
      info: {
        data,
      }
    };
  }


  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar información de una pensión (estado de pago, monto, etc.)' })
  async update(@Param('id') id: string, @Body() updatePensionDto: UpdatePensionDto) {
    const data = await this.pensionService.update(id, updatePensionDto);
    return {
      success: true,
      message: `Pensión Actualizada Correctamente con el ID ${id}`,
      info: {
        data,
      }
    };
  }

}
