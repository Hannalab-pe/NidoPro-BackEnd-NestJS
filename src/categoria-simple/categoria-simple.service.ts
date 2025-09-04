import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoriaSimple } from './entities/categoria-simple.entity';
import { CreateCategoriaSimpleDto } from './dto/create-categoria-simple.dto';
import { UpdateCategoriaSimpleDto } from './dto/update-categoria-simple.dto';

@Injectable()
export class CategoriaSimpleService {
    constructor(
        @InjectRepository(CategoriaSimple)
        private categoriaSimpleRepository: Repository<CategoriaSimple>,
    ) { }

    async create(createCategoriaSimpleDto: CreateCategoriaSimpleDto): Promise<CategoriaSimple> {
        // Verificar que el código no exista
        const existingCategoria = await this.categoriaSimpleRepository.findOne({
            where: { codigo: createCategoriaSimpleDto.codigo },
        });

        if (existingCategoria) {
            throw new ConflictException(`Ya existe una categoría con el código ${createCategoriaSimpleDto.codigo}`);
        }

        const categoria = this.categoriaSimpleRepository.create(createCategoriaSimpleDto);
        return await this.categoriaSimpleRepository.save(categoria);
    }

    async findAll(
        tipo?: string,
        activo?: boolean,
        frecuente?: boolean,
    ): Promise<CategoriaSimple[]> {
        const query = this.categoriaSimpleRepository.createQueryBuilder('categoria');

        if (tipo) {
            query.andWhere('(categoria.tipo = :tipo OR categoria.tipo = :ambos)', {
                tipo,
                ambos: 'AMBOS'
            });
        }

        if (activo !== undefined) {
            query.andWhere('categoria.estaActivo = :activo', { activo });
        }

        if (frecuente !== undefined) {
            query.andWhere('categoria.esFrecuente = :frecuente', { frecuente });
        }

        // Ordenar por orden de display y luego por nombre
        query.orderBy('categoria.ordenDisplay', 'ASC')
            .addOrderBy('categoria.nombre', 'ASC');

        return await query.getMany();
    }

    async findOne(id: string): Promise<CategoriaSimple> {
        const categoria = await this.categoriaSimpleRepository.findOne({
            where: { idCategoria: id },
        });

        if (!categoria) {
            throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
        }

        return categoria;
    }

    async findByCodigo(codigo: string): Promise<CategoriaSimple> {
        const categoria = await this.categoriaSimpleRepository.findOne({
            where: { codigo },
        });

        if (!categoria) {
            throw new NotFoundException(`Categoría con código ${codigo} no encontrada`);
        }

        return categoria;
    }

    async update(id: string, updateCategoriaSimpleDto: UpdateCategoriaSimpleDto): Promise<CategoriaSimple> {
        const categoria = await this.findOne(id);

        // Si se está actualizando el código, verificar que no exista
        if (updateCategoriaSimpleDto.codigo && updateCategoriaSimpleDto.codigo !== categoria.codigo) {
            const existingCategoria = await this.categoriaSimpleRepository.findOne({
                where: { codigo: updateCategoriaSimpleDto.codigo },
            });

            if (existingCategoria) {
                throw new ConflictException(`Ya existe una categoría con el código ${updateCategoriaSimpleDto.codigo}`);
            }
        }

        Object.assign(categoria, updateCategoriaSimpleDto);
        return await this.categoriaSimpleRepository.save(categoria);
    }

    async remove(id: string): Promise<void> {
        const categoria = await this.findOne(id);
        await this.categoriaSimpleRepository.remove(categoria);
    }

    async toggleActivo(id: string): Promise<CategoriaSimple> {
        const categoria = await this.findOne(id);
        categoria.estaActivo = !categoria.estaActivo;
        return await this.categoriaSimpleRepository.save(categoria);
    }

    async toggleFrecuente(id: string): Promise<CategoriaSimple> {
        const categoria = await this.findOne(id);
        categoria.esFrecuente = !categoria.esFrecuente;
        return await this.categoriaSimpleRepository.save(categoria);
    }

    // Método para obtener categorías frecuentes (para UI)
    async getFrecuentes(tipo?: string): Promise<CategoriaSimple[]> {
        return this.findAll(tipo, true, true);
    }

    // Método para inicializar categorías por defecto
    async initializeDefaultCategories(): Promise<void> {
        const defaultCategories = [
            // Ingresos
            { codigo: 'ING001', nombre: 'Matrícula', tipo: 'INGRESO', esFrecuente: true, ordenDisplay: 1 },
            { codigo: 'ING002', nombre: 'Pensión Mensual', tipo: 'INGRESO', esFrecuente: true, ordenDisplay: 2 },
            { codigo: 'ING003', nombre: 'Cuota de Ingreso', tipo: 'INGRESO', esFrecuente: false, ordenDisplay: 3 },
            { codigo: 'ING004', nombre: 'Actividades Extracurriculares', tipo: 'INGRESO', esFrecuente: false, ordenDisplay: 4 },
            { codigo: 'ING005', nombre: 'Otros Ingresos', tipo: 'INGRESO', esFrecuente: false, ordenDisplay: 10 },

            // Egresos
            { codigo: 'EGR001', nombre: 'Sueldos y Salarios', tipo: 'EGRESO', esFrecuente: true, ordenDisplay: 1 },
            { codigo: 'EGR002', nombre: 'Servicios Básicos', tipo: 'EGRESO', esFrecuente: true, ordenDisplay: 2 },
            { codigo: 'EGR003', nombre: 'Material Didáctico', tipo: 'EGRESO', esFrecuente: false, ordenDisplay: 3 },
            { codigo: 'EGR004', nombre: 'Mantenimiento', tipo: 'EGRESO', esFrecuente: false, ordenDisplay: 4 },
            { codigo: 'EGR005', nombre: 'Alimentación', tipo: 'EGRESO', esFrecuente: true, ordenDisplay: 5 },
            { codigo: 'EGR006', nombre: 'Gastos Administrativos', tipo: 'EGRESO', esFrecuente: false, ordenDisplay: 6 },
            { codigo: 'EGR007', nombre: 'Otros Gastos', tipo: 'EGRESO', esFrecuente: false, ordenDisplay: 10 },
        ];

        for (const categoryData of defaultCategories) {
            const exists = await this.categoriaSimpleRepository.findOne({
                where: { codigo: categoryData.codigo },
            });

            if (!exists) {
                const categoria = this.categoriaSimpleRepository.create(categoryData);
                await this.categoriaSimpleRepository.save(categoria);
            }
        }
    }
}
