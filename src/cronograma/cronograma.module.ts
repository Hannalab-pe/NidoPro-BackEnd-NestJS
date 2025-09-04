import { Module } from '@nestjs/common';
import { CronogramaService } from './cronograma.service';
import { CronogramaController } from './cronograma.controller';
import { Cronograma } from './entities/cronograma.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Cronograma])],
  controllers: [CronogramaController],
  providers: [CronogramaService],
})
export class CronogramaModule { }
