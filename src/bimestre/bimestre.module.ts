import { Module } from '@nestjs/common';
import { BimestreService } from './bimestre.service';
import { BimestreController } from './bimestre.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bimestre } from './entities/bimestre.entity';
import { PeriodoEscolarModule } from '../periodo-escolar/periodo-escolar.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Bimestre]),
    PeriodoEscolarModule
  ],
  controllers: [BimestreController],
  providers: [BimestreService],
  exports: [BimestreService]
})
export class BimestreModule { }
