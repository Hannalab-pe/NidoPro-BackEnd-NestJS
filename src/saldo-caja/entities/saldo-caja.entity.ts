import { Trabajador } from "src/trabajador/entities/trabajador.entity";
import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";

@Index("saldo_caja_fecha_key", ["fechaCorte"], { unique: true })
@Index("saldo_caja_pkey", ["idSaldo"], { unique: true })
@Entity("saldo_caja", { schema: "public" })
export class SaldoCaja {
    @Column("uuid", {
        primary: true,
        name: "id_saldo",
        default: () => "uuid_generate_v4()",
    })
    idSaldo: string;

    @Column("date", {
        name: "fecha_corte",
        unique: true,
        default: () => "CURRENT_DATE",
    })
    fechaCorte: string;

    @Column("numeric", { name: "saldo_inicial", precision: 12, scale: 2 })
    saldoInicial: string;

    @Column("numeric", {
        name: "total_ingresos_dia",
        nullable: true,
        precision: 12,
        scale: 2,
        default: () => "0.00",
    })
    totalIngresosDia: string | null;

    @Column("numeric", {
        name: "total_egresos_dia",
        nullable: true,
        precision: 12,
        scale: 2,
        default: () => "0.00",
    })
    totalEgresosDia: string | null;

    @Column("numeric", { name: "saldo_final", precision: 12, scale: 2 })
    saldoFinal: string;

    @Column("text", { name: "observaciones", nullable: true })
    observaciones: string | null;

    @Column("timestamp without time zone", {
        name: "fecha_calculo",
        nullable: true,
        default: () => "CURRENT_TIMESTAMP",
    })
    fechaCalculo: Date | null;

    @Column("timestamp without time zone", {
        name: "creado_en",
        nullable: true,
        default: () => "CURRENT_TIMESTAMP",
    })
    creadoEn: Date | null;

    @ManyToOne(() => Trabajador, (trabajador) => trabajador.saldoCajas, {
        onDelete: "RESTRICT",
    })
    @JoinColumn([{ name: "calculado_por", referencedColumnName: "idTrabajador" }])
    calculadoPor: Trabajador;
}
