import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Usuario } from '../usuario/entities/usuario.entity';
import { Trabajador } from '../trabajador/entities/trabajador.entity';
import { Estudiante } from '../estudiante/entities/estudiante.entity';
import { RolesGuard } from './guards/roles-auth.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([Usuario, Trabajador, Estudiante]),
    PassportModule,
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '24h' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, RolesGuard],
  exports: [AuthService,RolesGuard],
})
export class AuthModule { }
