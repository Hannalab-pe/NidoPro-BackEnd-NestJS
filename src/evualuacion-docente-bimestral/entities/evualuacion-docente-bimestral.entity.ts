import { Bimestre } from "src/bimestre/entities/bimestre.entity";
import { Trabajador } from "src/trabajador/entities/trabajador.entity";
import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";

@Index(
    "idx_evaluacion_docente_info",
    ["calificacionFinal", "fechaEvaluacion", "puntajeTotal"],
    {}
)
@Index("uq_evaluacion_docente_bimestre", ["idBimestre", "idTrabajador"], {
    unique: true,
})
@Index("evaluacion_docente_bimestral_pkey", ["idEvaluacionDocente"], {
    unique: true,
})
@Entity("evaluacion_docente_bimestral", { schema: "public" })
export class EvaluacionDocenteBimestral {
    @Column("uuid", {
        primary: true,
        name: "id_evaluacion_docente",
        default: () => "uuid_generate_v4()",
    })
    idEvaluacionDocente: string;

    @Column("numeric", { name: "puntaje_planificacion", precision: 4, scale: 2 })
    puntajePlanificacion: string;

    @Column("numeric", { name: "puntaje_metodologia", precision: 4, scale: 2 })
    puntajeMetodologia: string;

    @Column("numeric", { name: "puntaje_puntualidad", precision: 4, scale: 2 })
    puntajePuntualidad: string;

    @Column("numeric", { name: "puntaje_creatividad", precision: 4, scale: 2 })
    puntajeCreatividad: string;

    @Column("numeric", { name: "puntaje_comunicacion", precision: 4, scale: 2 })
    puntajeComunicacion: string;

    @Column("numeric", { name: "puntaje_total", precision: 5, scale: 2 })
    puntajeTotal: string;

    @Column("character varying", { name: "calificacion_final", length: 2 })
    calificacionFinal: string;

    @Column("text", { name: "observaciones", nullable: true })
    observaciones: string | null;

    @Column("date", {
        name: "fecha_evaluacion",
        nullable: true,
        default: () => "CURRENT_DATE",
    })
    fechaEvaluacion: string | null;

    @Column("uuid", { name: "id_trabajador", unique: true })
    idTrabajador: string;

    @Column("uuid", { name: "id_bimestre", unique: true })
    idBimestre: string;

    @ManyToOne(
        () => Bimestre,
        (bimestre) => bimestre.evaluacionDocenteBimestrals,
        { onDelete: "CASCADE" }
    )
    @JoinColumn([{ name: "id_bimestre", referencedColumnName: "idBimestre" }])
    idBimestre2: Bimestre;

    @ManyToOne(
        () => Trabajador,
        (trabajador) => trabajador.evaluacionDocenteBimestrals,
        { onDelete: "RESTRICT" }
    )
    @JoinColumn([
        { name: "id_coordinador", referencedColumnName: "idTrabajador" },
    ])
    idCoordinador: Trabajador;

    @ManyToOne(
        () => Trabajador,
        (trabajador) => trabajador.evaluacionDocenteBimestrals2,
        { onDelete: "CASCADE" }
    )
    @JoinColumn([{ name: "id_trabajador", referencedColumnName: "idTrabajador" }])
    idTrabajador2: Trabajador;
}
