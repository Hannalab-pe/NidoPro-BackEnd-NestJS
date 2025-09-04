import { Aula } from "src/aula/entities/aula.entity";
import { Trabajador } from "src/trabajador/entities/trabajador.entity";
import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";

@Index(
    "idx_cronograma_actividad",
    ["fechaFin", "fechaInicio", "nombreActividad"],
    {}
)
@Index("cronograma_pkey", ["idCronograma"], { unique: true })
@Entity("cronograma", { schema: "public" })
export class Cronograma {
    @Column("uuid", {
        primary: true,
        name: "id_cronograma",
        default: () => "uuid_generate_v4()",
    })
    idCronograma: string;

    @Column("character varying", { name: "nombre_actividad", length: 200 })
    nombreActividad: string;

    @Column("text", { name: "descripcion", nullable: true })
    descripcion: string | null;

    @Column("date", { name: "fecha_inicio" })
    fechaInicio: string;

    @Column("date", { name: "fecha_fin" })
    fechaFin: string;

    @ManyToOne(() => Aula, (aula) => aula.cronogramas, { onDelete: "CASCADE" })
    @JoinColumn([{ name: "id_aula", referencedColumnName: "idAula" }])
    idAula: Aula;

    @ManyToOne(() => Trabajador, (trabajador) => trabajador.cronogramas, {
        onDelete: "CASCADE",
    })
    @JoinColumn([{ name: "id_trabajador", referencedColumnName: "idTrabajador" }])
    idTrabajador: Trabajador;
}
