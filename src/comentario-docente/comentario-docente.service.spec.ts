import { Test, TestingModule } from '@nestjs/testing';
import { ComentarioDocenteService } from './comentario-docente.service';

describe('ComentarioDocenteService', () => {
  let service: ComentarioDocenteService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ComentarioDocenteService],
    }).compile();

    service = module.get<ComentarioDocenteService>(ComentarioDocenteService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
