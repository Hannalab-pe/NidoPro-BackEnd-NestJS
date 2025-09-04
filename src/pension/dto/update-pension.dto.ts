import { PartialType } from '@nestjs/mapped-types';
import { CreatePensionDto } from './create-pension.dto';

export class UpdatePensionDto extends PartialType(CreatePensionDto) {}
