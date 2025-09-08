import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe } from '@nestjs/common';
import { MatriculaService } from './matricula.service';
import { CreateMatriculaDto } from './dto/create-matricula.dto';
import { ApiOperation, ApiQuery, ApiResponse, ApiParam } from '@nestjs/swagger';
import { SearchMatriculaDto } from './dto/search-matricula.dto';

@Controller('matricula')
export class MatriculaController {
  constructor(private readonly matriculaService: MatriculaService) { }

  @Post()
  @ApiOperation({ summary: 'Registrar una nueva matrícula para un estudiante' })
  async create(@Body() createMatriculaDto: CreateMatriculaDto) {
    console.log('🔥 CONTROLLER - Datos recibidos:', JSON.stringify(createMatriculaDto, null, 2));
    console.log('🔥 CONTROLLER - estudianteData:', createMatriculaDto.estudianteData);
    console.log('🔥 CONTROLLER - contactosEmergencia:', createMatriculaDto.estudianteData?.contactosEmergencia);

    const data = await this.matriculaService.create(createMatriculaDto);
    return {
      success: true,
      message: "Matricula Registrada Correctamente",
      info: {
        data
      }
    }
  }

  // ===== RUTAS ESPECÍFICAS PRIMERO (ANTES DE :id) =====

  @Get('estudiantes-con-apoderados')
  @ApiOperation({ summary: 'Obtener estudiantes con sus apoderados' })
  async findByParameters() {
    const data = await this.matriculaService.findEstudiantesConApoderados();
    return {
      success: true,
      message: "Estudiantes con Apoderados",
      info: {
        data
      }
    }
  }

  @Get('busquedaAvanzada')
  @ApiOperation({
    summary: 'Buscar matrículas con filtros avanzados',
    description: 'Permite buscar matrículas usando múltiples filtros como fechas, grado, estudiante, apoderado, etc.'
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de matrículas encontradas con metadatos de paginación',
  })
  async searchMatriculas(@Query() searchDto: SearchMatriculaDto) {
    return await this.matriculaService.search(searchDto);
  }

  @Get('busquedaRapida')
  @ApiOperation({
    summary: 'Búsqueda rápida de matrículas',
    description: 'Búsqueda rápida por nombre de estudiante, apoderado o DNI'
  })
  @ApiQuery({ name: 'term', description: 'Término de búsqueda', example: 'María' })
  @ApiQuery({ name: 'limit', description: 'Límite de resultados', example: 5, required: false })
  @ApiResponse({
    status: 200,
    description: 'Lista de matrículas encontradas (máximo 5)',
  })
  async quickSearch(
    @Query('term') term: string,
    @Query('limit') limit?: number
  ) {
    if (!term || term.trim() === '') {
      return {
        success: false,
        message: 'Término de búsqueda requerido',
        info: { data: [] }
      };
    }
    const data = await this.matriculaService.quickSearch(term, limit);
    return {
      success: true,
      message: "Búsqueda rápida completada",
      info: { data }
    };
  }

  @Get('estudianteDNI/:dni')
  @ApiOperation({
    summary: 'Buscar matrículas por DNI del estudiante',
    description: 'Encuentra todas las matrículas de un estudiante usando su DNI'
  })
  @ApiParam({ name: 'dni', description: 'DNI del estudiante', example: '87654321' })
  @ApiResponse({
    status: 200,
    description: 'Lista de matrículas del estudiante',
  })
  async getMatriculasByStudentDni(@Param('dni') dni: string) {
    const searchDto = new SearchMatriculaDto();
    searchDto.dniEstudiante = dni;
    searchDto.limit = 100;

    const result = await this.matriculaService.search(searchDto);
    return {
      success: true,
      message: `Matrículas encontradas para DNI: ${dni}`,
      info: result
    };
  }

  @Get('porGradoEstudiante/:idGrado')
  @ApiOperation({
    summary: 'Buscar matrículas por grado',
    description: 'Encuentra todas las matrículas de un grado específico'
  })
  @ApiParam({ name: 'idGrado', description: 'UUID del grado', example: 'c3d4e5f6-g7h8-9012-cdef-345678901234' })
  @ApiQuery({ name: 'page', description: 'Página', example: 1, required: false })
  @ApiQuery({ name: 'limit', description: 'Límite por página', example: 20, required: false })
  @ApiResponse({
    status: 200,
    description: 'Lista de matrículas del grado',
  })
  async getMatriculasByGrade(
    @Param('idGrado', ParseUUIDPipe) idGrado: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number
  ) {
    const searchDto = new SearchMatriculaDto();
    searchDto.idGrado = idGrado;
    searchDto.page = page || 1;
    searchDto.limit = limit || 20;

    const result = await this.matriculaService.search(searchDto);
    return {
      success: true,
      message: "Matrículas por grado encontradas",
      info: result
    };
  }

  @Get('rangoFechas')
  @ApiOperation({
    summary: 'Buscar matrículas por rango de fechas',
    description: 'Encuentra matrículas registradas en un rango de fechas específico'
  })
  @ApiQuery({ name: 'fechaDesde', description: 'Fecha inicio', example: '2024-01-01' })
  @ApiQuery({ name: 'fechaHasta', description: 'Fecha fin', example: '2024-12-31' })
  @ApiQuery({ name: 'page', description: 'Página', example: 1, required: false })
  @ApiQuery({ name: 'limit', description: 'Límite por página', example: 20, required: false })
  @ApiResponse({
    status: 200,
    description: 'Lista de matrículas en el rango de fechas',
  })
  async getMatriculasByDateRange(
    @Query('fechaDesde') fechaDesde: string,
    @Query('fechaHasta') fechaHasta: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number
  ) {
    const searchDto = new SearchMatriculaDto();
    searchDto.fechaIngresoDesde = fechaDesde;
    searchDto.fechaIngresoHasta = fechaHasta;
    searchDto.page = page || 1;
    searchDto.limit = limit || 20;

    const result = await this.matriculaService.search(searchDto);
    return {
      success: true,
      message: "Matrículas por rango de fechas encontradas",
      info: result
    };
  }

  // ===== RUTAS GENÉRICAS AL FINAL =====

  @Get()
  @ApiOperation({ summary: 'Obtener todas las matrículas' })
  @ApiQuery({ name: 'page', description: 'Página', example: 1, required: false })
  @ApiQuery({ name: 'limit', description: 'Límite por página', example: 10, required: false })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number
  ) {
    const searchDto = new SearchMatriculaDto();
    searchDto.page = page || 1;
    searchDto.limit = limit || 10;

    return this.matriculaService.search(searchDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una matrícula por ID' })
  @ApiParam({ name: 'id', description: 'UUID de la matrícula', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiResponse({
    status: 200,
    description: 'Matrícula encontrada',
  })
  @ApiResponse({
    status: 400,
    description: 'ID inválido (no es un UUID)',
  })
  @ApiResponse({
    status: 404,
    description: 'Matrícula no encontrada',
  })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.matriculaService.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una matrícula por ID' })
  @ApiParam({ name: 'id', description: 'UUID de la matrícula', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiResponse({
    status: 200,
    description: 'Matrícula eliminada correctamente',
  })
  @ApiResponse({
    status: 400,
    description: 'ID inválido (no es un UUID)',
  })
  @ApiResponse({
    status: 404,
    description: 'Matrícula no encontrada',
  })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.matriculaService.remove(id);
  }
}