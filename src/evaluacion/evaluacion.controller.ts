import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EvaluacionService } from './evaluacion.service';
import { CreateEvaluacionDto } from './dto/create-evaluacion.dto';
import { UpdateEvaluacionDto } from './dto/update-evaluacion.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Evaluaciones')
@Controller('evaluacion')
export class EvaluacionController {
  constructor(private readonly evaluacionService: EvaluacionService) { }

  @Post()
  @ApiOperation({ summary: 'Crear una nueva evaluación' })
  async create(@Body() createEvaluacionDto: CreateEvaluacionDto) {
    const data = await this.evaluacionService.create(createEvaluacionDto);
    return {
      success: true,
      message: "Evaluación Registrada Correctamente",
      info: {
        data,
      }
    };
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las evaluaciones' })
  async findAll() {
    const data = await this.evaluacionService.findAll();
    return {
      success: true,
      message: "Evaluaciones Listadas Correctamente",
      info: {
        data,
      }
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una evaluación específica por ID' })
  async findOne(@Param('id') id: string) {
    const data = await this.evaluacionService.findOne(id);
    return {
      success: true,
      message: "Evaluación Encontrada Correctamente",
      info: {
        data,
      }
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una evaluación existente' })
  update(@Param('id') id: string, @Body() updateEvaluacionDto: UpdateEvaluacionDto) {
    const data = this.evaluacionService.update(id, updateEvaluacionDto);
    return {
      success: true,
      message: `Evaluación Actualizada Correctamente con el ID ${id}`,
      info: {
        data,
      }
    };
  }
}
