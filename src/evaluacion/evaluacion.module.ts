import { Module } from '@nestjs/common';
import { EvaluacionService } from './evaluacion.service';
import { EvaluacionController } from './evaluacion.controller';
import { Evaluacion } from './entities/evaluacion.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Evaluacion])],
  controllers: [EvaluacionController],
  providers: [EvaluacionService],
})
export class EvaluacionModule { }
