import { Curso } from "src/curso/entities/curso.entity";
import { Grado } from "src/grado/entities/grado.entity";
import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";

@Index("idx_curso_grado_activo", ["estaActivo"], {})
@Index("idx_curso_grado_fecha", ["fechaAsignacion"], {})
@Index("uq_curso_grado", ["idCurso", "idGrado"], { unique: true })
@Index("curso_grado_pkey", ["idCursoGrado"], { unique: true })
@Entity("curso_grado", { schema: "public" })
export class CursoGrado {
    @Column("uuid", {
        primary: true,
        name: "id_curso_grado",
        default: () => "uuid_generate_v4()",
    })
    idCursoGrado: string;

    @Column("uuid", { name: "id_curso" })
    idCurso: string;

    @Column("uuid", { name: "id_grado" })
    idGrado: string;

    @Column("boolean", {
        name: "esta_activo",
        nullable: true,
        default: () => "true",
    })
    estaActivo: boolean | null;

    @Column("date", {
        name: "fecha_asignacion",
        nullable: true,
        default: () => "CURRENT_DATE",
    })
    fechaAsignacion: string | null;

    @ManyToOne(() => Curso, (curso) => curso.cursoGrados, { onDelete: "CASCADE" })
    @JoinColumn([{ name: "id_curso", referencedColumnName: "idCurso" }])
    curso: Curso;

    @ManyToOne(() => Grado, (grado) => grado.cursoGrados, {
        onDelete: "RESTRICT",
    })
    @JoinColumn([{ name: "id_grado", referencedColumnName: "idGrado" }])
    grado: Grado;
}
