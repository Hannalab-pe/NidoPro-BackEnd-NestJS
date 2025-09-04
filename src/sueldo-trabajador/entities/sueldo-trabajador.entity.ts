import { Trabajador } from "src/trabajador/entities/trabajador.entity";
import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";

@Index(
    "idx_sueldo_trabajador_vigencia",
    ["estaActivo", "fechaVigenciaDesde", "fechaVigenciaHasta"],
    {}
)
@Index("sueldo_trabajador_pkey", ["idSueldoTrabajador"], { unique: true })
@Entity("sueldo_trabajador", { schema: "public" })
export class SueldoTrabajador {
    @Column("uuid", {
        primary: true,
        name: "id_sueldo_trabajador",
        default: () => "uuid_generate_v4()",
    })
    idSueldoTrabajador: string;

    @Column("numeric", { name: "sueldo_base", precision: 10, scale: 2 })
    sueldoBase: string;

    @Column("numeric", {
        name: "bonificacion_familiar",
        nullable: true,
        precision: 8,
        scale: 2,
        default: () => "0.00",
    })
    bonificacionFamiliar: string | null;

    @Column("numeric", {
        name: "asignacion_familiar",
        nullable: true,
        precision: 8,
        scale: 2,
        default: () => "0.00",
    })
    asignacionFamiliar: string | null;

    @Column("numeric", {
        name: "otros_ingresos",
        nullable: true,
        precision: 8,
        scale: 2,
        default: () => "0.00",
    })
    otrosIngresos: string | null;

    @Column("date", {
        name: "fecha_asignacion",
        nullable: true,
        default: () => "CURRENT_DATE",
    })
    fechaAsignacion: string | null;

    @Column("date", { name: "fecha_vigencia_desde" })
    fechaVigenciaDesde: string;

    @Column("date", { name: "fecha_vigencia_hasta", nullable: true })
    fechaVigenciaHasta: string | null;

    @Column("boolean", {
        name: "esta_activo",
        nullable: true,
        default: () => "true",
    })
    estaActivo: boolean | null;

    @Column("text", { name: "observaciones", nullable: true })
    observaciones: string | null;

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

    @ManyToOne(() => Trabajador, (trabajador) => trabajador.sueldoTrabajadors, {
        onDelete: "RESTRICT",
    })
    @JoinColumn([{ name: "creado_por", referencedColumnName: "idTrabajador" }])
    creadoPor: Trabajador;

    @ManyToOne(() => Trabajador, (trabajador) => trabajador.sueldoTrabajadors2, {
        onDelete: "CASCADE",
    })
    @JoinColumn([{ name: "id_trabajador", referencedColumnName: "idTrabajador" }])
    idTrabajador: Trabajador;
}
