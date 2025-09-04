import { Injectable } from '@nestjs/common';
import { CreateAuditoriaFinancieraDto } from './dto/create-auditoria-financiera.dto';
import { UpdateAuditoriaFinancieraDto } from './dto/update-auditoria-financiera.dto';

@Injectable()
export class AuditoriaFinancieraService {
  create(createAuditoriaFinancieraDto: CreateAuditoriaFinancieraDto) {
    return 'This action adds a new auditoriaFinanciera';
  }

  findAll() {
    return `This action returns all auditoriaFinanciera`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auditoriaFinanciera`;
  }

  update(id: number, updateAuditoriaFinancieraDto: UpdateAuditoriaFinancieraDto) {
    return `This action updates a #${id} auditoriaFinanciera`;
  }

  remove(id: number) {
    return `This action removes a #${id} auditoriaFinanciera`;
  }
}
