import { Trabajador } from "src/trabajador/entities/trabajador.entity";
import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";

@Index("idx_caja_tipo_categoria", ["categoria", "estado", "tipoMovimiento"], {})
@Index("idx_caja_fecha", ["fechaMovimiento", "horaMovimiento"], {})
@Index("caja_pkey", ["idCaja"], { unique: true })
@Entity("caja", { schema: "public" })
export class Caja {
    @Column("uuid", {
        primary: true,
        name: "id_caja",
        default: () => "uuid_generate_v4()",
    })
    idCaja: string;

    @Column("date", { name: "fecha_movimiento", default: () => "CURRENT_DATE" })
    fechaMovimiento: string;

    @Column("time without time zone", {
        name: "hora_movimiento",
        default: () => "CURRENT_TIME",
    })
    horaMovimiento: string;

    @Column("character varying", { name: "tipo_movimiento", length: 20 })
    tipoMovimiento: string;

    @Column("character varying", { name: "categoria", length: 50 })
    categoria: string;

    @Column("character varying", {
        name: "subcategoria",
        nullable: true,
        length: 100,
    })
    subcategoria: string | null;

    @Column("character varying", { name: "concepto", length: 200 })
    concepto: string;

    @Column("text", { name: "descripcion", nullable: true })
    descripcion: string | null;

    @Column("numeric", { name: "monto", precision: 12, scale: 2 })
    monto: string;

    @Column("character varying", {
        name: "metodo_pago",
        nullable: true,
        length: 50,
    })
    metodoPago: string | null;

    @Column("character varying", {
        name: "numero_comprobante",
        nullable: true,
        length: 50,
    })
    numeroComprobante: string | null;

    @Column("text", { name: "comprobante_url", nullable: true })
    comprobanteUrl: string | null;

    @Column("character varying", {
        name: "estado",
        length: 20,
        default: () => "'CONFIRMADO'",
    })
    estado: string;

    @Column("uuid", { name: "id_relacionado", nullable: true })
    idRelacionado: string | null;

    @Column("character varying", {
        name: "tabla_relacionada",
        nullable: true,
        length: 50,
    })
    tablaRelacionada: string | null;

    @Column("timestamp without time zone", {
        name: "creado_en",
        nullable: true,
        default: () => "CURRENT_TIMESTAMP",
    })
    creadoEn: Date | null;

    @ManyToOne(() => Trabajador, (trabajador) => trabajador.cajas, {
        onDelete: "RESTRICT",
    })
    @JoinColumn([
        { name: "id_trabajador_responsable", referencedColumnName: "idTrabajador" },
    ])
    idTrabajadorResponsable: Trabajador;
}
