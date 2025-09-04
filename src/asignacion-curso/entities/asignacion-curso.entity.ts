import { Curso } from "src/curso/entities/curso.entity";
import { Trabajador } from "src/trabajador/entities/trabajador.entity";
import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";


@Index("asignacion_curso_pkey", ["idAsignacionCurso"], { unique: true })
@Entity("asignacion_curso", { schema: "public" })
export class AsignacionCurso {
    @Column("uuid", {
        primary: true,
        name: "id_asignacion_curso",
        default: () => "uuid_generate_v4()",
    })
    idAsignacionCurso: string;

    @Column("date", {
        name: "fecha_asignacion",
        nullable: true,
        default: () => "CURRENT_DATE",
    })
    fechaAsignacion: string | null;

    @Column("boolean", {
        name: "esta_activo",
        nullable: true,
        default: () => "true",
    })
    estaActivo: boolean | null;

    @ManyToOne(() => Curso, (curso) => curso.asignacionCursos, {
        onDelete: "CASCADE",
    })
    @JoinColumn([{ name: "id_curso", referencedColumnName: "idCurso" }])
    idCurso: Curso;

    @ManyToOne(() => Trabajador, (trabajador) => trabajador.asignacionCursos, {
        onDelete: "CASCADE",
    })
    @JoinColumn([{ name: "id_trabajador", referencedColumnName: "idTrabajador" }])
    idTrabajador: Trabajador;
}
