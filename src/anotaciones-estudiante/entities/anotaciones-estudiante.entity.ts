import { Trabajador } from "src/trabajador/entities/trabajador.entity";
import { Estudiante } from "src/estudiante/entities/estudiante.entity";
import { Curso } from "src/curso/entities/curso.entity";
import {
    Column,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
} from "typeorm";

@Index("anotaciones_alumnos_pkey", ["idAnotacionAlumno"], { unique: true })
@Index("idx_anotaciones_trabajador", ["idTrabajador"], {})
@Index("idx_anotaciones_estudiante", ["idEstudiante"], {})
@Index("idx_anotaciones_curso", ["idCurso"], {})
@Index("idx_anotaciones_fecha", ["fechaObservacion"], {})
@Index("idx_anotaciones_activo", ["estaActivo"], {})
@Index("idx_anotaciones_estudiante_curso", ["idEstudiante", "idCurso"], {})
@Entity("anotaciones_alumnos", { schema: "public" })
export class AnotacionesEstudiante {
    @Column("uuid", {
        primary: true,
        name: "id_anotacion_alumno",
        default: () => "uuid_generate_v4()",
    })
    idAnotacionAlumno: string;

    @Column("uuid", { name: "id_trabajador" })
    idTrabajador: string;

    @Column("uuid", { name: "id_estudiante" })
    idEstudiante: string;

    @Column("character varying", {
        name: "titulo",
        length: 200,
    })
    titulo: string;

    @Column("text", { name: "observacion", nullable: true })
    observacion: string | null;

    @Column("date", {
        name: "fecha_observacion",
        default: () => "CURRENT_DATE",
    })
    fechaObservacion: string;

    @Column("uuid", { name: "id_curso" })
    idCurso: string;

    @Column("timestamp without time zone", {
        name: "fecha_creacion",
        nullable: true,
        default: () => "CURRENT_TIMESTAMP",
    })
    fechaCreacion: Date | null;

    @Column("timestamp without time zone", {
        name: "fecha_actualizacion",
        nullable: true,
        default: () => "CURRENT_TIMESTAMP",
    })
    fechaActualizacion: Date | null;

    @Column("boolean", {
        name: "esta_activo",
        default: () => "true",
    })
    estaActivo: boolean;

    @ManyToOne(() => Trabajador, {
        onDelete: "RESTRICT",
    })
    @JoinColumn([{ name: "id_trabajador", referencedColumnName: "idTrabajador" }])
    trabajador: Trabajador;

    @ManyToOne(() => Estudiante, {
        onDelete: "RESTRICT",
    })
    @JoinColumn([{ name: "id_estudiante", referencedColumnName: "idEstudiante" }])
    estudiante: Estudiante;

    @ManyToOne(() => Curso, {
        onDelete: "RESTRICT",
    })
    @JoinColumn([{ name: "id_curso", referencedColumnName: "idCurso" }])
    curso: Curso;
}
