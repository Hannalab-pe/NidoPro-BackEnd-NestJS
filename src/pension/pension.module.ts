import { Module } from '@nestjs/common';
import { PensionService } from './pension.service';
import { PensionController } from './pension.controller';
import { Pension } from './entities/pension.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Pension])],
  controllers: [PensionController],
  providers: [PensionService],
})
export class PensionModule { }
