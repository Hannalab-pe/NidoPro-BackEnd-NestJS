import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe } from '@nestjs/common';
import { AulaService } from './aula.service';
import { CreateAulaDto } from './dto/create-aula.dto';
import { UpdateAulaDto } from './dto/update-aula.dto';
import { ApiTags, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

@ApiTags('Aulas')
@Controller('aula')
export class AulaController {
  constructor(private readonly aulaService: AulaService) { }

  @Post()
  @ApiOperation({ summary: 'Crear una nueva aula' })
  async create(@Body() createAulaDto: CreateAulaDto) {
    const data = await this.aulaService.create(createAulaDto);
    return {
      success: true,
      message: "Aula Registrada Correctamente",
      info: {
        data,
      }
    };
  }

  @Get('sin-asignacion')
  @ApiOperation({ summary: 'Obtener todas las aulas sin asignación' })
  async findAulasSinAsignacion() {
    const data = await this.aulaService.findAulasSinAsignacion();
    return {
      success: true,
      message: "Aulas sin asignación obtenidas correctamente",
      info: {
        data,
      }
    };
  }

  @Get('pension-asignada')
  @ApiOperation({ summary: 'Obtener todas las aulas con pensiones asignadas' })
  async findAulasPorPension() {
    const data = await this.aulaService.findAulasPorPensionGrado();
    return {
      success: true,
      message: "Aulas con pensiones asignadas obtenidas correctamente",
      info: {
        data,
      }
    };
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las aulas' })
  async findAll() {
    const data = await this.aulaService.findAll();
    return {
      success: true,
      message: "Aulas Listadas Correctamente",
      info: {
        data,
      }
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un aula específica por ID' })
  async findOne(@Param('id') id: string) {
    const data = await this.aulaService.findOne(id);
    return {
      success: true,
      message: "Aula Encontrada Correctamente",
      info: {
        data,
      }
    };
  }

  @Get('disponibles-por-grado/:idGrado')
  @ApiOperation({
    summary: 'Obtener aulas disponibles por grado',
    description: 'Devuelve todas las aulas que tienen cupos disponibles para un grado específico, ordenadas por disponibilidad'
  })
  @ApiParam({
    name: 'idGrado',
    description: 'UUID del grado',
    example: 'c3d4e5f6-g7h8-9012-cdef-345678901234'
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de aulas disponibles con información de cupos',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Aulas disponibles obtenidas correctamente' },
        info: {
          type: 'object',
          properties: {
            data: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  idAula: { type: 'string', format: 'uuid' },
                  seccion: { type: 'string', example: 'A' },
                  cantidadEstudiantes: { type: 'number', example: 25 },
                  estudiantesAsignados: { type: 'number', example: 15 },
                  cuposDisponibles: { type: 'number', example: 10 }
                }
              }
            }
          }
        }
      }
    }
  })
  async getAulasDisponiblesPorGrado(@Param('idGrado', ParseUUIDPipe) idGrado: string) {
    const data = await this.aulaService.getAulasDisponiblesConDetalles(idGrado);
    return {
      success: true,
      message: "Aulas disponibles obtenidas correctamente",
      info: {
        data,
      }
    };
  }


  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un aula específica' })
  async update(@Param('id') id: string, @Body() updateAulaDto: UpdateAulaDto) {
    const data = await this.aulaService.update(id, updateAulaDto);
    return {
      success: true,
      message: `Aula Actualizada Correctamente con el ID ${id}`,
      info: {
        data,
      }
    };
  }

}
