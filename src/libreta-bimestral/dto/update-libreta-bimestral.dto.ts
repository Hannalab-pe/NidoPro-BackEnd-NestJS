import { PartialType } from '@nestjs/swagger';
import { CreateLibretaBimestralDto } from './create-libreta-bimestral.dto';

export class UpdateLibretaBimestralDto extends PartialType(CreateLibretaBimestralDto) {}
