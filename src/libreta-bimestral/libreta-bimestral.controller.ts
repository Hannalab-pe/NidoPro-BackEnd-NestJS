import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { LibretaBimestralService } from './libreta-bimestral.service';
import { CreateLibretaBimestralDto } from './dto/create-libreta-bimestral.dto';
import { UpdateLibretaBimestralDto } from './dto/update-libreta-bimestral.dto';

@Controller('libreta-bimestral')
export class LibretaBimestralController {
  constructor(private readonly libretaBimestralService: LibretaBimestralService) { }

  // Generar libreta bimestral automáticamente
  @Post('generar')
  async generarLibreta(@Body() datos: { idEstudiante: string, idBimestre: string, idAula: string }) {
    try {
      const libreta = await this.libretaBimestralService.generarLibretaBimestral(
        datos.idEstudiante,
        datos.idBimestre,
        datos.idAula
      );
      return {
        success: true,
        message: 'Libreta bimestral generada exitosamente',
        data: libreta
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  }

  // Obtener libreta por estudiante y bimestre
  @Get('estudiante/:idEstudiante/bimestre/:idBimestre')
  async obtenerLibretaPorEstudianteYBimestre(
    @Param('idEstudiante') idEstudiante: string,
    @Param('idBimestre') idBimestre: string
  ) {
    try {
      const libreta = await this.libretaBimestralService.obtenerLibretaPorEstudianteYBimestre(
        idEstudiante,
        idBimestre
      );
      return {
        success: true,
        message: 'Libreta encontrada',
        data: libreta
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  }

  // Recalcular libreta bimestral existente
  @Patch('recalcular/:idEstudiante/:idBimestre')
  async recalcularLibreta(
    @Param('idEstudiante') idEstudiante: string,
    @Param('idBimestre') idBimestre: string
  ) {
    try {
      const libreta = await this.libretaBimestralService.recalcularLibretaBimestral(
        idEstudiante,
        idBimestre
      );
      return {
        success: true,
        message: 'Libreta bimestral recalculada exitosamente',
        data: libreta
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  }

  @Post()
  create(@Body() createLibretaBimestralDto: CreateLibretaBimestralDto) {
    return this.libretaBimestralService.create(createLibretaBimestralDto);
  }

  @Get()
  findAll() {
    return this.libretaBimestralService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.libretaBimestralService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLibretaBimestralDto: UpdateLibretaBimestralDto) {
    return this.libretaBimestralService.update(+id, updateLibretaBimestralDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.libretaBimestralService.remove(+id);
  }
}
