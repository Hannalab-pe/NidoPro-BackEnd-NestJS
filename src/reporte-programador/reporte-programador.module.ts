import { Module } from '@nestjs/common';
import { ReporteProgramadorService } from './reporte-programador.service';
import { ReporteProgramadorController } from './reporte-programador.controller';

@Module({
  controllers: [ReporteProgramadorController],
  providers: [ReporteProgramadorService],
})
export class ReporteProgramadorModule {}
