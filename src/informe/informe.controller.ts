import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { InformeService } from './informe.service';
import { CreateInformeDto } from './dto/create-informe.dto';
import { UpdateInformeDto } from './dto/update-informe.dto';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';

@ApiTags('Informes')
@Controller('informe')
export class InformeController {
  constructor(private readonly informeService: InformeService) { }

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo informe sobre un estudiante' })
  async create(@Body() createInformeDto: CreateInformeDto) {
    const data = await this.informeService.create(createInformeDto);
    return {
      success: true,
      message: "Informe Registrado Correctamente",
      info: {
        data,
      }
    };
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los informes registrados' })
  async findAll() {
    const data = await this.informeService.findAll();
    return {
      success: true,
      message: "Informes Listados Correctamente",
      info: {
        data,
      }
    };
  }

  @Get('estudiante/:idEstudiante')
  @ApiOperation({ summary: 'Obtener todos los informes de un estudiante específico' })
  async findByEstudiante(@Param('idEstudiante') idEstudiante: string) {
    const data = await this.informeService.findByEstudiante(idEstudiante);
    return {
      success: true,
      message: "Informes del Estudiante Obtenidos Correctamente",
      info: {
        data,
        totalInformes: data.length,
        estudiante: idEstudiante
      }
    };
  }

  @Get('trabajador/:idTrabajador')
  @ApiOperation({ summary: 'Obtener todos los informes elaborados por un trabajador/profesor' })
  async findByTrabajador(@Param('idTrabajador') idTrabajador: string) {
    const data = await this.informeService.findByTrabajador(idTrabajador);
    return {
      success: true,
      message: "Informes del Trabajador Obtenidos Correctamente",
      info: {
        data,
        totalInformes: data.length,
        trabajador: idTrabajador
      }
    };
  }

  @Get('fechas')
  @ApiOperation({ summary: 'Obtener informes por rango de fechas' })
  @ApiQuery({ name: 'fechaInicio', required: true, description: 'Fecha de inicio en formato YYYY-MM-DD' })
  @ApiQuery({ name: 'fechaFin', required: true, description: 'Fecha de fin en formato YYYY-MM-DD' })
  async findByFechas(@Query('fechaInicio') fechaInicio: string, @Query('fechaFin') fechaFin: string) {
    const data = await this.informeService.findByFechas(fechaInicio, fechaFin);
    return {
      success: true,
      message: "Informes por Rango de Fechas Obtenidos Correctamente",
      info: {
        data,
        totalInformes: data.length,
        fechaInicio: fechaInicio,
        fechaFin: fechaFin
      }
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un informe específico por ID' })
  async findOne(@Param('id') id: string) {
    const data = await this.informeService.findOne(id);
    return {
      success: true,
      message: "Informe Encontrado Correctamente",
      info: {
        data,
      }
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un informe existente' })
  update(@Param('id') id: string, @Body() updateInformeDto: UpdateInformeDto) {
    const data = this.informeService.update(id, updateInformeDto);
    return {
      success: true,
      message: `Informe Actualizado Correctamente con el ID ${id}`,
      info: {
        data,
      }
    };
  }

}
