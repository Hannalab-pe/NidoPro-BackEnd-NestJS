import { HistorialReporte } from "src/historial-reporte/entities/historial-reporte.entity";
import { Trabajador } from "src/trabajador/entities/trabajador.entity";
import {
    Column,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    OneToMany,
} from "typeorm";

@Index("reporte_programado_pkey", ["idReporte"], { unique: true })
@Entity("reporte_programado", { schema: "public" })
export class ReporteProgramado {
    @Column("uuid", {
        primary: true,
        name: "id_reporte",
        default: () => "uuid_generate_v4()",
    })
    idReporte: string;

    @Column("character varying", { name: "nombre_reporte", length: 200 })
    nombreReporte: string;

    @Column("character varying", { name: "tipo_reporte", length: 50 })
    tipoReporte: string;

    @Column("text", { name: "descripcion", nullable: true })
    descripcion: string | null;

    @Column("character varying", { name: "frecuencia", length: 20 })
    frecuencia: string;

    @Column("json", { name: "parametros_reporte", nullable: true })
    parametrosReporte: object | null;

    @Column("text", { name: "destinatarios", array: true })
    destinatarios: string[];

    @Column("character varying", {
        name: "formato_salida",
        length: 10,
        default: () => "'PDF'",
    })
    formatoSalida: string;

    @Column("boolean", {
        name: "esta_activo",
        nullable: true,
        default: () => "true",
    })
    estaActivo: boolean | null;

    @Column("timestamp without time zone", {
        name: "proxima_ejecucion",
        nullable: true,
    })
    proximaEjecucion: Date | null;

    @Column("timestamp without time zone", {
        name: "ultima_ejecucion",
        nullable: true,
    })
    ultimaEjecucion: Date | null;

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
        () => HistorialReporte,
        (historialReporte) => historialReporte.idReporteProgramado
    )
    historialReportes: HistorialReporte[];

    @ManyToOne(() => Trabajador, (trabajador) => trabajador.reporteProgramados, {
        onDelete: "RESTRICT",
    })
    @JoinColumn([{ name: "creado_por", referencedColumnName: "idTrabajador" }])
    creadoPor: Trabajador;
}
