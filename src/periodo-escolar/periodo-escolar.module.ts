import { Module } from '@nestjs/common';
import { PeriodoEscolarService } from './periodo-escolar.service';
import { PeriodoEscolarController } from './periodo-escolar.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PeriodoEscolar } from './entities/periodo-escolar.entity';
import { Bimestre } from '../bimestre/entities/bimestre.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PeriodoEscolar, Bimestre])],
  controllers: [PeriodoEscolarController],
  providers: [PeriodoEscolarService],
  exports: [PeriodoEscolarService],
})
export class PeriodoEscolarModule { }
