import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  Res,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { ProgramacionMensualService } from './programacion-mensual.service';
import { CreateProgramacionMensualDto } from './dto/create-programacion-mensual.dto';
import { UpdateProgramacionMensualDto } from './dto/update-programacion-mensual.dto';
import { EstadoProgramacionMensual } from '../enums/estado-programacion-mensual.enum';

@ApiTags('Programación Mensual')
@Controller('programacion-mensual')
export class ProgramacionMensualController {
  constructor(
    private readonly programacionMensualService: ProgramacionMensualService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear nueva programación mensual' })
  @ApiResponse({
    status: 201,
    description: 'Programación creada correctamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Error en los datos o programación duplicada',
  })
  create(@Body() createProgramacionMensualDto: CreateProgramacionMensualDto) {
    return this.programacionMensualService.create(createProgramacionMensualDto);
  }

  @Post('generar-bimestre')
  @ApiOperation({
    summary:
      'Generar todas las programaciones de un bimestre para un trabajador',
  })
  @ApiResponse({
    status: 201,
    description: 'Programaciones del bimestre generadas correctamente',
  })
  generarProgramacionesBimestre(
    @Body() data: { idTrabajador: string; idBimestre: string; idAula: string },
  ) {
    return this.programacionMensualService.generarProgramacionesBimestre(
      data.idTrabajador,
      data.idBimestre,
      data.idAula,
    );
  }

  @Patch(':id/presentar')
  @ApiOperation({ summary: 'Presentar programación (subir archivo)' })
  @ApiResponse({
    status: 200,
    description: 'Programación presentada correctamente',
  })
  presentarProgramacion(
    @Param('id') id: string,
    @Body() data: { archivoUrl: string; observaciones?: string },
  ) {
    return this.programacionMensualService.presentarProgramacion(
      id,
      data.archivoUrl,
      data.observaciones,
    );
  }

  @Patch(':id/evaluar')
  @ApiOperation({
    summary: 'Evaluar programación (aprobar/rechazar) - Solo coordinadores',
  })
  @ApiResponse({
    status: 200,
    description: 'Programación evaluada correctamente',
  })
  @ApiResponse({
    status: 403,
    description: 'Solo coordinadores pueden evaluar programaciones',
  })
  evaluarProgramacion(
    @Param('id') id: string,
    @Body()
    data: {
      estado:
        | EstadoProgramacionMensual.APROBADA
        | EstadoProgramacionMensual.RECHAZADA;
      observaciones: string;
    },
  ) {
    return this.programacionMensualService.evaluarProgramacion(
      id,
      data.estado,
      data.observaciones,
    );
  }

  @Patch(':id/rechazar')
  @ApiOperation({
    summary: 'Rechazar programación con motivo específico - Solo coordinadores',
  })
  @ApiResponse({
    status: 200,
    description: 'Programación rechazada correctamente',
  })
  @ApiResponse({
    status: 403,
    description: 'Solo coordinadores pueden rechazar programaciones',
  })
  rechazarProgramacion(
    @Param('id') id: string,
    @Body() data: { motivoRechazo: string },
    @Request() req: any,
  ) {
    const coordinadorId = req.user?.idTrabajador;
    return this.programacionMensualService.rechazarProgramacion(
      id,
      data.motivoRechazo,
      coordinadorId,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las programaciones mensuales' })
  @ApiResponse({
    status: 200,
    description: 'Lista de programaciones obtenida correctamente',
  })
  findAll() {
    return this.programacionMensualService.findAll();
  }

  @Post('marcar-vencidas')
  @ApiOperation({
    summary: 'Marcar programaciones vencidas (tarea automática)',
  })
  @ApiResponse({
    status: 200,
    description: 'Programaciones vencidas marcadas correctamente',
  })
  marcarProgramacionesVencidas() {
    return this.programacionMensualService.marcarProgramacionesVencidas();
  }

  // ==================== ENDPOINTS PARA CARGA MASIVA CON EXCEL ====================

  @Get('plantilla-excel')
  @ApiOperation({
    summary: 'Descargar plantilla Excel para carga masiva de programaciones',
  })
  @ApiResponse({
    status: 200,
    description: 'Plantilla Excel generada correctamente',
    headers: {
      'Content-Type': {
        description:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
      'Content-Disposition': {
        description:
          'attachment; filename="plantilla_programaciones_mensuales.xlsx"',
      },
    },
  })
  async descargarPlantillaExcel(@Res() res: Response) {
    try {
      const buffer =
        await this.programacionMensualService.generarPlantillaExcel();

      res.set({
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition':
          'attachment; filename="plantilla_programaciones_mensuales.xlsx"',
        'Content-Length': buffer.length.toString(),
      });

      res.send(buffer);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al generar la plantilla Excel',
        error: error.message,
      });
    }
  }

  @Post('cargar-excel')
  @ApiOperation({
    summary: 'Cargar programaciones mensuales desde archivo Excel',
  })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: 201,
    description: 'Archivo Excel procesado correctamente',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        resultados: {
          type: 'object',
          properties: {
            exitosas: { type: 'number' },
            fallidas: { type: 'number' },
            errores: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  fila: { type: 'number' },
                  error: { type: 'string' },
                  datos: { type: 'array' },
                },
              },
            },
            programacionesCreadas: { type: 'array' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Error en el formato del archivo o datos inválidos',
  })
  @UseInterceptors(
    FileInterceptor('archivo', {
      fileFilter: (req, file, callback) => {
        if (!file.originalname.match(/\.(xlsx|xls)$/)) {
          return callback(
            new Error('Solo se permiten archivos Excel (.xlsx, .xls)'),
            false,
          );
        }
        callback(null, true);
      },
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB límite
      },
    }),
  )
  async cargarProgramacionesExcel(
    @UploadedFile() archivo: Express.Multer.File,
  ) {
    if (!archivo) {
      return {
        success: false,
        message: 'No se ha proporcionado ningún archivo',
      };
    }

    try {
      const resultado =
        await this.programacionMensualService.procesarArchivoExcel(
          archivo.buffer,
        );
      return resultado;
    } catch (error) {
      return {
        success: false,
        message: 'Error al procesar el archivo Excel',
        error: error.message,
      };
    }
  }

  @Get('trabajador/:idTrabajador')
  @ApiOperation({ summary: 'Obtener programaciones por trabajador' })
  @ApiResponse({
    status: 200,
    description: 'Programaciones del trabajador obtenidas correctamente',
  })
  findByTrabajador(@Param('idTrabajador') idTrabajador: string) {
    return this.programacionMensualService.findByTrabajador(idTrabajador);
  }

  @Get('bimestre/:idBimestre')
  @ApiOperation({ summary: 'Obtener programaciones por bimestre' })
  @ApiResponse({
    status: 200,
    description: 'Programaciones del bimestre obtenidas correctamente',
  })
  findByBimestre(@Param('idBimestre') idBimestre: string) {
    return this.programacionMensualService.findByBimestre(idBimestre);
  }

  @Get('estado/:estado')
  @ApiOperation({ summary: 'Obtener programaciones por estado' })
  @ApiResponse({
    status: 200,
    description: 'Programaciones por estado obtenidas correctamente',
  })
  findByEstado(@Param('estado') estado: EstadoProgramacionMensual) {
    return this.programacionMensualService.findByEstado(estado);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener programación por ID' })
  @ApiResponse({
    status: 200,
    description: 'Programación obtenida correctamente',
  })
  @ApiResponse({ status: 404, description: 'Programación no encontrada' })
  findOne(@Param('id') id: string) {
    return this.programacionMensualService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar programación mensual (docente corrige)',
  })
  @ApiResponse({
    status: 200,
    description: 'Programación actualizada correctamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Solo se pueden editar programaciones PENDIENTES o RECHAZADAS',
  })
  update(
    @Param('id') id: string,
    @Body() updateProgramacionMensualDto: UpdateProgramacionMensualDto,
  ) {
    return this.programacionMensualService.update(
      id,
      updateProgramacionMensualDto,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar programación mensual' })
  @ApiResponse({
    status: 200,
    description: 'Programación eliminada correctamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Solo se pueden eliminar programaciones PENDIENTES',
  })
  remove(@Param('id') id: string) {
    return this.programacionMensualService.remove(id);
  }
}
