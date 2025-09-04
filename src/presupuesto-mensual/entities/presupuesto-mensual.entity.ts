import { CategoriaGasto } from "src/categoria-gasto/entities/categoria-gasto.entity";
import { GastoOperativo } from "src/gasto-operativo/entities/gasto-operativo.entity";
import { Trabajador } from "src/trabajador/entities/trabajador.entity";
import {
    Column,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    OneToMany,
} from "typeorm";

@Index("uq_presupuesto_mes_categoria", ["anio", "idCategoriaGasto", "mes"], {
    unique: true,
})
@Index("presupuesto_mensual_pkey", ["idPresupuesto"], { unique: true })
@Entity("presupuesto_mensual", { schema: "public" })
export class PresupuestoMensual {
    @Column("uuid", {
        primary: true,
        name: "id_presupuesto",
        default: () => "uuid_generate_v4()",
    })
    idPresupuesto: string;

    @Column("integer", { name: "mes", unique: true })
    mes: number;

    @Column("integer", { name: "anio", unique: true })
    anio: number;

    @Column("uuid", { name: "id_categoria_gasto", unique: true })
    idCategoriaGasto: string;

    @Column("numeric", { name: "monto_presupuestado", precision: 10, scale: 2 })
    montoPresupuestado: string;

    @Column("numeric", {
        name: "monto_ejecutado",
        nullable: true,
        precision: 10,
        scale: 2,
        default: () => "0.00",
    })
    montoEjecutado: string | null;

    @Column("text", { name: "observaciones", nullable: true })
    observaciones: string | null;

    @Column("date", {
        name: "fecha_creacion",
        nullable: true,
        default: () => "CURRENT_DATE",
    })
    fechaCreacion: string | null;

    @Column("timestamp without time zone", {
        name: "creado_en",
        nullable: true,
        default: () => "CURRENT_TIMESTAMP",
    })
    creadoEn: Date | null;

    @Column("timestamp without time zone", {
        name: "actualizado_en",
        nullable: true,
        default: () => "CURRENT_TIMESTAMP",
    })
    actualizadoEn: Date | null;

    @OneToMany(
        () => GastoOperativo,
        (gastoOperativo) => gastoOperativo.idPresupuesto
    )
    gastoOperativos: GastoOperativo[];

    @ManyToOne(() => Trabajador, (trabajador) => trabajador.presupuestoMensuals, {
        onDelete: "RESTRICT",
    })
    @JoinColumn([{ name: "creado_por", referencedColumnName: "idTrabajador" }])
    creadoPor: Trabajador;

    @ManyToOne(
        () => CategoriaGasto,
        (categoriaGasto) => categoriaGasto.presupuestoMensuals,
        { onDelete: "RESTRICT" }
    )
    @JoinColumn([
        { name: "id_categoria_gasto", referencedColumnName: "idCategoriaGasto" },
    ])
    idCategoriaGasto2: CategoriaGasto;
}
