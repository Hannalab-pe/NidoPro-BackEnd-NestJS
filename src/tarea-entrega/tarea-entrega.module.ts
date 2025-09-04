import { Module } from '@nestjs/common';
import { TareaEntregaService } from './tarea-entrega.service';
import { TareaEntregaController } from './tarea-entrega.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TareaEntrega } from './entities/tarea-entrega.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TareaEntrega])],
  controllers: [TareaEntregaController],
  providers: [TareaEntregaService],
  exports: [TareaEntregaService]
})
export class TareaEntregaModule {}
