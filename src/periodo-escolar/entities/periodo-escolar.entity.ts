import { Bimestre } from "src/bimestre/entities/bimestre.entity";
import { Column, Entity, Index, OneToMany } from "typeorm";

@Index("idx_periodo_escolar_anio", ["anioEscolar", "estaActivo"], {})
@Index("periodo_escolar_pkey", ["idPeriodoEscolar"], { unique: true })
@Entity("periodo_escolar", { schema: "public" })
export class PeriodoEscolar {
    @Column("uuid", {
        primary: true,
        name: "id_periodo_escolar",
        default: () => "uuid_generate_v4()",
    })
    idPeriodoEscolar: string;

    @Column("integer", { name: "anio_escolar" })
    anioEscolar: number;

    @Column("date", { name: "fecha_inicio" })
    fechaInicio: string;

    @Column("date", { name: "fecha_fin" })
    fechaFin: string;

    @Column("boolean", {
        name: "esta_activo",
        nullable: true,
        default: () => "true",
    })
    estaActivo: boolean | null;

    @Column("text", { name: "descripcion", nullable: true })
    descripcion: string | null;

    @OneToMany(() => Bimestre, (bimestre) => bimestre.idPeriodoEscolar2)
    bimestres: Bimestre[];
}
