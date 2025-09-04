import { Bimestre } from "src/bimestre/entities/bimestre.entity";
import { Estudiante } from "src/estudiante/entities/estudiante.entity";
import { Evaluacion } from "src/evaluacion/entities/evaluacion.entity";
import { Tarea } from "src/tarea/entities/tarea.entity";
import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";

@Index("idx_nota_puntaje", ["estaAprobado", "puntaje"], {})
@Index(
    "nota_id_evaluacion_id_estudiante_key",
    ["idEstudiante", "idEvaluacion"],
    { unique: true }
)
@Index("nota_pkey", ["idNota"], { unique: true })
@Entity("nota", { schema: "public" })
export class Nota {
    @Column("uuid", {
        primary: true,
        name: "id_nota",
        default: () => "uuid_generate_v4()",
    })
    idNota: string;

    @Column("numeric", { name: "puntaje", precision: 4, scale: 2 })
    puntaje: string;

    @Column("boolean", {
        name: "esta_aprobado",
        nullable: true,
        default: () => "false",
    })
    estaAprobado: boolean | null;

    @Column("text", { name: "observaciones", nullable: true })
    observaciones: string | null;

    @Column("uuid", { name: "id_evaluacion", nullable: true })
    idEvaluacion: string | null;

    @Column("uuid", { name: "id_estudiante" })
    idEstudiante: string;

    @Column("uuid", { name: "id_tarea", nullable: true })
    idTareaColumn: string | null;

    @Column("uuid", { name: "id_bimestre", nullable: true })
    idBimestre: string | null;

    @ManyToOne(() => Estudiante, (estudiante) => estudiante.notas, {
        onDelete: "CASCADE",
    })
    @JoinColumn([{ name: "id_estudiante", referencedColumnName: "idEstudiante" }])
    idEstudiante2: Estudiante;

    @ManyToOne(() => Evaluacion, (evaluacion) => evaluacion.notas, {
        onDelete: "CASCADE",
        nullable: true
    })
    @JoinColumn([{ name: "id_evaluacion", referencedColumnName: "idEvaluacion" }])
    idEvaluacion2: Evaluacion | null;

    @ManyToOne(() => Tarea, (tarea) => tarea.notas, {
        onDelete: "CASCADE",
        nullable: true
    })
    @JoinColumn([{ name: "id_tarea", referencedColumnName: "idTarea" }])
    idTarea: Tarea | null;

    @ManyToOne(() => Bimestre, (bimestre) => bimestre.notas, {
        onDelete: "CASCADE",
        nullable: true
    })
    @JoinColumn([{ name: "id_bimestre", referencedColumnName: "idBimestre" }])
    idBimestre2: Bimestre | null;
}
