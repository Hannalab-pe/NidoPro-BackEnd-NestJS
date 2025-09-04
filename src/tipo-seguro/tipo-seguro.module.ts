import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TipoSeguroService } from './tipo-seguro.service';
import { TipoSeguroController } from './tipo-seguro.controller';
import { TipoSeguro } from './entities/tipo-seguro.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TipoSeguro])],
  controllers: [TipoSeguroController],
  providers: [TipoSeguroService],
  exports: [TipoSeguroService],
})
export class TipoSeguroModule {}
