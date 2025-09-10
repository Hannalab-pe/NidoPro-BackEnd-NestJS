import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import {
  ChangePasswordDto,
  ForceChangePasswordDto,
} from './dto/change-password.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Usuarios')
@Controller('usuario')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo usuario del sistema' })
  create(@Body() createUsuarioDto: CreateUsuarioDto) {
    return this.usuarioService.create(createUsuarioDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los usuarios del sistema' })
  findAll() {
    return this.usuarioService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un usuario específico por ID' })
  findOne(@Param('id') id: string) {
    return this.usuarioService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar información de un usuario' })
  update(@Param('id') id: string, @Body() updateUsuarioDto: UpdateUsuarioDto) {
    return this.usuarioService.update(id, updateUsuarioDto);
  }

  @Patch(':id/cambiar-contrasena')
  @ApiOperation({ summary: 'Cambiar contraseña de un usuario' })
  changePassword(
    @Param('id') id: string,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.usuarioService.changePassword(id, changePasswordDto);
  }

  @Patch(':id/forzar-cambio-contrasena')
  @ApiOperation({
    summary:
      'Forzar cambio de contraseña de un usuario (sin contraseña actual)',
  })
  forceChangePassword(
    @Param('id') id: string,
    @Body() forceChangePasswordDto: ForceChangePasswordDto,
  ) {
    return this.usuarioService.forceChangePassword(id, forceChangePasswordDto);
  }

  @Get(':id/estado-cambio-contrasena')
  @ApiOperation({
    summary: 'Obtener el estado de cambio de contraseña de un usuario',
  })
  getPasswordChangeStatus(@Param('id') id: string) {
    return this.usuarioService.getPasswordChangeStatus(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un usuario del sistema' })
  remove(@Param('id') id: string) {
    return this.usuarioService.remove(id);
  }
}
