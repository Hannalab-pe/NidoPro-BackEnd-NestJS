import { Module } from '@nestjs/common';
import { PensionEstudianteService } from './pension-estudiante.service';
import { PensionEstudianteController } from './pension-estudiante.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PensionEstudiante } from './entities/pension-estudiante.entity';
import { TrabajadorModule } from 'src/trabajador/trabajador.module';

@Module({
  imports: [TypeOrmModule.forFeature([PensionEstudiante]),TrabajadorModule],
  controllers: [PensionEstudianteController],
  providers: [PensionEstudianteService],
})
export class PensionEstudianteModule { }
