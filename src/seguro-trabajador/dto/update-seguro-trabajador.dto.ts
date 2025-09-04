import { PartialType } from '@nestjs/swagger';
import { CreateSeguroTrabajadorDto } from './create-seguro-trabajador.dto';

export class UpdateSeguroTrabajadorDto extends PartialType(CreateSeguroTrabajadorDto) {}
