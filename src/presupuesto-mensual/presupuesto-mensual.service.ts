import { Injectable } from '@nestjs/common';
import { CreatePresupuestoMensualDto } from './dto/create-presupuesto-mensual.dto';
import { UpdatePresupuestoMensualDto } from './dto/update-presupuesto-mensual.dto';

@Injectable()
export class PresupuestoMensualService {
  create(createPresupuestoMensualDto: CreatePresupuestoMensualDto) {
    return 'This action adds a new presupuestoMensual';
  }

  findAll() {
    return `This action returns all presupuestoMensual`;
  }

  findOne(id: number) {
    return `This action returns a #${id} presupuestoMensual`;
  }

  update(id: number, updatePresupuestoMensualDto: UpdatePresupuestoMensualDto) {
    return `This action updates a #${id} presupuestoMensual`;
  }

  remove(id: number) {
    return `This action removes a #${id} presupuestoMensual`;
  }
}
