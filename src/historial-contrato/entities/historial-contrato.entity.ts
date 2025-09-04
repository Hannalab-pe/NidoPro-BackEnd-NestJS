import { ContratoTrabajador } from "src/contrato-trabajador/entities/contrato-trabajador.entity";
import { Trabajador } from "src/trabajador/entities/trabajador.entity";
import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";

@Index("idx_historial_contrato_fecha", ["fechaAccion"], {})
@Index("idx_historial_trabajador", ["fechaAccion", "idTrabajador"], {})
@Index("historial_contrato_pkey", ["idHistorialContrato"], { unique: true })
@Entity("historial_contrato", { schema: "public" })
export class HistorialContrato {
    @Column("uuid", {
        primary: true,
        name: "id_historial_contrato",
        default: () => "uuid_generate_v4()",
    })
    idHistorialContrato: string;

    @Column("uuid", { name: "id_trabajador" })
    idTrabajador: string;

    @Column("character varying", { name: "accion", length: 50 })
    accion: string;

    @Column("character varying", {
        name: "estado_anterior",
        nullable: true,
        length: 30,
    })
    estadoAnterior: string | null;

    @Column("character varying", {
        name: "estado_nuevo",
        nullable: true,
        length: 30,
    })
    estadoNuevo: string | null;

    @Column("character varying", {
        name: "campo_modificado",
        nullable: true,
        length: 100,
    })
    campoModificado: string | null;

    @Column("text", { name: "valor_anterior", nullable: true })
    valorAnterior: string | null;

    @Column("text", { name: "valor_nuevo", nullable: true })
    valorNuevo: string | null;

    @Column("character varying", { name: "motivo", nullable: true, length: 200 })
    motivo: string | null;

    @Column("text", { name: "observaciones", nullable: true })
    observaciones: string | null;

    @Column("text", { name: "archivo_soporte_url", nullable: true })
    archivoSoporteUrl: string | null;

    @Column("timestamp without time zone", {
        name: "fecha_accion",
        nullable: true,
        default: () => "CURRENT_TIMESTAMP",
    })
    fechaAccion: Date | null;

    @Column("character varying", {
        name: "ip_usuario",
        nullable: true,
        length: 45,
    })
    ipUsuario: string | null;

    @ManyToOne(
        () => ContratoTrabajador,
        (contratoTrabajador) => contratoTrabajador.historialContratoes,
        { onDelete: "CASCADE" }
    )
    @JoinColumn([{ name: "id_contrato", referencedColumnName: "idContrato" }])
    idContrato: ContratoTrabajador;

    @ManyToOne(() => Trabajador, (trabajador) => trabajador.historialContratoes, {
        onDelete: "CASCADE",
    })
    @JoinColumn([{ name: "id_trabajador", referencedColumnName: "idTrabajador" }])
    idTrabajador2: Trabajador;

    @ManyToOne(
        () => Trabajador,
        (trabajador) => trabajador.historialContratoes2,
        { onDelete: "RESTRICT" }
    )
    @JoinColumn([{ name: "realizado_por", referencedColumnName: "idTrabajador" }])
    realizadoPor: Trabajador;
}
