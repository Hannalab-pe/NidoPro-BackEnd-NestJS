import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ComentarioDocenteService } from './comentario-docente.service';
import { CreateComentarioDocenteDto } from './dto/create-comentario-docente.dto';
import { UpdateComentarioDocenteDto } from './dto/update-comentario-docente.dto';

@ApiTags('Comentario Docente')
@Controller('comentario-docente')
export class ComentarioDocenteController {
  constructor(private readonly comentarioDocenteService: ComentarioDocenteService) {}

  @Post()
  @ApiOperation({ summary: 'Crear nuevo comentario docente' })
  @ApiResponse({
    status: 201,
    description: 'Comentario docente creado correctamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada inválidos',
  })
  @ApiResponse({
    status: 404,
    description: 'Trabajador o coordinador no encontrado',
  })
  create(@Body() createComentarioDocenteDto: CreateComentarioDocenteDto) {
    return this.comentarioDocenteService.create(createComentarioDocenteDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los comentarios docentes' })
  @ApiResponse({
    status: 200,
    description: 'Lista de comentarios docentes obtenida correctamente',
  })
  findAll() {
    return this.comentarioDocenteService.findAll();
  }

  @Get('trabajador/:idTrabajador')
  @ApiOperation({ summary: 'Obtener comentarios docentes por trabajador' })
  @ApiParam({
    name: 'idTrabajador',
    description: 'ID del trabajador (docente)',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de comentarios del trabajador obtenida correctamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Trabajador no encontrado',
  })
  findByTrabajador(@Param('idTrabajador', ParseUUIDPipe) idTrabajador: string) {
    return this.comentarioDocenteService.findByTrabajador(idTrabajador);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener comentario docente por ID' })
  @ApiParam({
    name: 'id',
    description: 'ID del comentario docente',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiResponse({
    status: 200,
    description: 'Comentario docente encontrado',
  })
  @ApiResponse({
    status: 404,
    description: 'Comentario docente no encontrado',
  })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.comentarioDocenteService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar comentario docente' })
  @ApiParam({
    name: 'id',
    description: 'ID del comentario docente',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiResponse({
    status: 200,
    description: 'Comentario docente actualizado correctamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada inválidos',
  })
  @ApiResponse({
    status: 404,
    description: 'Comentario docente no encontrado',
  })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateComentarioDocenteDto: UpdateComentarioDocenteDto) {
    return this.comentarioDocenteService.update(id, updateComentarioDocenteDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar comentario docente' })
  @ApiParam({
    name: 'id',
    description: 'ID del comentario docente',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiResponse({
    status: 200,
    description: 'Comentario docente eliminado correctamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Comentario docente no encontrado',
  })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.comentarioDocenteService.remove(id);
  }
}
