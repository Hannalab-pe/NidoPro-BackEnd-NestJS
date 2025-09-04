import { Bimestre } from "src/bimestre/entities/bimestre.entity";
import { Trabajador } from "src/trabajador/entities/trabajador.entity";
import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";

@Index(
    "idx_observacion_docente_info",
    ["estado", "fechaObservacion", "tipoObservacion"],
    {}
)
@Index("observacion_docente_pkey", ["idObservacionDocente"], { unique: true })
@Entity("observacion_docente", { schema: "public" })
export class ObservacionDocente {
    @Column("uuid", {
        primary: true,
        name: "id_observacion_docente",
        default: () => "uuid_generate_v4()",
    })
    idObservacionDocente: string;

    @Column("character varying", { name: "motivo", length: 100 })
    motivo: string;

    @Column("text", { name: "descripcion" })
    descripcion: string;

    @Column("date", {
        name: "fecha_observacion",
        nullable: true,
        default: () => "CURRENT_DATE",
    })
    fechaObservacion: string | null;

    @Column("character varying", {
        name: "tipo_observacion",
        length: 50,
        default: () => "'PROGRAMACION_TARDIA'",
    })
    tipoObservacion: string;

    @Column("character varying", {
        name: "estado",
        length: 30,
        default: () => "'ACTIVA'",
    })
    estado: string;

    @Column("date", { name: "fecha_subsanacion", nullable: true })
    fechaSubsanacion: string | null;

    @ManyToOne(() => Bimestre, (bimestre) => bimestre.observacionDocentes, {
        onDelete: "CASCADE",
    })
    @JoinColumn([{ name: "id_bimestre", referencedColumnName: "idBimestre" }])
    idBimestre: Bimestre;

    @ManyToOne(() => Trabajador, (trabajador) => trabajador.observacionDocentes, {
        onDelete: "RESTRICT",
    })
    @JoinColumn([
        { name: "id_coordinador", referencedColumnName: "idTrabajador" },
    ])
    idCoordinador: Trabajador;

    @ManyToOne(
        () => Trabajador,
        (trabajador) => trabajador.observacionDocentes2,
        { onDelete: "CASCADE" }
    )
    @JoinColumn([{ name: "id_trabajador", referencedColumnName: "idTrabajador" }])
    idTrabajador: Trabajador;
}
