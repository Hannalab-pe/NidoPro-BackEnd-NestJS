import { ReporteProgramado } from "src/reporte-programador/entities/reporte-programado.entity";
import { Trabajador } from "src/trabajador/entities/trabajador.entity";
import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";

@Index("idx_historial_reporte_fecha", ["fechaEjecucion"], {})
@Index("historial_reporte_pkey", ["idHistorial"], { unique: true })
@Entity("historial_reporte", { schema: "public" })
export class HistorialReporte {
    @Column("uuid", {
        primary: true,
        name: "id_historial",
        default: () => "uuid_generate_v4()",
    })
    idHistorial: string;

    @Column("timestamp without time zone", {
        name: "fecha_ejecucion",
        nullable: true,
        default: () => "CURRENT_TIMESTAMP",
    })
    fechaEjecucion: Date | null;

    @Column("character varying", {
        name: "estado_ejecucion",
        length: 20,
        default: () => "'EXITOSO'",
    })
    estadoEjecucion: string;

    @Column("integer", { name: "tiempo_procesamiento", nullable: true })
    tiempoProcesamiento: number | null;

    @Column("bigint", { name: "tamaño_archivo", nullable: true })
    tamaOArchivo: string | null;

    @Column("text", { name: "ruta_archivo", nullable: true })
    rutaArchivo: string | null;

    @Column("json", { name: "parametros_utilizados", nullable: true })
    parametrosUtilizados: object | null;

    @Column("text", {
        name: "destinatarios_enviados",
        nullable: true,
        array: true,
    })
    destinatariosEnviados: string[] | null;

    @Column("text", { name: "errores_ejecucion", nullable: true })
    erroresEjecucion: string | null;

    @ManyToOne(() => Trabajador, (trabajador) => trabajador.historialReportes, {
        onDelete: "SET NULL",
    })
    @JoinColumn([{ name: "ejecutado_por", referencedColumnName: "idTrabajador" }])
    ejecutadoPor: Trabajador;

    @ManyToOne(
        () => ReporteProgramado,
        (reporteProgramado) => reporteProgramado.historialReportes,
        { onDelete: "CASCADE" }
    )
    @JoinColumn([
        { name: "id_reporte_programado", referencedColumnName: "idReporte" },
    ])
    idReporteProgramado: ReporteProgramado;
}
