import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    ParseUUIDPipe,
    UseGuards,
    HttpCode,
    HttpStatus,
    ParseBoolPipe,
} from '@nestjs/common';
import { CategoriaSimpleService } from './categoria-simple.service';
import { CreateCategoriaSimpleDto } from './dto/create-categoria-simple.dto';
import { UpdateCategoriaSimpleDto } from './dto/update-categoria-simple.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('categoria-simple')
@UseGuards(JwtAuthGuard)
export class CategoriaSimpleController {
    constructor(private readonly categoriaSimpleService: CategoriaSimpleService) { }

    @Post()
    create(@Body() createCategoriaSimpleDto: CreateCategoriaSimpleDto) {
        return this.categoriaSimpleService.create(createCategoriaSimpleDto);
    }

    @Post('initialize-defaults')
    @HttpCode(HttpStatus.OK)
    initializeDefaults() {
        return this.categoriaSimpleService.initializeDefaultCategories();
    }

    @Get()
    findAll(
        @Query('tipo') tipo?: string,
        @Query('activo', new ParseBoolPipe({ optional: true })) activo?: boolean,
        @Query('frecuente', new ParseBoolPipe({ optional: true })) frecuente?: boolean,
    ) {
        return this.categoriaSimpleService.findAll(tipo, activo, frecuente);
    }

    @Get('frecuentes')
    getFrecuentes(@Query('tipo') tipo?: string) {
        return this.categoriaSimpleService.getFrecuentes(tipo);
    }

    @Get('codigo/:codigo')
    findByCodigo(@Param('codigo') codigo: string) {
        return this.categoriaSimpleService.findByCodigo(codigo);
    }

    @Get(':id')
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.categoriaSimpleService.findOne(id);
    }

    @Patch(':id')
    update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateCategoriaSimpleDto: UpdateCategoriaSimpleDto,
    ) {
        return this.categoriaSimpleService.update(id, updateCategoriaSimpleDto);
    }

    @Patch(':id/toggle-activo')
    @HttpCode(HttpStatus.OK)
    toggleActivo(@Param('id', ParseUUIDPipe) id: string) {
        return this.categoriaSimpleService.toggleActivo(id);
    }

    @Patch(':id/toggle-frecuente')
    @HttpCode(HttpStatus.OK)
    toggleFrecuente(@Param('id', ParseUUIDPipe) id: string) {
        return this.categoriaSimpleService.toggleFrecuente(id);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(@Param('id', ParseUUIDPipe) id: string) {
        return this.categoriaSimpleService.remove(id);
    }
}
