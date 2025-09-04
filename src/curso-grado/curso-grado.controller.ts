import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CursoGradoService } from './curso-grado.service';
import { CreateCursoGradoDto } from './dto/create-curso-grado.dto';
import { UpdateCursoGradoDto } from './dto/update-curso-grado.dto';

@Controller('curso-grado')
export class CursoGradoController {
  constructor(private readonly cursoGradoService: CursoGradoService) { }

  @Post()
  async create(@Body() createCursoGradoDto: CreateCursoGradoDto) {
    const cursogradoCreate = await this.cursoGradoService.create(createCursoGradoDto);
    return {
      success: true,
      message: "curso asignado correctamente",
      data: cursogradoCreate
    }
  }

  @Get()
  findAll() {
    return this.cursoGradoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cursoGradoService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCursoGradoDto: UpdateCursoGradoDto) {
    return this.cursoGradoService.update(+id, updateCursoGradoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cursoGradoService.remove(+id);
  }
}
