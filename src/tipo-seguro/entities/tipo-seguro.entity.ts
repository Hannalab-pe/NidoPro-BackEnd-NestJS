import { SeguroTrabajador } from "src/seguro-trabajador/entities/seguro-trabajador.entity";
import { Column, Entity, Index, OneToMany } from "typeorm";

@Index("tipo_seguro_pkey", ["idTipoSeguro"], { unique: true })
@Index("tipo_seguro_nombre_key", ["nombreSeguro"], { unique: true })
@Entity("tipo_seguro", { schema: "public" })
export class TipoSeguro {
    @Column("uuid", {
        primary: true,
        name: "id_tipo_seguro",
        default: () => "uuid_generate_v4()",
    })
    idTipoSeguro: string;

    @Column("character varying", {
        name: "nombre_seguro",
        unique: true,
        length: 100,
    })
    nombreSeguro: string;

    @Column("text", { name: "descripcion", nullable: true })
    descripcion: string | null;

    @Column("numeric", { name: "porcentaje_descuento", precision: 5, scale: 2 })
    porcentajeDescuento: string;

    @Column("numeric", {
        name: "monto_fijo",
        nullable: true,
        precision: 8,
        scale: 2,
        default: () => "0.00",
    })
    montoFijo: string | null;

    @Column("boolean", {
        name: "es_obligatorio",
        nullable: true,
        default: () => "true",
    })
    esObligatorio: boolean | null;

    @Column("boolean", {
        name: "esta_activo",
        nullable: true,
        default: () => "true",
    })
    estaActivo: boolean | null;

    @Column("character varying", {
        name: "tipo_calculo",
        length: 20,
        default: () => "'PORCENTAJE'",
    })
    tipoCalculo: string;

    @Column("timestamp without time zone", {
        name: "creado_en",
        nullable: true,
        default: () => "CURRENT_TIMESTAMP",
    })
    creadoEn: Date | null;

    @OneToMany(
        () => SeguroTrabajador,
        (seguroTrabajador) => seguroTrabajador.idTipoSeguro2
    )
    seguroTrabajadors: SeguroTrabajador[];
}
