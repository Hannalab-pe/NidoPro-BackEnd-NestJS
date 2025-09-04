import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriaSimpleService } from './categoria-simple.service';
import { CategoriaSimpleController } from './categoria-simple.controller';
import { CategoriaSimple } from './entities/categoria-simple.entity';

@Module({
    imports: [TypeOrmModule.forFeature([CategoriaSimple])],
    controllers: [CategoriaSimpleController],
    providers: [CategoriaSimpleService],
    exports: [CategoriaSimpleService],
})
export class CategoriaSimpleModule { }
