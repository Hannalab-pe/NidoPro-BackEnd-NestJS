import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { NotificacionService } from './notificacion.service';
import { CreateNotificacionDto } from './dto/create-notificacion.dto';
import { UpdateNotificacionDto } from './dto/update-notificacion.dto';
import { MarcarLeidoDto } from './dto/marcar-leido.dto';

@ApiTags('notificaciones')
@Controller('notificacion')
export class NotificacionController {
  constructor(private readonly notificacionService: NotificacionService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva notificación' })
  @ApiResponse({ status: 201, description: 'Notificación creada exitosamente' })
  create(@Body() createNotificacionDto: CreateNotificacionDto) {
    return this.notificacionService.create(createNotificacionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las notificaciones' })
  @ApiResponse({
    status: 200,
    description: 'Lista de todas las notificaciones',
  })
  findAll() {
    return this.notificacionService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una notificación por ID' })
  @ApiParam({ name: 'id', description: 'ID de la notificación' })
  @ApiResponse({ status: 200, description: 'Notificación encontrada' })
  @ApiResponse({ status: 404, description: 'Notificación no encontrada' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.notificacionService.findOne(id);
  }

  @Get('usuario/:idUsuario')
  @ApiOperation({
    summary: 'Obtener todas las notificaciones de un usuario',
  })
  @ApiParam({ name: 'idUsuario', description: 'ID del usuario' })
  @ApiResponse({ status: 200, description: 'Notificaciones del usuario' })
  findByUsuario(@Param('idUsuario', ParseUUIDPipe) idUsuario: string) {
    return this.notificacionService.findByUsuario(idUsuario);
  }

  @Get('usuario/:idUsuario/no-leidas')
  @ApiOperation({
    summary: 'Obtener notificaciones no leídas de un usuario',
  })
  @ApiParam({ name: 'idUsuario', description: 'ID del usuario' })
  @ApiResponse({
    status: 200,
    description: 'Notificaciones no leídas del usuario',
  })
  findByUsuarioNoLeidas(@Param('idUsuario', ParseUUIDPipe) idUsuario: string) {
    return this.notificacionService.findByUsuarioNoLeidas(idUsuario);
  }

  @Get('usuario/:idUsuario/contar-no-leidas')
  @ApiOperation({ summary: 'Contar notificaciones no leídas de un usuario' })
  @ApiParam({ name: 'idUsuario', description: 'ID del usuario' })
  @ApiResponse({
    status: 200,
    description: 'Número de notificaciones no leídas',
  })
  contarNoLeidas(@Param('idUsuario', ParseUUIDPipe) idUsuario: string) {
    return this.notificacionService.contarNoLeidas(idUsuario);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una notificación' })
  @ApiParam({ name: 'id', description: 'ID de la notificación' })
  @ApiResponse({
    status: 200,
    description: 'Notificación actualizada exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Notificación no encontrada' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateNotificacionDto: UpdateNotificacionDto,
  ) {
    return this.notificacionService.update(id, updateNotificacionDto);
  }

  @Patch(':id/marcar-leido')
  @ApiOperation({ summary: 'Marcar una notificación como leída o no leída' })
  @ApiParam({ name: 'id', description: 'ID de la notificación' })
  @ApiResponse({ status: 200, description: 'Estado de lectura actualizado' })
  @ApiResponse({ status: 404, description: 'Notificación no encontrada' })
  marcarComoLeido(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() marcarLeidoDto?: MarcarLeidoDto,
  ) {
    return this.notificacionService.marcarComoLeido(id, marcarLeidoDto);
  }

  @Patch('usuario/:idUsuario/marcar-todas-leidas')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Marcar todas las notificaciones de un usuario como leídas',
  })
  @ApiParam({ name: 'idUsuario', description: 'ID del usuario' })
  @ApiResponse({
    status: 204,
    description: 'Todas las notificaciones marcadas como leídas',
  })
  async marcarTodasComoLeidas(
    @Param('idUsuario', ParseUUIDPipe) idUsuario: string,
  ) {
    await this.notificacionService.marcarTodasComoLeidas(idUsuario);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar una notificación' })
  @ApiParam({ name: 'id', description: 'ID de la notificación' })
  @ApiResponse({
    status: 204,
    description: 'Notificación eliminada exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Notificación no encontrada' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.notificacionService.remove(id);
  }
}
