import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { Estudiante } from "../../estudiante/entities/estudiante.entity";
import { Tarea } from "../../tarea/entities/tarea.entity";

@Index("uq_tarea_estudiante", ["idEstudiante", "idTarea"], { unique: true })
@Index("tarea_entrega_pkey", ["idTareaEntrega"], { unique: true })
@Entity("tarea_entrega", { schema: "public" })
export class TareaEntrega {
    @Column("uuid", {
        primary: true,
        name: "id_tarea_entrega",
        default: () => "uuid_generate_v4()",
    })
    idTareaEntrega: string;

    @Column("uuid", { name: "id_tarea", unique: true })
    idTarea: string;

    @Column("uuid", { name: "id_estudiante", unique: true })
    idEstudiante: string;

    @Column("date", { name: "fecha_entrega", nullable: true })
    fechaEntrega: string | null;

    @Column("text", { name: "archivo_url", nullable: true })
    archivoUrl: string | null;

    @Column("character varying", {
        name: "estado",
        nullable: true,
        length: 20,
        default: () => "'pendiente'",
    })
    estado: string | null;

    @Column("boolean", {
        name: "realizo_tarea",
        nullable: true,
        default: () => "false",
    })
    realizoTarea: boolean | null;

    @Column("text", { name: "observaciones", nullable: true })
    observaciones: string | null;

    @ManyToOne(() => Estudiante, (estudiante) => estudiante.tareaEntregas, {
        onDelete: "CASCADE",
    })
    @JoinColumn([{ name: "id_estudiante", referencedColumnName: "idEstudiante" }])
    idEstudiante2: Estudiante;

    @ManyToOne(() => Tarea, (tarea) => tarea.tareaEntregas, {
        onDelete: "CASCADE",
    })
    @JoinColumn([{ name: "id_tarea", referencedColumnName: "idTarea" }])
    idTarea2: Tarea;
}
