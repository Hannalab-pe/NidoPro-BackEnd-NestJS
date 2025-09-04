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
@ApiBearerAuth()
@Controller('apoderado')
@UseGuards(JwtAuthGuard, RolesGuard)
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
