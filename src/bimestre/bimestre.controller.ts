import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { BimestreService } from './bimestre.service';
import { CreateBimestreDto } from './dto/create-bimestre.dto';
import { UpdateBimestreDto } from './dto/update-bimestre.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Bimestre')
@Controller('bimestre')
export class BimestreController {
  constructor(private readonly bimestreService: BimestreService) { }

  @Post()
  @ApiOperation({ summary: 'Crear un bimestre manualmente' })
  @ApiResponse({ status: 201, description: 'Bimestre creado correctamente' })
  create(@Body() createBimestreDto: CreateBimestreDto) {
    return this.bimestreService.create(createBimestreDto);
  }

  @Post('generar-automaticos/:idPeriodoEscolar')
  @ApiOperation({ summary: 'Generar automáticamente todos los bimestres de un período' })
  @ApiResponse({ status: 201, description: 'Bimestres generados automáticamente' })
  generarAutomaticos(@Param('idPeriodoEscolar') idPeriodoEscolar: string) {
    return this.bimestreService.generarBimestresAutomaticos(idPeriodoEscolar);
  }

 

  @Get('fechas-sugeridas/:idPeriodoEscolar/:numeroBimestre')
  @ApiOperation({ summary: 'Obtener fechas sugeridas para un bimestre' })
  @ApiResponse({ status: 200, description: 'Fechas sugeridas obtenidas correctamente' })
  obtenerFechasSugeridas(
    @Param('idPeriodoEscolar') idPeriodoEscolar: string,
    @Param('numeroBimestre') numeroBimestre: string
  ) {
    return this.bimestreService.obtenerFechasSugeridas(idPeriodoEscolar, +numeroBimestre);
  }

  @Get('periodo/:idPeriodoEscolar')
  @ApiOperation({ summary: 'Obtener bimestres por período escolar' })
  @ApiResponse({ status: 200, description: 'Bimestres encontrados correctamente' })
  findByPeriodo(@Param('idPeriodoEscolar') idPeriodoEscolar: string) {
    return this.bimestreService.findByPeriodo(idPeriodoEscolar);
  }

  @Get('actual')
  @ApiOperation({ summary: 'Obtener el bimestre actualmente activo' })
  @ApiResponse({ status: 200, description: 'Bimestre actual encontrado' })
  findBimestreActual() {
    return this.bimestreService.findBimestreActual();
  }

  @Post('activar/:id')
  @ApiOperation({ summary: 'Activar un bimestre específico' })
  @ApiResponse({ status: 200, description: 'Bimestre activado correctamente' })
  activar(@Param('id') id: string) {
    return this.bimestreService.activar(id);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los bimestres' })
  @ApiResponse({ status: 200, description: 'Bimestres encontrados correctamente' })
  findAll() {
    return this.bimestreService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un bimestre por ID' })
  @ApiResponse({ status: 200, description: 'Bimestre encontrado' })
  findOne(@Param('id') id: string) {
    return this.bimestreService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un bimestre' })
  @ApiResponse({ status: 200, description: 'Bimestre actualizado correctamente' })
  update(@Param('id') id: string, @Body() updateBimestreDto: UpdateBimestreDto) {
    return this.bimestreService.update(id, updateBimestreDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un bimestre' })
  @ApiResponse({ status: 200, description: 'Bimestre eliminado correctamente' })
  remove(@Param('id') id: string) {
    return this.bimestreService.remove(id);
  }
}
