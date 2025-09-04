import { Aula } from "src/aula/entities/aula.entity";
import { Estudiante } from "src/estudiante/entities/estudiante.entity";
import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";


@Index("idx_asistencia_fecha", ["asistio", "fecha", "hora"], {})
@Index(
    "asistencia_fecha_id_estudiante_id_aula_key",
    ["fecha", "idAula", "idEstudiante"],
    { unique: true }
)
@Index("asistencia_pkey", ["idAsistencia"], { unique: true })
@Entity("asistencia", { schema: "public" })
export class Asistencia {
    @Column("uuid", {
        primary: true,
        name: "id_asistencia",
        default: () => "uuid_generate_v4()",
    })
    idAsistencia: string;

    @Column("date", { name: "fecha", unique: true })
    fecha: string;

    @Column("time without time zone", { name: "hora" })
    hora: string;

    @Column("boolean", {
        name: "asistio",
        nullable: true,
        default: () => "false",
    })
    asistio: boolean | null;

    @Column("text", { name: "observaciones", nullable: true })
    observaciones: string | null;

    @Column("uuid", { name: "id_estudiante", unique: true })
    idEstudiante: string;

    @Column("uuid", { name: "id_aula", unique: true })
    idAula: string;

    @ManyToOne(() => Aula, (aula) => aula.asistencias, { onDelete: "CASCADE" })
    @JoinColumn([{ name: "id_aula", referencedColumnName: "idAula" }])
    idAula2: Aula;

    @ManyToOne(() => Estudiante, (estudiante) => estudiante.asistencias, {
        onDelete: "CASCADE",
    })
    @JoinColumn([{ name: "id_estudiante", referencedColumnName: "idEstudiante" }])
    idEstudiante2: Estudiante;
}
