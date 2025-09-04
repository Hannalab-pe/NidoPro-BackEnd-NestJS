import { Injectable } from '@nestjs/common';
import { CreateReporteProgramadorDto } from './dto/create-reporte-programador.dto';
import { UpdateReporteProgramadorDto } from './dto/update-reporte-programador.dto';

@Injectable()
export class ReporteProgramadorService {
  create(createReporteProgramadorDto: CreateReporteProgramadorDto) {
    return 'This action adds a new reporteProgramador';
  }

  findAll() {
    return `This action returns all reporteProgramador`;
  }

  findOne(id: number) {
    return `This action returns a #${id} reporteProgramador`;
  }

  update(id: number, updateReporteProgramadorDto: UpdateReporteProgramadorDto) {
    return `This action updates a #${id} reporteProgramador`;
  }

  remove(id: number) {
    return `This action removes a #${id} reporteProgramador`;
  }
}
