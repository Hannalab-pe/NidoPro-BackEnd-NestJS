import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { RolService } from './rol.service';
import { CreateRolDto } from './dto/create-rol.dto';
import { UpdateRolDto } from './dto/update-rol.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../enums/roles.enum';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Roles')
@ApiBearerAuth()
@Controller('rol')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RolController {
  constructor(private readonly rolService: RolService) { }

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo rol del sistema (Solo directora)' })
  @Roles(UserRole.DIRECTORA) // Solo directora puede crear roles
  create(@Body() createRolDto: CreateRolDto, @CurrentUser() user: any) {
    return this.rolService.create(createRolDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los roles del sistema (Directora y secretaria)' })
  @Roles(UserRole.DIRECTORA, UserRole.SECRETARIA) // Solo directora y secretaria pueden ver roles
  findAll(@CurrentUser() user: any) {
    return this.rolService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un rol específico por ID (Directora y secretaria)' })
  @Roles(UserRole.DIRECTORA, UserRole.SECRETARIA)
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.rolService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un rol del sistema (Solo directora)' })
  @Roles(UserRole.DIRECTORA) // Solo directora puede actualizar roles
  update(@Param('id') id: string, @Body() updateRolDto: UpdateRolDto, @CurrentUser() user: any) {
    return this.rolService.update(id, updateRolDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un rol del sistema (Solo directora)' })
  @Roles(UserRole.DIRECTORA) // Solo directora puede eliminar roles
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.rolService.remove(id);
  }
}
