import { Aula } from "src/aula/entities/aula.entity";
import { Trabajador } from "src/trabajador/entities/trabajador.entity";
import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";

@Index("asignacion_aula_pkey", ["idAsignacionAula"], { unique: true })
@Entity("asignacion_aula", { schema: "public" })
export class AsignacionAula {
    @Column("uuid", {
        primary: true,
        name: "id_asignacion_aula",
        default: () => "uuid_generate_v4()",
    })
    idAsignacionAula: string;

    @Column("date", {
        name: "fecha_asignacion",
        nullable: true,
        default: () => "CURRENT_DATE",
    })
    fechaAsignacion: string | null;

    @Column("boolean", {
        name: "estado_activo",
        nullable: true,
        default: () => "true",
    })
    estadoActivo: boolean | null;

    @ManyToOne(() => Aula, (aula) => aula.asignacionAulas, {
        onDelete: "CASCADE",
    })
    @JoinColumn([{ name: "id_aula", referencedColumnName: "idAula" }])
    idAula: Aula;

    @ManyToOne(() => Trabajador, (trabajador) => trabajador.asignacionAulas, {
        onDelete: "CASCADE",
    })
    @JoinColumn([{ name: "id_trabajador", referencedColumnName: "idTrabajador" }])
    idTrabajador: Trabajador;
}
