import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete,
  HttpStatus,
  HttpCode
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TipoContratoService } from './tipo-contrato.service';
import { CreateTipoContratoDto } from './dto/create-tipo-contrato.dto';
import { UpdateTipoContratoDto } from './dto/update-tipo-contrato.dto';

@ApiTags('Tipos de Contrato')
@Controller('tipo-contrato')
export class TipoContratoController {
  constructor(private readonly tipoContratoService: TipoContratoService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo tipo de contrato' })
  @ApiResponse({ status: 201, description: 'Tipo de contrato creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  async create(@Body() createTipoContratoDto: CreateTipoContratoDto) {
    return await this.tipoContratoService.create(createTipoContratoDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los tipos de contrato' })
  @ApiResponse({ status: 200, description: 'Lista de tipos de contrato' })
  async findAll() {
    return await this.tipoContratoService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un tipo de contrato específico por ID' })
  @ApiResponse({ status: 200, description: 'Tipo de contrato encontrado' })
  @ApiResponse({ status: 404, description: 'Tipo de contrato no encontrado' })
  async findOne(@Param('id') id: string) {
    return await this.tipoContratoService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un tipo de contrato' })
  @ApiResponse({ status: 200, description: 'Tipo de contrato actualizado exitosamente' })
  @ApiResponse({ status: 404, description: 'Tipo de contrato no encontrado' })
  async update(@Param('id') id: string, @Body() updateTipoContratoDto: UpdateTipoContratoDto) {
    return await this.tipoContratoService.update(id, updateTipoContratoDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un tipo de contrato (desactivar)' })
  @ApiResponse({ status: 200, description: 'Tipo de contrato eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'Tipo de contrato no encontrado' })
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    return await this.tipoContratoService.remove(id);
  }
}
