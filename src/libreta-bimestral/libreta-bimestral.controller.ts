import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { LibretaBimestralService } from './libreta-bimestral.service';
import { CreateLibretaBimestralDto } from './dto/create-libreta-bimestral.dto';
import { UpdateLibretaBimestralDto } from './dto/update-libreta-bimestral.dto';
import { GenerarLibretaBimestralDto } from './dto/generar-libreta-bimestral.dto';
import { ApiTags, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

@ApiTags('Libreta Bimestral')
@Controller('libreta-bimestral')
export class LibretaBimestralController {
  constructor(private readonly libretaBimestralService: LibretaBimestralService) { }

  // Generar libreta bimestral automáticamente
  @Post('generar')
  @ApiOperation({
    summary: 'Generar libreta bimestral automáticamente para un estudiante',
    description: 'Genera una libreta bimestral basada en las notas registradas del estudiante en el bimestre especificado. Calcula automáticamente promedios y asigna calificaciones literales (A, B, C, AD) según el sistema de kinder.'
  })
  @ApiResponse({
    status: 201,
    description: 'Libreta bimestral generada exitosamente'
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o libreta ya existe'
  })
  async generarLibreta(@Body() datos: GenerarLibretaBimestralDto) {
    const data = await this.libretaBimestralService.generarLibretaBimestral(
      datos.idEstudiante,
      datos.idBimestre,
      datos.idAula
    );
    return {
      success: true,
      message: 'Libreta Bimestral Generada Correctamente',
      info: {
        data,
      }
    };
  }

  // Obtener libreta por estudiante y bimestre
  @Get('estudiante/:idEstudiante/bimestre/:idBimestre')
  @ApiOperation({
    summary: 'Obtener libreta bimestral específica por estudiante y bimestre',
    description: 'Obtiene la libreta bimestral de un estudiante específico para un bimestre determinado'
  })
  @ApiParam({ name: 'idEstudiante', description: 'ID del estudiante' })
  @ApiParam({ name: 'idBimestre', description: 'ID del bimestre' })
  @ApiResponse({
    status: 200,
    description: 'Libreta bimestral encontrada exitosamente'
  })
  @ApiResponse({
    status: 404,
    description: 'Libreta bimestral no encontrada'
  })
  async obtenerLibretaPorEstudianteYBimestre(
    @Param('idEstudiante') idEstudiante: string,
    @Param('idBimestre') idBimestre: string
  ) {
    const data = await this.libretaBimestralService.obtenerLibretaPorEstudianteYBimestre(
      idEstudiante,
      idBimestre
    );
    return {
      success: true,
      message: 'Libreta Bimestral Encontrada Correctamente',
      info: {
        data,
      }
    };
  }

  // Recalcular libreta bimestral existente
  @Patch('recalcular/:idEstudiante/:idBimestre')
  @ApiOperation({
    summary: 'Recalcular libreta bimestral existente con notas actualizadas',
    description: 'Recalcula una libreta bimestral existente basándose en las notas actuales del estudiante. Útil cuando se han agregado o modificado notas después de generar la libreta.'
  })
  @ApiParam({ name: 'idEstudiante', description: 'ID del estudiante' })
  @ApiParam({ name: 'idBimestre', description: 'ID del bimestre' })
  @ApiResponse({
    status: 200,
    description: 'Libreta bimestral recalculada exitosamente'
  })
  @ApiResponse({
    status: 404,
    description: 'Libreta bimestral no encontrada'
  })
  async recalcularLibreta(
    @Param('idEstudiante') idEstudiante: string,
    @Param('idBimestre') idBimestre: string
  ) {
    const data = await this.libretaBimestralService.recalcularLibretaBimestral(
      idEstudiante,
      idBimestre
    );
    return {
      success: true,
      message: 'Libreta Bimestral Recalculada Correctamente',
      info: {
        data,
      }
    };
  }

  // Obtener todas las libretas de un bimestre específico
  @Get('bimestre/:idBimestre')
  @ApiOperation({ summary: 'Obtener todas las libretas bimestrales de un bimestre específico' })
  async obtenerLibretasPorBimestre(@Param('idBimestre') idBimestre: string) {
    const libretas = await this.libretaBimestralService.findAll();
    const data = libretas.filter(libreta => libreta.idBimestre === idBimestre);

    return {
      success: true,
      message: 'Libretas del Bimestre Obtenidas Correctamente',
      info: {
        data,
      }
    };
  }

  // Obtener todas las libretas de un estudiante
  @Get('estudiante/:idEstudiante/todas')
  @ApiOperation({ summary: 'Obtener todas las libretas bimestrales de un estudiante específico' })
  async obtenerLibretasPorEstudiante(@Param('idEstudiante') idEstudiante: string) {
    const libretas = await this.libretaBimestralService.findAll();
    const data = libretas.filter(libreta => libreta.idEstudiante === idEstudiante);

    return {
      success: true,
      message: 'Libretas del Estudiante Obtenidas Correctamente',
      info: {
        data,
      }
    };
  }

  @Post()
  @ApiOperation({ summary: 'Crear una nueva libreta bimestral' })
  async create(@Body() createLibretaBimestralDto: CreateLibretaBimestralDto) {
    const data = await this.libretaBimestralService.create(createLibretaBimestralDto);
    return {
      success: true,
      message: 'Libreta Bimestral Creada Correctamente',
      info: {
        data,
      }
    };
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las libretas bimestrales' })
  async findAll() {
    const data = await this.libretaBimestralService.findAll();
    return {
      success: true,
      message: 'Libretas Bimestrales Listadas Correctamente',
      info: {
        data,
      }
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una libreta bimestral específica por ID' })
  async findOne(@Param('id') id: string) {
    const data = await this.libretaBimestralService.findOne(id);
    return {
      success: true,
      message: 'Libreta Bimestral Encontrada Correctamente',
      info: {
        data,
      }
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una libreta bimestral existente' })
  async update(@Param('id') id: string, @Body() updateLibretaBimestralDto: UpdateLibretaBimestralDto) {
    const data = await this.libretaBimestralService.update(id, updateLibretaBimestralDto);
    return {
      success: true,
      message: `Libreta Bimestral Actualizada Correctamente con el ID ${id}`,
      info: {
        data,
      }
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una libreta bimestral' })
  async remove(@Param('id') id: string) {
    const data = await this.libretaBimestralService.remove(id);
    return {
      success: true,
      message: `Libreta Bimestral Eliminada Correctamente con el ID ${id}`,
      info: {
        data,
      }
    };
  }
}
