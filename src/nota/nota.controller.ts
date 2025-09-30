import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { NotaService } from './nota.service';
import { CreateNotaDto, CreateNotaTareaDto, CreateNotaKinderDto, CreateNotaTareaKinderDto } from './dto/create-nota.dto';
import { UpdateNotaDto, UpdateNotaKinderDto } from './dto/update-nota.dto';
import { QueryNotaDto } from './dto/query-nota.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Notas')
@Controller('nota')
export class NotaController {
  constructor(private readonly notaService: NotaService) { }

  @Post()
  @ApiOperation({ summary: 'Registrar una nueva nota de evaluación' })
  async create(@Body() createNotaDto: CreateNotaDto) {
    const data = await this.notaService.create(createNotaDto);
    return {
      success: true,
      message: "Nota Registrada Correctamente",
      info: {
        data,
      }
    };
  }

  @Post('kinder')
  @ApiOperation({ summary: 'Registrar una nota de evaluación con calificación literal (A, B, C, AD)' })
  async createKinder(@Body() createNotaKinderDto: CreateNotaKinderDto) {
    const data = await this.notaService.createKinder(createNotaKinderDto);
    return {
      success: true,
      message: "Nota de Kinder Registrada Correctamente",
      info: {
        data,
      }
    };
  }


  @Get('libreta/estudiante/:idEstudiante')
  @ApiOperation({ summary: 'Obtener libreta completa de un estudiante' })
  async obtenerLibretaEstudiante(@Param('idEstudiante') idEstudiante: string) {
    const libretaEstudiante = await this.notaService.obtenerLibretaEstudiante(idEstudiante);
    return {
      success: true,
      message: "Libreta del Estudiante Encontrada Correctamente",
      info: {
        data: libretaEstudiante,
      }
    };
  }

  @Get('libreta/aula/:idAula')
  @ApiOperation({ summary: 'Obtener libreta completa de un aula' })
  async obtenerLibretaAula(@Param('idAula') idAula: string) {
    const libretaAula = await this.notaService.obtenerLibretaPorAula(idAula);
    return {
      success: true,
      message: "Libreta del Aula Encontrada Correctamente",
      info: {
        data: libretaAula,
      }
    };
  }

  @Get('libreta-kinder/estudiante/:idEstudiante')
  @ApiOperation({ summary: 'Obtener libreta de kinder con calificaciones literales (A, B, C, AD)' })
  async obtenerLibretaKinder(@Param('idEstudiante') idEstudiante: string) {
    const libretaKinder = await this.notaService.obtenerLibretaKinder(idEstudiante);
    return {
      success: true,
      message: "Libreta de Kinder Encontrada Correctamente",
      info: {
        data: libretaKinder,
      }
    };
  }

  @Get('libreta-kinder/aula/:idAula')
  @ApiOperation({ summary: 'Obtener libreta de kinder para toda el aula con calificaciones literales' })
  async obtenerLibretaAulaKinder(@Param('idAula') idAula: string) {
    const libretaAulaKinder = await this.notaService.obtenerLibretaAulaKinder(idAula);
    return {
      success: true,
      message: "Libreta de Aula Kinder Encontrada Correctamente",
      info: {
        data: libretaAulaKinder,
      }
    };
  }


  @Post('tarea/calificar')
  @ApiOperation({ summary: 'Calificar una tarea entregada por un estudiante' })
  async calificarTarea(@Body() createNotaTareaDto: CreateNotaTareaDto) {
    const data = await this.notaService.calificarTarea(createNotaTareaDto);
    return {
      success: true,
      message: "Tarea Calificada Correctamente",
      info: {
        data,
      }
    };
  }

  @Post('tarea/calificar-kinder')
  @ApiOperation({ summary: 'Calificar una tarea de kinder con calificación literal (A, B, C, AD)' })
  async calificarTareaKinder(@Body() createNotaTareaKinderDto: CreateNotaTareaKinderDto) {
    const data = await this.notaService.calificarTareaKinder(createNotaTareaKinderDto);
    return {
      success: true,
      message: "Tarea de Kinder Calificada Correctamente",
      info: {
        data,
      }
    };
  }

  @Get()
  @ApiOperation({
    summary: 'Obtener todas las notas registradas',
    description: 'Permite obtener las notas en formato numérico (0-20) o literal (AD, A, B, C). Por defecto es numérico.'
  })
  async findAll(@Query() queryDto: QueryNotaDto) {
    const data = await this.notaService.findAll(queryDto.tipo);
    return {
      success: true,
      message: `Notas Listadas Correctamente en formato ${queryDto.tipo || 'NUMERICO'}`,
      info: {
        tipoVisualizacion: queryDto.tipo || 'NUMERICO',
        totalNotas: data.length,
        data,
      }
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una nota específica por ID' })
  async findOne(@Param('id') id: string) {
    const data = await this.notaService.findOne(id);
    return {
      success: true,
      message: "Nota Encontrada Correctamente",
      info: {
        data,
      }
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una nota de evaluación con puntaje numérico' })
  async update(@Param('id') id: string, @Body() updateNotaDto: UpdateNotaDto) {
    const data = await this.notaService.update(id, updateNotaDto);
    return {
      success: true,
      message: `Nota Actualizada Correctamente con el ID ${id}`,
      info: {
        data,
      }
    };
  }

  @Patch('kinder/:id')
  @ApiOperation({ summary: 'Actualizar una nota de evaluación con calificación literal (A, B, C, AD)' })
  async updateKinder(@Param('id') id: string, @Body() updateNotaKinderDto: UpdateNotaKinderDto) {
    const data = await this.notaService.updateKinder(id, updateNotaKinderDto);
    return {
      success: true,
      message: `Nota de Kinder Actualizada Correctamente con el ID ${id}`,
      info: {
        data,
      }
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una nota' })
  async remove(@Param('id') id: string) {
    const data = await this.notaService.remove(id);
    return {
      success: true,
      message: `Nota Eliminada Correctamente con el ID ${id}`,
      info: {
        data,
      }
    };
  }

}
