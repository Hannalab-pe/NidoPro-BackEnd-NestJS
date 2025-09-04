import { PartialType } from '@nestjs/swagger';
import { CreateContactoEmergenciaDto } from './create-contacto-emergencia.dto';

export class UpdateContactoEmergenciaDto extends PartialType(CreateContactoEmergenciaDto) {}
