import { Aula } from "src/aula/entities/aula.entity";
import { Nota } from "src/nota/entities/nota.entity";
import { TareaEntrega } from "src/tarea-entrega/entities/tarea-entrega.entity";
import { Trabajador } from "src/trabajador/entities/trabajador.entity";
import {
    Column,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    OneToMany,
} from "typeorm";

@Index("tarea_pkey", ["idTarea"], { unique: true })
@Entity("tarea", { schema: "public" })
export class Tarea {
    @Column("uuid", {
        primary: true,
        name: "id_tarea",
        default: () => "uuid_generate_v4()",
    })
    idTarea: string;

    @Column("character varying", { name: "titulo", length: 200 })
    titulo: string;

    @Column("text", { name: "descripcion", nullable: true })
    descripcion: string | null;

    @Column("date", {
        name: "fecha_asignacion",
        nullable: true,
        default: () => "CURRENT_DATE",
    })
    fechaAsignacion: string | null;

    @Column("date", { name: "fecha_entrega" })
    fechaEntrega: string;

    @Column("character varying", {
        name: "estado",
        nullable: true,
        length: 20,
        default: () => "'pendiente'",
    })
    estado: string | null;

    @OneToMany(() => Nota, (nota) => nota.idTarea)
    notas: Nota[];

    @ManyToOne(() => Aula, (aula) => aula.tareas, { onDelete: "CASCADE" })
    @JoinColumn([
        { name: "id_aula", referencedColumnName: "idAula" },
        { name: "id_aula", referencedColumnName: "idAula" },
    ])
    aula: Aula;

    @ManyToOne(() => Trabajador, (trabajador) => trabajador.tareas, {
        onDelete: "CASCADE",
    })
    @JoinColumn([{ name: "id_trabajador", referencedColumnName: "idTrabajador" }])
    idTrabajador: Trabajador;

    @OneToMany(() => TareaEntrega, (tareaEntrega) => tareaEntrega.idTarea2)
    tareaEntregas: TareaEntrega[];
}
