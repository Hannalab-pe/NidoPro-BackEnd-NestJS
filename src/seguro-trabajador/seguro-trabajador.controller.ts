import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { SeguroTrabajadorService } from './seguro-trabajador.service';
import { CreateSeguroTrabajadorDto } from './dto/create-seguro-trabajador.dto';
import { UpdateSeguroTrabajadorDto } from './dto/update-seguro-trabajador.dto';

@ApiTags('Seguro Trabajador')
@Controller('seguro-trabajador')
export class SeguroTrabajadorController {
  constructor(
    private readonly seguroTrabajadorService: SeguroTrabajadorService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo seguro de trabajador' })
  @ApiResponse({
    status: 201,
    description: 'Seguro de trabajador creado correctamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Trabajador o tipo de seguro no encontrado',
  })
  @ApiResponse({ status: 400, description: 'Fechas inválidas' })
  create(@Body() createSeguroTrabajadorDto: CreateSeguroTrabajadorDto) {
    return this.seguroTrabajadorService.create(createSeguroTrabajadorDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los seguros de trabajadores' })
  @ApiResponse({
    status: 200,
    description: 'Lista de seguros obtenida correctamente',
  })
  findAll() {
    return this.seguroTrabajadorService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un seguro de trabajador por ID' })
  @ApiParam({
    name: 'id',
    description: 'ID del seguro de trabajador',
    format: 'uuid',
  })
  @ApiResponse({ status: 200, description: 'Seguro de trabajador encontrado' })
  @ApiResponse({
    status: 404,
    description: 'Seguro de trabajador no encontrado',
  })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.seguroTrabajadorService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un seguro de trabajador' })
  @ApiParam({
    name: 'id',
    description: 'ID del seguro de trabajador',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Seguro de trabajador actualizado correctamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Seguro de trabajador no encontrado',
  })
  @ApiResponse({ status: 400, description: 'Datos de actualización inválidos' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSeguroTrabajadorDto: UpdateSeguroTrabajadorDto,
  ) {
    return this.seguroTrabajadorService.update(id, updateSeguroTrabajadorDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar un seguro de trabajador' })
  @ApiParam({
    name: 'id',
    description: 'ID del seguro de trabajador',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Seguro de trabajador eliminado correctamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Seguro de trabajador no encontrado',
  })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.seguroTrabajadorService.remove(id);
  }
}
