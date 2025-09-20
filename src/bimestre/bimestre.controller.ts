import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { BimestreService } from './bimestre.service';
import { CreateBimestreDto } from './dto/create-bimestre.dto';
import { UpdateBimestreDto } from './dto/update-bimestre.dto';
import { UpdateFechasBimestresDto } from './dto/update-fechas-bimestres.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Bimestre')
@Controller('bimestre')
export class BimestreController {
  constructor(private readonly bimestreService: BimestreService) { }

  @Post()
  @ApiOperation({ summary: 'Crear un bimestre manualmente' })
  @ApiResponse({ status: 201, description: 'Bimestre creado correctamente' })
  async create(@Body() createBimestreDto: CreateBimestreDto) {
    return await this.bimestreService.create(createBimestreDto);
  }

  @Post('generar-automaticos/:idPeriodoEscolar')
  @ApiOperation({ summary: 'Generar automáticamente todos los bimestres de un período' })
  @ApiResponse({ status: 201, description: 'Bimestres generados automáticamente' })
  async generarAutomaticos(@Param('idPeriodoEscolar') idPeriodoEscolar: string) {
    return await this.bimestreService.generarBimestresAutomaticos(idPeriodoEscolar);
  }



  @Get('fechas-sugeridas/:idPeriodoEscolar/:numeroBimestre')
  @ApiOperation({ summary: 'Obtener fechas sugeridas para un bimestre' })
  @ApiResponse({ status: 200, description: 'Fechas sugeridas obtenidas correctamente' })
  async obtenerFechasSugeridas(
    @Param('idPeriodoEscolar') idPeriodoEscolar: string,
    @Param('numeroBimestre') numeroBimestre: string
  ) {
    return await this.bimestreService.obtenerFechasSugeridas(idPeriodoEscolar, +numeroBimestre);
  }

  @Get('periodo/:idPeriodoEscolar')
  @ApiOperation({ summary: 'Obtener bimestres por período escolar' })
  @ApiResponse({ status: 200, description: 'Bimestres encontrados correctamente' })
  async findByPeriodo(@Param('idPeriodoEscolar') idPeriodoEscolar: string) {
    return await this.bimestreService.findByPeriodo(idPeriodoEscolar);
  }

  @Get('actual')
  @ApiOperation({ summary: 'Obtener el bimestre actualmente activo' })
  @ApiResponse({ status: 200, description: 'Bimestre actual encontrado' })
  async findBimestreActual() {
    return await this.bimestreService.findBimestreActual();
  }

  @Post('activar/:id')
  @ApiOperation({ summary: 'Activar un bimestre específico' })
  @ApiResponse({ status: 200, description: 'Bimestre activado correctamente' })
  async activar(@Param('id') id: string) {
    return await this.bimestreService.activar(id);
  }

  @Patch('actualizar-fechas-masivo')
  @ApiOperation({ summary: 'Actualizar fechas de múltiples bimestres de forma masiva' })
  @ApiResponse({ status: 200, description: 'Fechas de bimestres actualizadas correctamente' })
  @ApiResponse({ status: 400, description: 'Error en validación de fechas o datos' })
  async actualizarFechasMasivo(@Body() updateFechasDto: UpdateFechasBimestresDto) {
    return await this.bimestreService.updateFechasMasivo(updateFechasDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los bimestres' })
  @ApiResponse({ status: 200, description: 'Bimestres encontrados correctamente' })
  async findAll() {
    return await this.bimestreService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un bimestre por ID' })
  @ApiResponse({ status: 200, description: 'Bimestre encontrado' })
  async findOne(@Param('id') id: string) {
    return await this.bimestreService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un bimestre' })
  @ApiResponse({ status: 200, description: 'Bimestre actualizado correctamente' })
  async update(@Param('id') id: string, @Body() updateBimestreDto: UpdateBimestreDto) {
    return await this.bimestreService.update(id, updateBimestreDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un bimestre' })
  @ApiResponse({ status: 200, description: 'Bimestre eliminado correctamente' })
  async remove(@Param('id') id: string) {
    return await this.bimestreService.remove(id);
  }
}
