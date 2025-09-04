import { HistorialContrato } from "src/historial-contrato/entities/historial-contrato.entity";
import { RenovacionContrato } from "src/renovacion-contrato/entities/renovacion-contrato.entity";
import { TipoContrato } from "src/tipo-contrato/entities/tipo-contrato.entity";
import { Trabajador } from "src/trabajador/entities/trabajador.entity";
import {
    Column,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    OneToMany,
} from "typeorm";

@Index(
    "idx_contrato_trabajador_activo",
    ["estadoContrato", "fechaInicio", "idTrabajador"],
    {}
)
@Index(
    "idx_contrato_periodo_prueba",
    ["estadoContrato", "fechaFinPeriodoPrueba"],
    {}
)
@Index("idx_contrato_vencimiento", ["estadoContrato", "fechaFin"], {})
@Index("contrato_trabajador_pkey", ["idContrato"], { unique: true })
@Index("contrato_numero_key", ["numeroContrato"], { unique: true })
@Entity("contrato_trabajador", { schema: "public" })
export class ContratoTrabajador {
    @Column("uuid", {
        primary: true,
        name: "id_contrato",
        default: () => "uuid_generate_v4()",
    })
    idContrato: string;

    @Column("uuid", { name: "id_trabajador" })
    idTrabajador: string;

    @Column("character varying", {
        name: "numero_contrato",
        unique: true,
        length: 50,
    })
    numeroContrato: string;

    @Column("date", { name: "fecha_inicio" })
    fechaInicio: string;

    @Column("date", { name: "fecha_fin", nullable: true })
    fechaFin: string | null;

    @Column("date", { name: "fecha_fin_periodo_prueba", nullable: true })
    fechaFinPeriodoPrueba: string | null;

    @Column("numeric", { name: "sueldo_contratado", precision: 10, scale: 2 })
    sueldoContratado: string;

    @Column("character varying", {
        name: "jornada_laboral",
        length: 20,
        default: () => "'COMPLETA'",
    })
    jornadaLaboral: string;

    @Column("integer", {
        name: "horas_semanales",
        nullable: true,
        default: () => "40",
    })
    horasSemanales: number | null;

    @Column("character varying", { name: "cargo_contrato", length: 100 })
    cargoContrato: string;

    @Column("text", { name: "descripcion_funciones", nullable: true })
    descripcionFunciones: string | null;

    @Column("character varying", { name: "lugar_trabajo", length: 200 })
    lugarTrabajo: string;

    @Column("character varying", {
        name: "estado_contrato",
        length: 30,
        default: () => "'ACTIVO'",
    })
    estadoContrato: string;

    @Column("character varying", {
        name: "motivo_finalizacion",
        nullable: true,
        length: 100,
    })
    motivoFinalizacion: string | null;

    @Column("date", { name: "fecha_finalizacion_real", nullable: true })
    fechaFinalizacionReal: string | null;

    @Column("text", { name: "observaciones_contrato", nullable: true })
    observacionesContrato: string | null;

    @Column("text", { name: "archivo_contrato_url", nullable: true })
    archivoContratoUrl: string | null;

    @Column("text", { name: "archivo_firmado_url", nullable: true })
    archivoFirmadoUrl: string | null;

    @Column("boolean", {
        name: "renovacion_automatica",
        nullable: true,
        default: () => "false",
    })
    renovacionAutomatica: boolean | null;

    @Column("integer", {
        name: "dias_aviso_renovacion",
        nullable: true,
        default: () => "30",
    })
    diasAvisoRenovacion: number | null;

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


    @ManyToOne(() => Trabajador, (trabajador) => trabajador.contratoTrabajadors, {
        onDelete: "RESTRICT",
    })
    @JoinColumn([{ name: "aprobado_por", referencedColumnName: "idTrabajador" }])
    aprobadoPor: Trabajador;

    @ManyToOne(
        () => Trabajador,
        (trabajador) => trabajador.contratoTrabajadors2,
        { onDelete: "RESTRICT" }
    )
    @JoinColumn([{ name: "creado_por", referencedColumnName: "idTrabajador" }])
    creadoPor: Trabajador;

    @ManyToOne(
        () => TipoContrato,
        (tipoContrato) => tipoContrato.contratoTrabajadors,
        { onDelete: "RESTRICT" }
    )
    @JoinColumn([
        { name: "id_tipo_contrato", referencedColumnName: "idTipoContrato" },
    ])
    idTipoContrato: TipoContrato;

    @ManyToOne(
        () => Trabajador,
        (trabajador) => trabajador.contratoTrabajadors3,
        { onDelete: "CASCADE" }
    )
    @JoinColumn([{ name: "id_trabajador", referencedColumnName: "idTrabajador" }])
    idTrabajador2: Trabajador;

    @OneToMany(
        () => HistorialContrato,
        (historialContrato) => historialContrato.idContrato
    )
    historialContratoes: HistorialContrato[];

    @OneToMany(
        () => RenovacionContrato,
        (renovacionContrato) => renovacionContrato.idContratoAnterior
    )
    renovacionContratoes: RenovacionContrato[];

    @OneToMany(
        () => RenovacionContrato,
        (renovacionContrato) => renovacionContrato.idContratoNuevo
    )
    renovacionContratoes2: RenovacionContrato[];
}
