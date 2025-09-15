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
  async findAll() {
    return await this.cursoGradoService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.cursoGradoService.findOne(+id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateCursoGradoDto: UpdateCursoGradoDto) {
    return await this.cursoGradoService.update(+id, updateCursoGradoDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.cursoGradoService.remove(+id);
  }
}
