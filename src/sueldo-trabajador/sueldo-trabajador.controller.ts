import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { SueldoTrabajadorService } from './sueldo-trabajador.service';
import { CreateSueldoTrabajadorDto } from './dto/create-sueldo-trabajador.dto';
import { UpdateSueldoTrabajadorDto } from './dto/update-sueldo-trabajador.dto';

@ApiTags('Sueldo Trabajador')
@Controller('sueldo-trabajador')
export class SueldoTrabajadorController {
  constructor(
    private readonly sueldoTrabajadorService: SueldoTrabajadorService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear nuevo sueldo de trabajador' })
  @ApiResponse({ status: 201, description: 'Sueldo creado correctamente' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 404, description: 'Trabajador no encontrado' })
  async create(@Body() createSueldoTrabajadorDto: CreateSueldoTrabajadorDto) {
    return await this.sueldoTrabajadorService.create(createSueldoTrabajadorDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los sueldos de trabajadores' })
  @ApiResponse({ status: 200, description: 'Sueldos obtenidos correctamente' })
  async findAll() {
    return await this.sueldoTrabajadorService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener sueldo de trabajador por ID' })
  @ApiParam({ name: 'id', description: 'ID del sueldo de trabajador' })
  @ApiResponse({ status: 200, description: 'Sueldo obtenido correctamente' })
  @ApiResponse({ status: 404, description: 'Sueldo no encontrado' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return await this.sueldoTrabajadorService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar sueldo de trabajador' })
  @ApiParam({ name: 'id', description: 'ID del sueldo de trabajador' })
  @ApiResponse({ status: 200, description: 'Sueldo actualizado correctamente' })
  @ApiResponse({ status: 404, description: 'Sueldo no encontrado' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSueldoTrabajadorDto: UpdateSueldoTrabajadorDto,
  ) {
    return await this.sueldoTrabajadorService.update(id, updateSueldoTrabajadorDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar sueldo de trabajador' })
  @ApiParam({ name: 'id', description: 'ID del sueldo de trabajador' })
  @ApiResponse({ status: 200, description: 'Sueldo eliminado correctamente' })
  @ApiResponse({ status: 404, description: 'Sueldo no encontrado' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return await this.sueldoTrabajadorService.remove(id);
  }
}
