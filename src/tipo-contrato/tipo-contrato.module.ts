import { Module } from '@nestjs/common';
import { TipoContratoService } from './tipo-contrato.service';
import { TipoContratoController } from './tipo-contrato.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TipoContrato } from './entities/tipo-contrato.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TipoContrato])],
  controllers: [TipoContratoController],
  providers: [TipoContratoService],
})
export class TipoContratoModule { }
