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
import { TipoSeguroService } from './tipo-seguro.service';
import { CreateTipoSeguroDto } from './dto/create-tipo-seguro.dto';
import { UpdateTipoSeguroDto } from './dto/update-tipo-seguro.dto';

@ApiTags('Tipos de Seguro')
@Controller('tipo-seguro')
export class TipoSeguroController {
  constructor(private readonly tipoSeguroService: TipoSeguroService) { }

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo tipo de seguro' })
  @ApiResponse({
    status: 201,
    description: 'Tipo de seguro creado correctamente',
  })
  @ApiResponse({
    status: 409,
    description: 'Ya existe un tipo de seguro con ese nombre',
  })
  async create(@Body() createTipoSeguroDto: CreateTipoSeguroDto) {
    return await this.tipoSeguroService.create(createTipoSeguroDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los tipos de seguro' })
  @ApiResponse({
    status: 200,
    description: 'Lista de tipos de seguro obtenida correctamente',
  })
  async findAll() {
    return await this.tipoSeguroService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un tipo de seguro por ID' })
  @ApiParam({
    name: 'id',
    description: 'ID del tipo de seguro',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Tipo de seguro encontrado',
  })
  @ApiResponse({
    status: 404,
    description: 'Tipo de seguro no encontrado',
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return await this.tipoSeguroService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un tipo de seguro' })
  @ApiParam({
    name: 'id',
    description: 'ID del tipo de seguro',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Tipo de seguro actualizado correctamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Tipo de seguro no encontrado',
  })
  @ApiResponse({
    status: 409,
    description: 'Ya existe un tipo de seguro con ese nombre',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTipoSeguroDto: UpdateTipoSeguroDto,
  ) {
    return await this.tipoSeguroService.update(id, updateTipoSeguroDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un tipo de seguro' })
  @ApiParam({
    name: 'id',
    description: 'ID del tipo de seguro',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Tipo de seguro eliminado correctamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Tipo de seguro no encontrado',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return await this.tipoSeguroService.remove(id);
  }
}
