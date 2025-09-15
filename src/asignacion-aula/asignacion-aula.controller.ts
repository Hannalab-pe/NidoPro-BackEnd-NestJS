import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AsignacionAulaService } from './asignacion-aula.service';
import { CreateAsignacionAulaDto } from './dto/create-asignacion-aula.dto';
import { UpdateAsignacionAulaDto } from './dto/update-asignacion-aula.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Asignación de Aulas')
@Controller('asignacion-aula')
export class AsignacionAulaController {
  constructor(private readonly asignacionAulaService: AsignacionAulaService) { }

  @Post()
  @ApiOperation({ summary: 'Asignar un aula a un grado específico' })
  async create(@Body() createAsignacionAulaDto: CreateAsignacionAulaDto) {
    return await this.asignacionAulaService.create(createAsignacionAulaDto);
  }
  
  @Get()
  @ApiOperation({ summary: 'Obtener todas las asignaciones de aulas a grados' })
  async findAll() {
    return await this.asignacionAulaService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una asignación de aula específica por ID' })
  async findOne(@Param('id') id: string) {
    return await this.asignacionAulaService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una asignación de aula' })
  async update(@Param('id') id: string, @Body() updateAsignacionAulaDto: UpdateAsignacionAulaDto) {
    return await this.asignacionAulaService.update(id, updateAsignacionAulaDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una asignación de aula (desactivar)' })
  async remove(@Param('id') id: string) {
    return await this.asignacionAulaService.remove(id);
  }
}
