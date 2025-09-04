import { PartialType } from '@nestjs/swagger';
import { CreateSueldoTrabajadorDto } from './create-sueldo-trabajador.dto';

export class UpdateSueldoTrabajadorDto extends PartialType(CreateSueldoTrabajadorDto) {}
