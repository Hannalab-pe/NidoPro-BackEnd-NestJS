import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { AsistenciaService } from './asistencia.service';
import { CreateAsistenciaDto, CreateAsistenciaMasivaDto } from './dto/create-asistencia.dto';
import { UpdateAsistenciaDto } from './dto/update-asistencia.dto';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';

@ApiTags('Asistencia')
@Controller('asistencia')
export class AsistenciaController {
  constructor(private readonly asistenciaService: AsistenciaService) { }

  @Post()
  @ApiOperation({ summary: 'Registrar asistencia masiva para un aula completa (PRINCIPAL)' })
  async create(@Body() createAsistenciaMasivaDto: CreateAsistenciaMasivaDto) {
    const data = await this.asistenciaService.createMasivo(createAsistenciaMasivaDto);
    return {
      success: true,
      message: `Asistencia Registrada Correctamente - ${data.length} estudiantes procesados`,
      info: {
        data,
        totalRegistros: data.length
      }
    };
  }

  @Post('individual')
  @ApiOperation({ summary: 'Registrar asistencia individual (uso secundario)' })
  async createIndividual(@Body() createAsistenciaDto: CreateAsistenciaDto) {
    const data = await this.asistenciaService.create(createAsistenciaDto);
    return {
      success: true,
      message: "Asistencia Individual Registrada Correctamente",
      info: {
        data,
      }
    };
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las asistencias registradas' })
  async findAll() {
    const data = await this.asistenciaService.findAll();
    return {
      success: true,
      message: "Asistencias Listadas Correctamente",
      info: {
        data,
      }
    };
  }

  @Get('aula/:idAula')
  @ApiOperation({ summary: 'Obtener asistencias por aula y fecha' })
  @ApiQuery({ name: 'fecha', required: true, description: 'Fecha en formato YYYY-MM-DD' })
  async findByAulaAndFecha(@Param('idAula') idAula: string, @Query('fecha') fecha: string) {
    const data = await this.asistenciaService.findByAulaAndFecha(idAula, fecha);
    return {
      success: true,
      message: "Asistencias del Aula Obtenidas Correctamente",
      info: {
        data,
        totalRegistros: data.length,
        aula: idAula,
        fecha: fecha
      }
    };
  }

  @Get('estudiante/:idEstudiante')
  @ApiOperation({ summary: 'Obtener historial de asistencias de un estudiante' })
  async findByEstudiante(@Param('idEstudiante') idEstudiante: string) {
    const data = await this.asistenciaService.findByEstudiante(idEstudiante);
    return {
      success: true,
      message: "Historial de Asistencias del Estudiante Obtenido Correctamente",
      info: {
        data,
        totalRegistros: data.length,
        estudiante: idEstudiante
      }
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una asistencia específica por ID' })
  async findOne(@Param('id') id: string) {
    const data = await this.asistenciaService.findOne(id);
    return {
      success: true,
      message: "Asistencia Encontrada Correctamente",
      info: {
        data,
      }
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una asistencia específica' })
  update(@Param('id') id: string, @Body() updateAsistenciaDto: UpdateAsistenciaDto) {
    const data = this.asistenciaService.update(id, updateAsistenciaDto);
    return {
      success: true,
      message: `Asistencia Actualizada Correctamente con el ID ${id}`,
      info: {
        data,
      }
    };
  }

}
