import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CronogramaService } from './cronograma.service';
import { CreateCronogramaDto } from './dto/create-cronograma.dto';
import { UpdateCronogramaDto } from './dto/update-cronograma.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Cronograma')
@Controller('cronograma')
export class CronogramaController {
  constructor(private readonly cronogramaService: CronogramaService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo cronograma de actividades' })
  async create(@Body() createCronogramaDto: CreateCronogramaDto) {
    const data = await this.cronogramaService.create(createCronogramaDto);
    return {
      success: true,
      message: 'Cronograma Registrado Correctamente',
      info: {
        data,
      },
    };
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los cronogramas registrados' })
  async findAll() {
    const data = await this.cronogramaService.findAll();
    return {
      success: true,
      message: 'Cronogramas Listados Correctamente',
      info: {
        data,
      },
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un cronograma específico por ID' })
  async findOne(@Param('id') id: string) {
    const data = await this.cronogramaService.findOne(id);
    return {
      success: true,
      message: 'Cronograma Encontrado Correctamente',
      info: {
        data,
      },
    };
  }

  @Get('aula/:idAula')
  @ApiOperation({
    summary:
      'Cronograma por Aula - Obtener todas las actividades del cronograma de un aula específica',
  })
  async findCronogramaPorAula(@Param('idAula') idAula: string) {
    return this.cronogramaService.findCronogramaPorAula(idAula);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un cronograma existente' })
  async update(
    @Param('id') id: string,
    @Body() updateCronogramaDto: UpdateCronogramaDto,
  ) {
    const data = await this.cronogramaService.update(id, updateCronogramaDto);
    return {
      success: true,
      message: `Cronograma Actualizado Correctamente con el ID ${id}`,
      info: {
        data,
      },
    };
  }
}
