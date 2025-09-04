import { CategoriaGasto } from "src/categoria-gasto/entities/categoria-gasto.entity";
import { PresupuestoMensual } from "src/presupuesto-mensual/entities/presupuesto-mensual.entity";
import { Trabajador } from "src/trabajador/entities/trabajador.entity";
import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";

@Index("gasto_operativo_pkey", ["idGasto"], { unique: true })
@Entity("gasto_operativo", { schema: "public" })
export class GastoOperativo {
    @Column("uuid", {
        primary: true,
        name: "id_gasto",
        default: () => "uuid_generate_v4()",
    })
    idGasto: string;

    @Column("date", { name: "fecha_gasto", default: () => "CURRENT_DATE" })
    fechaGasto: string;

    @Column("character varying", { name: "concepto", length: 200 })
    concepto: string;

    @Column("text", { name: "descripcion" })
    descripcion: string;

    @Column("integer", { name: "cantidad", nullable: true, default: () => "1" })
    cantidad: number | null;

    @Column("numeric", { name: "precio_unitario", precision: 8, scale: 2 })
    precioUnitario: string;

    @Column("numeric", { name: "monto_total", precision: 10, scale: 2 })
    montoTotal: string;

    @Column("character varying", {
        name: "proveedor",
        nullable: true,
        length: 200,
    })
    proveedor: string | null;

    @Column("character varying", {
        name: "numero_factura",
        nullable: true,
        length: 50,
    })
    numeroFactura: string | null;

    @Column("text", { name: "factura_url", nullable: true })
    facturaUrl: string | null;

    @Column("character varying", {
        name: "metodo_pago",
        nullable: true,
        length: 50,
    })
    metodoPago: string | null;

    @Column("character varying", {
        name: "estado",
        length: 20,
        default: () => "'PENDIENTE'",
    })
    estado: string;

    @Column("boolean", {
        name: "requiere_aprobacion",
        nullable: true,
        default: () => "true",
    })
    requiereAprobacion: boolean | null;

    @Column("date", { name: "fecha_aprobacion", nullable: true })
    fechaAprobacion: string | null;

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

    @ManyToOne(() => Trabajador, (trabajador) => trabajador.gastoOperativos, {
        onDelete: "RESTRICT",
    })
    @JoinColumn([{ name: "aprobado_por", referencedColumnName: "idTrabajador" }])
    aprobadoPor: Trabajador;

    @ManyToOne(
        () => CategoriaGasto,
        (categoriaGasto) => categoriaGasto.gastoOperativos,
        { onDelete: "RESTRICT" }
    )
    @JoinColumn([
        { name: "id_categoria_gasto", referencedColumnName: "idCategoriaGasto" },
    ])
    idCategoriaGasto: CategoriaGasto;

    @ManyToOne(
        () => PresupuestoMensual,
        (presupuestoMensual) => presupuestoMensual.gastoOperativos,
        { onDelete: "SET NULL" }
    )
    @JoinColumn([
        { name: "id_presupuesto", referencedColumnName: "idPresupuesto" },
    ])
    idPresupuesto: PresupuestoMensual;

    @ManyToOne(() => Trabajador, (trabajador) => trabajador.gastoOperativos2, {
        onDelete: "RESTRICT",
    })
    @JoinColumn([
        { name: "solicitado_por", referencedColumnName: "idTrabajador" },
    ])
    solicitadoPor: Trabajador;
}
