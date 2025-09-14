import { Aula } from "src/aula/entities/aula.entity";
import { Trabajador } from "src/trabajador/entities/trabajador.entity";
import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";

@Index("planificacion_pkey", ["idPlanificacion"], { unique: true })
@Entity("planificacion", { schema: "public" })
export class Planificacion {
    @Column("uuid", {
        primary: true,
        name: "id_planificacion",
        default: () => "uuid_generate_v4()",
    })
    idPlanificacion: string;

    @Column("character varying", { name: "tipo_planificacion", length: 100 })
    tipoPlanificacion: string;

    @Column("date", { name: "fecha_planificacion" })
    fechaPlanificacion: Date;

    @Column("text", { name: "archivo_url" })
    archivoUrl: string;

    @Column("text", { name: "observaciones", nullable: true })
    observaciones: string | null;

    @Column("date", {
        name: "fecha_creacion",
        default: () => "CURRENT_DATE",
    })
    fechaCreacion: Date;

    @Column("uuid", { name: "id_trabajador" })
    idTrabajador: string;

    @Column("uuid", { name: "id_aula" })
    idAula: string;

    @ManyToOne(() => Trabajador, {
        onDelete: "CASCADE",
    })
    @JoinColumn([{ name: "id_trabajador", referencedColumnName: "idTrabajador" }])
    trabajador: Trabajador;

    @ManyToOne(() => Aula, {
        onDelete: "CASCADE",
    })
    @JoinColumn([{ name: "id_aula", referencedColumnName: "idAula" }])
    aula: Aula;
}
