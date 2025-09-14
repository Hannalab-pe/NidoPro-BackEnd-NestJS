import { Test, TestingModule } from '@nestjs/testing';
import { ComentarioDocenteController } from './comentario-docente.controller';
import { ComentarioDocenteService } from './comentario-docente.service';

describe('ComentarioDocenteController', () => {
  let controller: ComentarioDocenteController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ComentarioDocenteController],
      providers: [ComentarioDocenteService],
    }).compile();

    controller = module.get<ComentarioDocenteController>(ComentarioDocenteController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
