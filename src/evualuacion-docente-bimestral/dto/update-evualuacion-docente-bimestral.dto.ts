import { PartialType } from '@nestjs/swagger';
import { CreateEvualuacionDocenteBimestralDto } from './create-evualuacion-docente-bimestral.dto';

export class UpdateEvualuacionDocenteBimestralDto extends PartialType(CreateEvualuacionDocenteBimestralDto) {}
