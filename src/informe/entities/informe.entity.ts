import { Estudiante } from "src/estudiante/entities/estudiante.entity";
import { Trabajador } from "src/trabajador/entities/trabajador.entity";
import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";

@Index("idx_informe_fecha", ["fechaRegistro"], {})
@Index("informe_pkey", ["idInforme"], { unique: true })
@Entity("informe", { schema: "public" })
export class Informe {
    @Column("uuid", {
        primary: true,
        name: "id_informe",
        default: () => "uuid_generate_v4()",
    })
    idInforme: string;

    @Column("text", { name: "detalle_informe" })
    detalleInforme: string;

    @Column("date", {
        name: "fecha_registro",
        nullable: true,
        default: () => "CURRENT_DATE",
    })
    fechaRegistro: string | null;

    @ManyToOne(() => Estudiante, (estudiante) => estudiante.informes, {
        onDelete: "CASCADE",
    })
    @JoinColumn([{ name: "id_estudiante", referencedColumnName: "idEstudiante" }])
    idEstudiante: Estudiante;

    @ManyToOne(() => Trabajador, (trabajador) => trabajador.informes, {
        onDelete: "CASCADE",
    })
    @JoinColumn([{ name: "id_trabajador", referencedColumnName: "idTrabajador" }])
    idTrabajador: Trabajador;
}
