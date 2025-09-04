import { Module } from '@nestjs/common';
import { ApoderadoService } from './apoderado.service';
import { ApoderadoController } from './apoderado.controller';
import { Apoderado } from './entities/apoderado.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Apoderado]),
    AuthModule
  ],
  controllers: [ApoderadoController],
  providers: [ApoderadoService],
  exports: [ApoderadoService], // Exporting the service for use in other modules
})
export class ApoderadoModule { }
