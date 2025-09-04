import { Injectable } from '@nestjs/common';
import { CreateHistorialReporteDto } from './dto/create-historial-reporte.dto';
import { UpdateHistorialReporteDto } from './dto/update-historial-reporte.dto';

@Injectable()
export class HistorialReporteService {
  create(createHistorialReporteDto: CreateHistorialReporteDto) {
    return 'This action adds a new historialReporte';
  }

  findAll() {
    return `This action returns all historialReporte`;
  }

  findOne(id: number) {
    return `This action returns a #${id} historialReporte`;
  }

  update(id: number, updateHistorialReporteDto: UpdateHistorialReporteDto) {
    return `This action updates a #${id} historialReporte`;
  }

  remove(id: number) {
    return `This action removes a #${id} historialReporte`;
  }
}
