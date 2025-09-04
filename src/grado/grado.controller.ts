import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { GradoService } from './grado.service';
import { CreateGradoDto } from './dto/create-grado.dto';
import { UpdateGradoDto } from './dto/update-grado.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Grados')
@Controller('grado')
export class GradoController {
  constructor(private readonly gradoService: GradoService) { }

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo grado académico' })
  async create(@Body() createGradoDto: CreateGradoDto) {
    const data = await this.gradoService.create(createGradoDto);
    return {
      success: true,
      message: "Grado Registrado Correctamente",
      info: {
        data,
      }
    };
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los grados académicos' })
  async findAll() {
    const data = await this.gradoService.findAll();
    return {
      success: true,
      message: "Grados Listados Correctamente",
      info: {
        data,
      }
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un grado específico por ID' })
  async findOne(@Param('id') id: string) {
    const data = await this.gradoService.findOne(id);
    return {
      success: true,
      message: "Grado Encontrado Correctamente",
      info: {
        data,
      }
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un grado académico' })
  update(@Param('id') id: string, @Body() updateGradoDto: UpdateGradoDto) {
    const data = this.gradoService.update(id, updateGradoDto);
    return {
      success: true,
      message: `Grado Actualizado Correctamente con el ID ${id}`,
      info: {
        data,
      }
    };
  }
}
