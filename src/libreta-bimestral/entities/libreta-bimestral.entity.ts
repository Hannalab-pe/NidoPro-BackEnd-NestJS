import { Aula } from "src/aula/entities/aula.entity";
import { Bimestre } from "src/bimestre/entities/bimestre.entity";
import { Estudiante } from "src/estudiante/entities/estudiante.entity";
import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";

@Index(
    "idx_libreta_bimestral_info",
    ["calificacionFinal", "fechaGeneracion", "promedioFinal"],
    {}
)
@Index("uq_libreta_estudiante_bimestre", ["idBimestre", "idEstudiante"], {
    unique: true,
})
@Index("libreta_bimestral_pkey", ["idLibretaBimestral"], { unique: true })
@Entity("libreta_bimestral", { schema: "public" })
export class LibretaBimestral {
    @Column("uuid", {
        primary: true,
        name: "id_libreta_bimestral",
        default: () => "uuid_generate_v4()",
    })
    idLibretaBimestral: string;

    @Column("numeric", {
        name: "promedio_tareas",
        nullable: true,
        precision: 4,
        scale: 2,
        default: () => "0",
    })
    promedioTareas: string | null;

    @Column("numeric", {
        name: "promedio_evaluaciones",
        nullable: true,
        precision: 4,
        scale: 2,
        default: () => "0",
    })
    promedioEvaluaciones: string | null;

    @Column("numeric", { name: "promedio_final", precision: 4, scale: 2 })
    promedioFinal: string;

    @Column("character varying", { name: "calificacion_final", length: 2 })
    calificacionFinal: string;

    @Column("character varying", {
        name: "conducta",
        nullable: true,
        length: 2,
        default: () => "'A'",
    })
    conducta: string | null;

    @Column("text", { name: "observaciones_conducta", nullable: true })
    observacionesConducta: string | null;

    @Column("text", { name: "observaciones_academicas", nullable: true })
    observacionesAcademicas: string | null;

    @Column("date", {
        name: "fecha_generacion",
        nullable: true,
        default: () => "CURRENT_DATE",
    })
    fechaGeneracion: string | null;

    @Column("uuid", { name: "id_estudiante", unique: true })
    idEstudiante: string;

    @Column("uuid", { name: "id_bimestre", unique: true })
    idBimestre: string;

    @ManyToOne(() => Aula, (aula) => aula.libretaBimestrals, {
        onDelete: "CASCADE",
    })
    @JoinColumn([{ name: "id_aula", referencedColumnName: "idAula" }])
    idAula: Aula;

    @ManyToOne(() => Bimestre, (bimestre) => bimestre.libretaBimestrals, {
        onDelete: "CASCADE",
    })
    @JoinColumn([{ name: "id_bimestre", referencedColumnName: "idBimestre" }])
    idBimestre2: Bimestre;

    @ManyToOne(() => Estudiante, (estudiante) => estudiante.libretaBimestrals, {
        onDelete: "CASCADE",
    })
    @JoinColumn([{ name: "id_estudiante", referencedColumnName: "idEstudiante" }])
    idEstudiante2: Estudiante;
}
