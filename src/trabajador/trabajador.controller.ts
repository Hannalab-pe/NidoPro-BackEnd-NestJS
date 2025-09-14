import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { TrabajadorService } from './trabajador.service';
import { CreateTrabajadorDto } from './dto/create-trabajador.dto';
import { CreateTrabajadorTransactionalDto } from './dto/create-trabajador-transactional.dto';
import { UpdateTrabajadorDto } from './dto/update-trabajador.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Trabajadores')
@Controller('trabajador')
export class TrabajadorController {
  constructor(private readonly trabajadorService: TrabajadorService) { }

  @Post()
  @ApiOperation({
    summary: 'Registrar un nuevo trabajador (docente/administrativo)',
  })
  create(@Body() createTrabajadorDto: CreateTrabajadorDto) {
    return this.trabajadorService.create(createTrabajadorDto);
  }

  @Post('transactional')
  @ApiOperation({
    summary: 'Registrar trabajador completo (trabajador + sueldo + contrato) en una transacción',
    description: 'Crea un trabajador, su usuario, sueldo base y contrato inicial de forma transaccional'
  })
  createTransactional(@Body() createTrabajadorTransactionalDto: CreateTrabajadorTransactionalDto) {
    return this.trabajadorService.createTrabajadorTransactional(createTrabajadorTransactionalDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los trabajadores' })
  findAll() {
    return this.trabajadorService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un trabajador específico por ID' })
  findOne(@Param('id') id: string) {
    return this.trabajadorService.findOne(id);
  }

  @Get('aulas/:idTrabajador')
  @ApiOperation({
    summary:
      'Aulas por Trabajador - Obtener todas las aulas asignadas a un trabajador específico',
  })
  findAulasPorTrabajador(@Param('idTrabajador') idTrabajador: string) {
    return this.trabajadorService.findAulasPorTrabajador(idTrabajador);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar información de un trabajador' })
  update(
    @Param('id') id: string,
    @Body() updateTrabajadorDto: UpdateTrabajadorDto,
  ) {
    return this.trabajadorService.update(id, updateTrabajadorDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un trabajador (desactivar)' })
  remove(@Param('id') id: string) {
    return this.trabajadorService.remove(id);
  }
}
