import { PartialType } from '@nestjs/swagger';
import { CreateProgramacionMensualDto } from './create-programacion-mensual.dto';

export class UpdateProgramacionMensualDto extends PartialType(CreateProgramacionMensualDto) {}
