import { Module } from '@nestjs/common';
import { SaldoCajaService } from './saldo-caja.service';
import { SaldoCajaController } from './saldo-caja.controller';

@Module({
  controllers: [SaldoCajaController],
  providers: [SaldoCajaService],
})
export class SaldoCajaModule {}
