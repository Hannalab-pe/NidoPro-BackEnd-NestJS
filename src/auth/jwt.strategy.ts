import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'fallback-secret',
    });
  }

  async validate(payload: any) {
    const user = await this.authService.validateUser(payload.sub);
    if (!user) {
      throw new UnauthorizedException();
    }

    // Retornar información completa del usuario desde el payload
    return {
      idUsuario: user.idUsuario,
      usuario: user.usuario,
      tipo: payload.tipo,
      rol: { nombre: payload.rol }, // Estructura que espera el RolesGuard
      rolNombre: payload.rol, // Backup para compatibilidad
      entidadId: payload.entidadId,
      fullName: payload.fullName
    };
  }
}
