import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CajaSimpleService } from './caja-simple.service';
import { CajaSimpleController } from './caja-simple.controller';
import { CajaSimple } from './entities/caja-simple.entity';

@Module({
    imports: [TypeOrmModule.forFeature([CajaSimple])],
    controllers: [CajaSimpleController],
    providers: [CajaSimpleService],
    exports: [CajaSimpleService],
})
export class CajaSimpleModule { }
