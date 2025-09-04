import { Entity, Column, PrimaryColumn, Index } from 'typeorm';

@Index("categoria_simple_codigo_idx", ["codigo"], { unique: true })
@Index("categoria_simple_pkey", ["idCategoria"], { unique: true })
@Entity("categoria_simple", { schema: "public" })
export class CategoriaSimple {
    @PrimaryColumn("uuid", {
        name: "id_categoria",
        default: () => "uuid_generate_v4()",
    })
    idCategoria: string;

    @Column("varchar", {
        name: "codigo",
        length: 10,
        unique: true
    })
    codigo: string;

    @Column("varchar", {
        name: "nombre",
        length: 100
    })
    nombre: string;

    @Column("varchar", {
        name: "tipo",
        length: 10,
        comment: "INGRESO, EGRESO o AMBOS"
    })
    tipo: string;

    @Column("text", {
        name: "descripcion",
        nullable: true
    })
    descripcion: string | null;

    @Column("boolean", {
        name: "es_frecuente",
        default: false,
        comment: "Para mostrar primero en UI"
    })
    esFrecuente: boolean;

    @Column("boolean", {
        name: "esta_activo",
        default: true
    })
    estaActivo: boolean;

    @Column("integer", {
        name: "orden_display",
        default: 0
    })
    ordenDisplay: number;
}
