import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ContactoEmergenciaService } from './contacto-emergencia.service';
import { CreateContactoEmergenciaDto } from './dto/create-contacto-emergencia.dto';
import { UpdateContactoEmergenciaDto } from './dto/update-contacto-emergencia.dto';

@ApiTags('Contactos de Emergencia')
@Controller('contacto-emergencia')
export class ContactoEmergenciaController {
  constructor(private readonly contactoEmergenciaService: ContactoEmergenciaService) { }

  @Post()
  @ApiOperation({ summary: 'Registrar un nuevo contacto de emergencia' })
  async create(@Body() createContactoEmergenciaDto: CreateContactoEmergenciaDto) {
    return await this.contactoEmergenciaService.create(createContactoEmergenciaDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los contactos de emergencia' })
  async findAll() {
    return await this.contactoEmergenciaService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un contacto de emergencia específico por ID' })
  async findOne(@Param('id') id: string) {
    return await this.contactoEmergenciaService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar información de un contacto de emergencia' })
  async update(@Param('id') id: string, @Body() updateContactoEmergenciaDto: UpdateContactoEmergenciaDto) {
    return await this.contactoEmergenciaService.update(id, updateContactoEmergenciaDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un contacto de emergencia' })
  async remove(@Param('id') id: string) {
    return await this.contactoEmergenciaService.remove(id);
  }
}
