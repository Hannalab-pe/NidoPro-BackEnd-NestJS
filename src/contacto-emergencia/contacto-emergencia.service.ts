import { Injectable } from '@nestjs/common';
import { CreateContactoEmergenciaDto } from './dto/create-contacto-emergencia.dto';
import { UpdateContactoEmergenciaDto } from './dto/update-contacto-emergencia.dto';

@Injectable()
export class ContactoEmergenciaService {
  create(createContactoEmergenciaDto: CreateContactoEmergenciaDto) {
    return 'This action adds a new contactoEmergencia';
  }

  findAll() {
    return `This action returns all contactoEmergencia`;
  }

  findOne(id: string) {
    return `This action returns a #${id} contactoEmergencia`;
  }

  update(id: string, updateContactoEmergenciaDto: UpdateContactoEmergenciaDto) {
    return `This action updates a #${id} contactoEmergencia`;
  }

  remove(id: string) {
    return `This action removes a #${id} contactoEmergencia`;
  }
}
