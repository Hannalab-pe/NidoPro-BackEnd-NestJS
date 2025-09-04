import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoriaSimpleDto } from './create-categoria-simple.dto';

export class UpdateCategoriaSimpleDto extends PartialType(CreateCategoriaSimpleDto) { }
