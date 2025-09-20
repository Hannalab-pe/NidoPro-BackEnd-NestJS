import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Put } from '@nestjs/common';
import { ApoderadoService } from './apoderado.service';
import { CreateApoderadoDto } from './dto/create-apoderado.dto';
import { UpdateApoderadoDto } from './dto/update-apoderado.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles-auth.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/enums/roles.enum';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Apoderados')
@Controller('apoderado')
export class ApoderadoController {
  constructor(private readonly apoderadoService: ApoderadoService) { }

  @Post()
  @ApiOperation({ summary: 'Registrar un nuevo apoderado (Directora y secretaria)' })
  @Roles(UserRole.DIRECTORA, UserRole.SECRETARIA)
  async create(@Body() createApoderadoDto: CreateApoderadoDto, @CurrentUser() user: any) {
    const data = await this.apoderadoService.create(createApoderadoDto);
    return {
      success: true,
      message: "Apoderado Registrado Correctamente",
      createdBy: user?.usuario || 'Sistema',
      info: {
        data,
      }
    };
  }

  @Get('pensiones/:idApoderado/:idEstudiante')
  @ApiOperation({ summary: 'Obtener pensiones de un estudiante específico por ID de apoderado e ID de estudiante' })
  async findPensionesPorApoderadoEstudiante(@Param('idApoderado') idApoderado: string, @Param('idEstudiante') idEstudiante: string) {
    const data = await this.apoderadoService.findPensionesPorApoderadoEstudiante(idApoderado, idEstudiante);
    return {
      success: true,
      message: "Pensiones por Apoderado y Estudiante Obtenidas Correctamente",
      info: {
        data,
      }
    };
  }

  @Get('estudiantes')
  @ApiOperation({ summary: 'Obtener apoderado con sus estudiantes por ID de apoderado (Directora, secretaria y docentes)' })
  async findEstudiantesByApoderado() {
    const data = await this.apoderadoService.findEstudiantesByApoderado();
    return {
      success: true,
      message: "Apoderado con Estudiantes Obtenido Correctamente",
      info: {
        data,
      }
    };
  }


  @Get()
  @ApiOperation({ summary: 'Obtener todos los apoderados (Directora, secretaria y docentes)' })
  @Roles(UserRole.DIRECTORA, UserRole.SECRETARIA, UserRole.DOCENTE)
  async findAll(@CurrentUser() user: any) {
    const data = await this.apoderadoService.findAll();
    return {
      success: true,
      message: "Apoderados Listados Correctamente",
      requestedBy: user?.usuario || 'Sistema',
      info: {
        data,
      }
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un apoderado específico por ID (Directora, secretaria y docentes)' })
  @Roles(UserRole.DIRECTORA, UserRole.SECRETARIA, UserRole.DOCENTE)
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    const data = await this.apoderadoService.findOne(id);
    return {
      success: true,
      message: "Apoderado Encontrado Correctamente",
      requestedBy: user?.usuario || 'Sistema',
      info: {
        data,
      }
    };
  }


  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar información de un apoderado (Directora y secretaria)' })
  @Roles(UserRole.DIRECTORA, UserRole.SECRETARIA)
  async update(@Param('id') id: string, @Body() updateApoderadoDto: UpdateApoderadoDto, @CurrentUser() user: any) {
    const data = await this.apoderadoService.update(id, updateApoderadoDto);
    return {
      success: true,
      message: `Apoderado Actualizado Correctamente con el ID ${id}`,
      updatedBy: user?.usuario || 'Sistema',
      info: {
        data,
      }
    };
  }

}
