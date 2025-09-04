import { ContratoTrabajador } from "src/contrato-trabajador/entities/contrato-trabajador.entity";
import { Column, Entity, Index, OneToMany } from "typeorm";

@Index("tipo_contrato_pkey", ["idTipoContrato"], { unique: true })
@Index("tipo_contrato_nombre_key", ["nombreTipo"], { unique: true })
@Entity("tipo_contrato", { schema: "public" })
export class TipoContrato {
    @Column("uuid", {
        primary: true,
        name: "id_tipo_contrato",
        default: () => "uuid_generate_v4()",
    })
    idTipoContrato: string;

    @Column("character varying", {
        name: "nombre_tipo",
        unique: true,
        length: 100,
    })
    nombreTipo: string;

    @Column("text", { name: "descripcion", nullable: true })
    descripcion: string | null;

    @Column("integer", { name: "duracion_maxima_meses", nullable: true })
    duracionMaximaMeses: number | null;

    @Column("boolean", {
        name: "permite_renovacion",
        nullable: true,
        default: () => "true",
    })
    permiteRenovacion: boolean | null;

    @Column("boolean", {
        name: "requiere_periodo_prueba",
        nullable: true,
        default: () => "false",
    })
    requierePeriodoPrueba: boolean | null;

    @Column("integer", {
        name: "duracion_periodo_prueba_dias",
        nullable: true,
        default: () => "90",
    })
    duracionPeriodoPruebaDias: number | null;

    @Column("boolean", {
        name: "es_temporal",
        nullable: true,
        default: () => "true",
    })
    esTemporal: boolean | null;

    @Column("character varying", { name: "codigo", nullable: true, length: 20 })
    codigo: string | null;

    @Column("boolean", {
        name: "esta_activo",
        nullable: true,
        default: () => "true",
    })
    estaActivo: boolean | null;

    @Column("timestamp without time zone", {
        name: "creado_en",
        nullable: true,
        default: () => "CURRENT_TIMESTAMP",
    })
    creadoEn: Date | null;

    @OneToMany(
        () => ContratoTrabajador,
        (contratoTrabajador) => contratoTrabajador.idTipoContrato
    )
    contratoTrabajadors: ContratoTrabajador[];
}
