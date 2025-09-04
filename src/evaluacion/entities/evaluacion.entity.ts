import { Curso } from "src/curso/entities/curso.entity";
import { Nota } from "src/nota/entities/nota.entity";
import {
    Column,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    OneToMany,
} from "typeorm";

@Index("idx_evaluacion_fecha", ["fecha"], {})
@Index("evaluacion_pkey", ["idEvaluacion"], { unique: true })
@Entity("evaluacion", { schema: "public" })
export class Evaluacion {
    @Column("uuid", {
        primary: true,
        name: "id_evaluacion",
        default: () => "uuid_generate_v4()",
    })
    idEvaluacion: string;

    @Column("date", { name: "fecha" })
    fecha: string;

    @Column("text", { name: "descripcion", nullable: true })
    descripcion: string | null;

    @Column("character varying", {
        name: "tipo_evaluacion",
        nullable: true,
        length: 50,
        default: () => "'EXAMEN'",
    })
    tipoEvaluacion: string | null;

    @ManyToOne(() => Curso, (curso) => curso.evaluacions, { onDelete: "CASCADE" })
    @JoinColumn([{ name: "id_curso", referencedColumnName: "idCurso" }])
    idCurso: Curso;

    @OneToMany(() => Nota, (nota) => nota.idEvaluacion2)
    notas: Nota[];
}
