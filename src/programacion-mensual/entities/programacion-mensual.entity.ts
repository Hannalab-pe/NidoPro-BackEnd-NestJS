import { Aula } from "src/aula/entities/aula.entity";
import { Bimestre } from "src/bimestre/entities/bimestre.entity";
import { Trabajador } from "src/trabajador/entities/trabajador.entity";
import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";

@Index(
    "uq_programacion_docente_mes_bimestre",
    ["anio", "idAula", "idBimestre", "idTrabajador", "mes"],
    { unique: true }
)
@Index(
    "idx_programacion_mensual_info",
    ["anio", "estado", "fechaSubida", "mes"],
    {}
)
@Index("programacion_mensual_pkey", ["idProgramacionMensual"], { unique: true })
@Entity("programacion_mensual", { schema: "public" })
export class ProgramacionMensual {
    @Column("uuid", {
        primary: true,
        name: "id_programacion_mensual",
        default: () => "uuid_generate_v4()",
    })
    idProgramacionMensual: string;

    @Column("character varying", { name: "titulo", length: 200 })
    titulo: string;

    @Column("text", { name: "descripcion" })
    descripcion: string;

    @Column("integer", { name: "mes", unique: true })
    mes: number;

    @Column("integer", { name: "anio", unique: true })
    anio: number;

    @Column("timestamp without time zone", {
        name: "fecha_subida",
        nullable: true,
        default: () => "CURRENT_TIMESTAMP",
    })
    fechaSubida: Date | null;

    @Column("character varying", {
        name: "estado",
        length: 30,
        default: () => "'PENDIENTE'",
    })
    estado: string;

    @Column("text", { name: "archivo_url", nullable: true })
    archivoUrl: string | null;

    @Column("text", { name: "observaciones", nullable: true })
    observaciones: string | null;

    @Column("timestamp without time zone", {
        name: "fecha_aprobacion",
        nullable: true,
    })
    fechaAprobacion: Date | null;

    @Column("uuid", { name: "id_trabajador", unique: true })
    idTrabajador: string;

    @Column("uuid", { name: "id_bimestre", unique: true })
    idBimestre: string;

    @Column("uuid", { name: "id_aula", unique: true })
    idAula: string;

    @ManyToOne(() => Aula, (aula) => aula.programacionMensuals, {
        onDelete: "CASCADE",
    })
    @JoinColumn([{ name: "id_aula", referencedColumnName: "idAula" }])
    aula: Aula;

    @ManyToOne(() => Bimestre, (bimestre) => bimestre.programacionMensuals, {
        onDelete: "CASCADE",
    })
    @JoinColumn([{ name: "id_bimestre", referencedColumnName: "idBimestre" }])
    bimestre: Bimestre;

    @ManyToOne(
        () => Trabajador,
        (trabajador) => trabajador.programacionMensuals,
        { onDelete: "CASCADE" }
    )
    @JoinColumn([{ name: "id_trabajador", referencedColumnName: "idTrabajador" }])
    trabajador: Trabajador;
}
