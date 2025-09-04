import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LibretaBimestralService } from './libreta-bimestral.service';
import { LibretaBimestralController } from './libreta-bimestral.controller';
import { LibretaBimestral } from './entities/libreta-bimestral.entity';
import { Nota } from '../nota/entities/nota.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LibretaBimestral, Nota])],
  controllers: [LibretaBimestralController],
  providers: [LibretaBimestralService],
  exports: [LibretaBimestralService],
})
export class LibretaBimestralModule { }
