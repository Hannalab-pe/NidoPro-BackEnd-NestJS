import { Grado } from "src/grado/entities/grado.entity";
import { Column, Entity, Index, OneToMany } from "typeorm";

@Index("pension_pkey", ["idPension"], { unique: true })
@Index("idx_pension_monto", ["monto"], {})
@Entity("pension", { schema: "public" })
export class Pension {
    @Column("uuid", {
        primary: true,
        name: "id_pension",
        default: () => "uuid_generate_v4()",
    })
    idPension: string;

    @Column("numeric", { name: "monto", precision: 10, scale: 2 })
    monto: string;

    @OneToMany(() => Grado, (grado) => grado.idPension)
    grados: Grado[];

    @Column("integer", {
        name: "fecha_vencimiento_mensual",
        nullable: true,
        default: () => "10",
    })
    fechaVencimientoMensual: number | null;

    @Column("numeric", {
        name: "mora_diaria",
        nullable: true,
        precision: 6,
        scale: 2,
        default: () => "2.00",
    })
    moraDiaria: string | null;

    @Column("numeric", {
        name: "descuento_pago_adelantado",
        nullable: true,
        precision: 6,
        scale: 2,
        default: () => "0.00",
    })
    descuentoPagoAdelantado: string | null;

    @Column("text", { name: "descripcion", nullable: true })
    descripcion: string | null;
}
