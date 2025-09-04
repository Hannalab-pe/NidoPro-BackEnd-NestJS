import { Trabajador } from "src/trabajador/entities/trabajador.entity";
import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";

@Index("idx_auditoria_tabla_fecha", ["fechaOperacion", "tablaAfectada"], {})
@Index("auditoria_financiera_pkey", ["idAuditoria"], { unique: true })
@Index("idx_auditoria_registro", ["idRegistroAfectado", "tablaAfectada"], {})
@Entity("auditoria_financiera", { schema: "public" })
export class AuditoriaFinanciera {
    @Column("uuid", {
        primary: true,
        name: "id_auditoria",
        default: () => "uuid_generate_v4()",
    })
    idAuditoria: string;

    @Column("character varying", { name: "tabla_afectada", length: 50 })
    tablaAfectada: string;

    @Column("uuid", { name: "id_registro_afectado" })
    idRegistroAfectado: string;

    @Column("character varying", { name: "operacion", length: 20 })
    operacion: string;

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

    @Column("character varying", {
        name: "ip_usuario",
        nullable: true,
        length: 45,
    })
    ipUsuario: string | null;

    @Column("text", { name: "user_agent", nullable: true })
    userAgent: string | null;

    @Column("text", { name: "razon_cambio", nullable: true })
    razonCambio: string | null;

    @Column("timestamp without time zone", {
        name: "fecha_operacion",
        nullable: true,
        default: () => "CURRENT_TIMESTAMP",
    })
    fechaOperacion: Date | null;

    @ManyToOne(
        () => Trabajador,
        (trabajador) => trabajador.auditoriaFinancieras,
        { onDelete: "RESTRICT" }
    )
    @JoinColumn([
        { name: "usuario_responsable", referencedColumnName: "idTrabajador" },
    ])
    usuarioResponsable: Trabajador;
}
