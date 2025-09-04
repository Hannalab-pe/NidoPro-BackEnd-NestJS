import { GastoOperativo } from "src/gasto-operativo/entities/gasto-operativo.entity";
import { PresupuestoMensual } from "src/presupuesto-mensual/entities/presupuesto-mensual.entity";
import { Column, Entity, Index, OneToMany } from "typeorm";

@Index("categoria_gasto_pkey", ["idCategoriaGasto"], { unique: true })
@Index("categoria_gasto_nombre_key", ["nombreCategoria"], { unique: true })
@Entity("categoria_gasto", { schema: "public" })
export class CategoriaGasto {
    @Column("uuid", {
        primary: true,
        name: "id_categoria_gasto",
        default: () => "uuid_generate_v4()",
    })
    idCategoriaGasto: string;

    @Column("character varying", {
        name: "nombre_categoria",
        unique: true,
        length: 100,
    })
    nombreCategoria: string;

    @Column("text", { name: "descripcion", nullable: true })
    descripcion: string | null;

    @Column("character varying", { name: "codigo", nullable: true, length: 20 })
    codigo: string | null;

    @Column("boolean", {
        name: "esta_activo",
        nullable: true,
        default: () => "true",
    })
    estaActivo: boolean | null;

    @Column("boolean", {
        name: "es_presupuestable",
        nullable: true,
        default: () => "true",
    })
    esPresupuestable: boolean | null;

    @Column("timestamp without time zone", {
        name: "creado_en",
        nullable: true,
        default: () => "CURRENT_TIMESTAMP",
    })
    creadoEn: Date | null;

    @OneToMany(
        () => GastoOperativo,
        (gastoOperativo) => gastoOperativo.idCategoriaGasto
    )
    gastoOperativos: GastoOperativo[];

    @OneToMany(
        () => PresupuestoMensual,
        (presupuestoMensual) => presupuestoMensual.idCategoriaGasto2
    )
    presupuestoMensuals: PresupuestoMensual[];
}
