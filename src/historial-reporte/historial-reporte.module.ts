import { Module } from '@nestjs/common';
import { HistorialReporteService } from './historial-reporte.service';
import { HistorialReporteController } from './historial-reporte.controller';

@Module({
  controllers: [HistorialReporteController],
  providers: [HistorialReporteService],
})
export class HistorialReporteModule {}
