import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Put } from '@nestjs/common';
import { MatriculaAulaService } from './matricula-aula.service';
import { CreateMatriculaAulaDto } from './dto/create-matricula-aula.dto';
import { UpdateMatriculaAulaDto } from './dto/update-matricula-aula.dto';
import { ApiTags, ApiOperation, ApiParam, ApiBody } from '@nestjs/swagger';

@ApiTags('Matrícula-Aula')
@Controller('matricula-aula')
export class MatriculaAulaController {
  constructor(private readonly matriculaAulaService: MatriculaAulaService) { }

  @Post()
  @ApiOperation({ summary: 'Asignar un estudiante matriculado a un aula específica' })
  async create(@Body() createMatriculaAulaDto: CreateMatriculaAulaDto) {
    const data = await this.matriculaAulaService.create(createMatriculaAulaDto);
    return {
      success: true,
      message: "Asignación de Aula Registrada Correctamente",
      info: {
        data
      }
    };
  }

  @Patch('cambiar-aula/:idMatricula')
  @ApiOperation({
    summary: 'Cambiar un estudiante de aula',
    description: 'Permite cambiar un estudiante de su aula actual a una nueva aula con motivo opcional'
  })
  @ApiParam({ name: 'idMatricula', description: 'ID de la matrícula del estudiante' })
  @ApiBody({
    description: 'Datos para el cambio de aula',
    schema: {
      type: 'object',
      properties: {
        nuevaAulaId: { type: 'string', description: 'ID del aula destino' },
        motivo: { type: 'string', description: 'Motivo del cambio (opcional)' }
      },
      required: ['nuevaAulaId']
    }
  })
  async cambiarAula(
    @Param('idMatricula') idMatricula: string,
    @Body() body: { nuevaAulaId: string; motivo?: string }
  ) {
    const data = await this.matriculaAulaService.cambiarAula(
      idMatricula,
      body.nuevaAulaId,
      body.motivo
    );
    return {
      success: true,
      message: "Aula cambiada correctamente",
      info: {
        data
      }
    };
  }

  @Get('estudiantes-aula/:idAula')
  @ApiOperation({
    summary: 'Obtener todos los estudiantes asignados a un aula específica',
    description: 'Lista todos los estudiantes matriculados que están asignados a un aula determinada'
  })
  @ApiParam({ name: 'idAula', description: 'ID del aula' })
  async obtenerEstudiantesDelAula(@Param('idAula') idAula: string) {
    const data = await this.matriculaAulaService.obtenerEstudiantesDelAula(idAula);
    return {
      success: true,
      message: "Estudiantes del Aula Obtenidos Correctamente",
      info: {
        data
      }
    };
  }

  @Get('aula-estudiante/:idMatricula')
  @ApiOperation({
    summary: 'Obtener el aula asignada a un estudiante específico',
    description: 'Obtiene la información del aula donde está asignado un estudiante matriculado'
  })
  @ApiParam({ name: 'idMatricula', description: 'ID de la matrícula del estudiante' })
  async obtenerAulaDelEstudiante(@Param('idMatricula') idMatricula: string) {
    const data = await this.matriculaAulaService.obtenerAulaDelEstudiante(idMatricula);
    return {
      success: true,
      message: "Aula del Estudiante Obtenida Correctamente",
      info: {
        data
      }
    };
  }

  @Put('retirar-estudiante/:idMatricula')
  @ApiOperation({
    summary: 'Retirar un estudiante del aula',
    description: 'Retira a un estudiante de su aula actual, manteniendo su matrícula pero sin asignación de aula'
  })
  @ApiParam({ name: 'idMatricula', description: 'ID de la matrícula del estudiante a retirar' })
  async retirarEstudiante(@Param('idMatricula') idMatricula: string) {
    const data = await this.matriculaAulaService.retirarEstudiante(idMatricula);
    return {
      success: true,
      message: "Estudiante retirado del aula correctamente",
      info: {
        data
      }
    };
  }

}
