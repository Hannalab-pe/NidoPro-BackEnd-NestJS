import { Injectable } from '@nestjs/common';
import { CreateSaldoCajaDto } from './dto/create-saldo-caja.dto';
import { UpdateSaldoCajaDto } from './dto/update-saldo-caja.dto';

@Injectable()
export class SaldoCajaService {
  create(createSaldoCajaDto: CreateSaldoCajaDto) {
    return 'This action adds a new saldoCaja';
  }

  findAll() {
    return `This action returns all saldoCaja`;
  }

  findOne(id: number) {
    return `This action returns a #${id} saldoCaja`;
  }

  update(id: number, updateSaldoCajaDto: UpdateSaldoCajaDto) {
    return `This action updates a #${id} saldoCaja`;
  }

  remove(id: number) {
    return `This action removes a #${id} saldoCaja`;
  }
}
