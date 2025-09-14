import { Trabajador } from "src/trabajador/entities/trabajador.entity";
import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";

@Index("comentario_docente_pkey", ["idEvaluacionDocente"], { unique: true })
@Entity("comentario_docente", { schema: "public" })
export class ComentarioDocente {
    @Column("uuid", {
        primary: true,
        name: "id_evaluacion_docente",
        default: () => "uuid_generate_v4()",
    })
    idEvaluacionDocente: string;

    @Column("character varying", { name: "motivo", length: 100 })
    motivo: string;

    @Column("text", { name: "descripcion" })
    descripcion: string;

    @Column("text", { name: "archivo_url", nullable: true })
    archivoUrl: string | null;

    @Column("date", {
        name: "fecha_creacion",
        default: () => "CURRENT_DATE",
    })
    fechaCreacion: Date;

    @Column("uuid", { name: "id_trabajador" })
    idTrabajador: string;

    @Column("uuid", { name: "id_coordinador" })
    idCoordinador: string;

    @ManyToOne(() => Trabajador, {
        onDelete: "CASCADE",
    })
    @JoinColumn([{ name: "id_trabajador", referencedColumnName: "idTrabajador" }])
    trabajador: Trabajador;

    @ManyToOne(() => Trabajador, {
        onDelete: "CASCADE",
    })
    @JoinColumn([{ name: "id_coordinador", referencedColumnName: "idTrabajador" }])
    coordinador: Trabajador;
}
