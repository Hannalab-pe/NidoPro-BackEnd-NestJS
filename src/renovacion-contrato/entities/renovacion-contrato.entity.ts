import { ContratoTrabajador } from "src/contrato-trabajador/entities/contrato-trabajador.entity";
import { Trabajador } from "src/trabajador/entities/trabajador.entity";
import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";

@Index("idx_renovacion_fecha", ["fechaRenovacion"], {})
@Index("renovacion_contrato_pkey", ["idRenovacion"], { unique: true })
@Entity("renovacion_contrato", { schema: "public" })
export class RenovacionContrato {
    @Column("uuid", {
        primary: true,
        name: "id_renovacion",
        default: () => "uuid_generate_v4()",
    })
    idRenovacion: string;

    @Column("date", { name: "fecha_renovacion" })
    fechaRenovacion: string;

    @Column("text", { name: "motivo_renovacion", nullable: true })
    motivoRenovacion: string | null;

    @Column("text", { name: "cambios_realizados", nullable: true })
    cambiosRealizados: string | null;

    @Column("numeric", { name: "sueldo_anterior", precision: 10, scale: 2 })
    sueldoAnterior: string;

    @Column("numeric", { name: "sueldo_nuevo", precision: 10, scale: 2 })
    sueldoNuevo: string;

    @Column("integer", { name: "duracion_anterior_meses", nullable: true })
    duracionAnteriorMeses: number | null;

    @Column("integer", { name: "duracion_nueva_meses", nullable: true })
    duracionNuevaMeses: number | null;

    @Column("timestamp without time zone", {
        name: "fecha_aprobacion",
        nullable: true,
        default: () => "CURRENT_TIMESTAMP",
    })
    fechaAprobacion: Date | null;

    @Column("text", { name: "observaciones", nullable: true })
    observaciones: string | null;

    @Column("timestamp without time zone", {
        name: "creado_en",
        nullable: true,
        default: () => "CURRENT_TIMESTAMP",
    })
    creadoEn: Date | null;

    @ManyToOne(
        () => Trabajador,
        (trabajador) => trabajador.renovacionContratoes,
        { onDelete: "RESTRICT" }
    )
    @JoinColumn([{ name: "aprobado_por", referencedColumnName: "idTrabajador" }])
    aprobadoPor: Trabajador;

    @ManyToOne(
        () => ContratoTrabajador,
        (contratoTrabajador) => contratoTrabajador.renovacionContratoes,
        { onDelete: "CASCADE" }
    )
    @JoinColumn([
        { name: "id_contrato_anterior", referencedColumnName: "idContrato" },
    ])
    idContratoAnterior: ContratoTrabajador;

    @ManyToOne(
        () => ContratoTrabajador,
        (contratoTrabajador) => contratoTrabajador.renovacionContratoes2,
        { onDelete: "CASCADE" }
    )
    @JoinColumn([
        { name: "id_contrato_nuevo", referencedColumnName: "idContrato" },
    ])
    idContratoNuevo: ContratoTrabajador;
}
