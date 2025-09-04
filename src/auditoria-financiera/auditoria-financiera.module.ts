import { Module } from '@nestjs/common';
import { AuditoriaFinancieraService } from './auditoria-financiera.service';
import { AuditoriaFinancieraController } from './auditoria-financiera.controller';

@Module({
  controllers: [AuditoriaFinancieraController],
  providers: [AuditoriaFinancieraService],
})
export class AuditoriaFinancieraModule {}
