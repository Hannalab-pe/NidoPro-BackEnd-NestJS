import { Estudiante } from "src/estudiante/entities/estudiante.entity";
import { Trabajador } from "src/trabajador/entities/trabajador.entity";
import {
    Column,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
} from "typeorm";

@Index("idx_pension_estudiante_periodo", ["anio", "estadoPension", "mes"], {})
@Index("uq_pension_estudiante_mes", ["anio", "idEstudiante", "mes"], {
    unique: true,
})
@Index(
    "idx_pension_estudiante_estado",
    ["estadoPension", "fechaVencimiento"],
    {}
)
@Index("pension_estudiante_pkey", ["idPensionEstudiante"], { unique: true })
@Entity("pension_estudiante", { schema: "public" })
export class PensionEstudiante {
    @Column("uuid", {
        primary: true,
        name: "id_pension_estudiante",
        default: () => "uuid_generate_v4()",
    })
    idPensionEstudiante: string;

    @Column("uuid", { name: "id_estudiante" })
    idEstudiante: string;

    @Column("integer", { name: "mes" })
    mes: number;

    @Column("integer", { name: "anio" })
    anio: number;

    @Column("numeric", { name: "monto_pension", precision: 8, scale: 2 })
    montoPension: string;

    @Column("date", { name: "fecha_vencimiento" })
    fechaVencimiento: string;

    @Column("date", { name: "fecha_pago", nullable: true })
    fechaPago: string | null;

    @Column("numeric", {
        name: "monto_pagado",
        nullable: true,
        precision: 8,
        scale: 2,
        default: () => "0.00",
    })
    montoPagado: string | null;

    @Column("numeric", {
        name: "monto_mora",
        nullable: true,
        precision: 6,
        scale: 2,
        default: () => "0.00",
    })
    montoMora: string | null;

    @Column("numeric", {
        name: "monto_descuento",
        nullable: true,
        precision: 6,
        scale: 2,
        default: () => "0.00",
    })
    montoDescuento: string | null;

    @Column("numeric", { name: "monto_total", precision: 8, scale: 2 })
    montoTotal: string;

    @Column("character varying", {
        name: "estado_pension",
        length: 20,
        default: () => "'PENDIENTE'",
    })
    estadoPension: string;

    @Column("integer", { name: "dias_mora", nullable: true, default: () => "0" })
    diasMora: number | null;

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

    @Column("text", { name: "observaciones", nullable: true })
    observaciones: string | null;

    @Column("date", {
        name: "fecha_registro",
        nullable: true,
        default: () => "CURRENT_DATE",
    })
    fechaRegistro: string | null;

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

    @ManyToOne(() => Estudiante, (estudiante) => estudiante.pensionEstudiantes, {
        onDelete: "CASCADE",
    })
    @JoinColumn([{ name: "id_estudiante", referencedColumnName: "idEstudiante" }])
    estudiante: Estudiante;

    @ManyToOne(() => Trabajador, (trabajador) => trabajador.pensionEstudiantes, {
        onDelete: "RESTRICT",
    })
    @JoinColumn([
        { name: "registrado_por", referencedColumnName: "idTrabajador" },
    ])
    registradoPor: Trabajador;

}
