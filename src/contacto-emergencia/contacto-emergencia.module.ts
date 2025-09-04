import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContactoEmergenciaService } from './contacto-emergencia.service';
import { ContactoEmergenciaController } from './contacto-emergencia.controller';
import { ContactoEmergencia } from './entities/contacto-emergencia.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ContactoEmergencia])
  ],
  controllers: [ContactoEmergenciaController],
  providers: [ContactoEmergenciaService],
  exports: [ContactoEmergenciaService]
})
export class ContactoEmergenciaModule { }
