import { TipoSeguro } from "src/tipo-seguro/entities/tipo-seguro.entity";
import { Trabajador } from "src/trabajador/entities/trabajador.entity";
import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";


@Index(
    "uq_trabajador_seguro_activo",
    ["estaActivo", "idTipoSeguro", "idTrabajador"],
    { unique: true }
)
@Index("seguro_trabajador_pkey", ["idSeguroTrabajador"], { unique: true })
@Entity("seguro_trabajador", { schema: "public" })
export class SeguroTrabajador {
    @Column("uuid", {
        primary: true,
        name: "id_seguro_trabajador",
        default: () => "uuid_generate_v4()",
    })
    idSeguroTrabajador: string;

    @Column("uuid", { name: "id_trabajador", unique: true })
    idTrabajador: string;

    @Column("uuid", { name: "id_tipo_seguro", unique: true })
    idTipoSeguro: string;

    @Column("boolean", {
        name: "esta_activo",
        nullable: true,
        unique: true,
        default: () => "true",
    })
    estaActivo: boolean | null;

    @Column("date", {
        name: "fecha_asignacion",
        nullable: true,
        default: () => "CURRENT_DATE",
    })
    fechaAsignacion: string | null;

    @Column("date", { name: "fecha_inicio" })
    fechaInicio: string;

    @Column("date", { name: "fecha_fin", nullable: true })
    fechaFin: string | null;

    @Column("text", { name: "observaciones", nullable: true })
    observaciones: string | null;

    @Column("timestamp without time zone", {
        name: "creado_en",
        nullable: true,
        default: () => "CURRENT_TIMESTAMP",
    })
    creadoEn: Date | null;

    @ManyToOne(() => Trabajador, (trabajador) => trabajador.seguroTrabajadors, {
        onDelete: "RESTRICT",
    })
    @JoinColumn([{ name: "creado_por", referencedColumnName: "idTrabajador" }])
    creadoPor: Trabajador;

    @ManyToOne(() => TipoSeguro, (tipoSeguro) => tipoSeguro.seguroTrabajadors, {
        onDelete: "RESTRICT",
    })
    @JoinColumn([
        { name: "id_tipo_seguro", referencedColumnName: "idTipoSeguro" },
    ])
    idTipoSeguro2: TipoSeguro;

    @ManyToOne(() => Trabajador, (trabajador) => trabajador.seguroTrabajadors2, {
        onDelete: "CASCADE",
    })
    @JoinColumn([{ name: "id_trabajador", referencedColumnName: "idTrabajador" }])
    idTrabajador2: Trabajador;
}
