import { PlanillaMensual } from "src/planilla-mensual/entities/planilla-mensual.entity";
import { Trabajador } from "src/trabajador/entities/trabajador.entity";
import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";

@Index("detalle_planilla_pkey", ["idDetallePlanilla"], { unique: true })
@Index("uq_planilla_trabajador", ["idPlanillaMensual", "idTrabajador"], {
    unique: true,
})
@Entity("detalle_planilla", { schema: "public" })
export class DetallePlanilla {
    @Column("uuid", {
        primary: true,
        name: "id_detalle_planilla",
        default: () => "uuid_generate_v4()",
    })
    idDetallePlanilla: string;

    @Column("uuid", { name: "id_planilla_mensual", unique: true })
    idPlanillaMensual: string;

    @Column("uuid", { name: "id_trabajador", unique: true })
    idTrabajador: string;

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

    @Column("numeric", { name: "total_ingresos", precision: 10, scale: 2 })
    totalIngresos: string;

    @Column("numeric", {
        name: "descuento_afp",
        nullable: true,
        precision: 8,
        scale: 2,
        default: () => "0.00",
    })
    descuentoAfp: string | null;

    @Column("numeric", {
        name: "descuento_essalud",
        nullable: true,
        precision: 8,
        scale: 2,
        default: () => "0.00",
    })
    descuentoEssalud: string | null;

    @Column("numeric", {
        name: "descuento_onp",
        nullable: true,
        precision: 8,
        scale: 2,
        default: () => "0.00",
    })
    descuentoOnp: string | null;

    @Column("numeric", {
        name: "otros_descuentos",
        nullable: true,
        precision: 8,
        scale: 2,
        default: () => "0.00",
    })
    otrosDescuentos: string | null;

    @Column("numeric", { name: "total_descuentos", precision: 10, scale: 2 })
    totalDescuentos: string;

    @Column("numeric", { name: "sueldo_neto", precision: 10, scale: 2 })
    sueldoNeto: string;

    @Column("integer", {
        name: "dias_trabajados",
        nullable: true,
        default: () => "30",
    })
    diasTrabajados: number | null;

    @Column("integer", {
        name: "dias_faltados",
        nullable: true,
        default: () => "0",
    })
    diasFaltados: number | null;

    @Column("character varying", {
        name: "estado_pago",
        length: 20,
        default: () => "'PENDIENTE'",
    })
    estadoPago: string;

    @Column("date", { name: "fecha_pago", nullable: true })
    fechaPago: string | null;

    @Column("numeric", {
        name: "cts_semestral",
        nullable: true,
        precision: 10,
        scale: 2,
        default: () => "0.00",
    })
    ctsSemestral: string | null;

    @Column("numeric", {
        name: "cts_mensual",
        nullable: true,
        precision: 10,
        scale: 2,
        default: () => "0.00",
    })
    ctsMensual: string | null;

    @Column("numeric", {
        name: "gratificacion",
        nullable: true,
        precision: 10,
        scale: 2,
        default: () => "0.00",
    })
    gratificacion: string | null;

    @Column("date", { name: "fecha_gratificacion_deposito", nullable: true })
    fechaGratificacionDeposito: string | null;

    @Column("date", { name: "fecha_cts_deposito", nullable: true })
    fechaCtsDeposito: string | null;

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

    @ManyToOne(
        () => PlanillaMensual,
        (planillaMensual) => planillaMensual.detallePlanillas,
        { onDelete: "CASCADE" }
    )
    @JoinColumn([
        { name: "id_planilla_mensual", referencedColumnName: "idPlanillaMensual" },
    ])
    idPlanillaMensual2: PlanillaMensual;

    @ManyToOne(() => Trabajador, (trabajador) => trabajador.detallePlanillas, {
        onDelete: "CASCADE",
    })
    @JoinColumn([{ name: "id_trabajador", referencedColumnName: "idTrabajador" }])
    idTrabajador2: Trabajador;
}
