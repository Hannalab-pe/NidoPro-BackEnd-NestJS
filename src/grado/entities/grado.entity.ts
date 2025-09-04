import { Aula } from "src/aula/entities/aula.entity";
import { CursoGrado } from "src/curso-grado/entities/curso-grado.entity";
import { Matricula } from "src/matricula/entities/matricula.entity";
import { Pension } from "src/pension/entities/pension.entity";
import {
    Column,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    OneToMany,
} from "typeorm";

@Index("idx_grado_info", ["estaActivo", "grado"], {})
@Index("grado_pkey", ["idGrado"], { unique: true })
@Entity("grado", { schema: "public" })
export class Grado {
    @Column("uuid", {
        primary: true,
        name: "id_grado",
        default: () => "uuid_generate_v4()",
    })
    idGrado: string;

    @Column("character varying", { name: "grado", length: 50 })
    grado: string;

    @Column("text", { name: "descripcion", nullable: true })
    descripcion: string | null;

    @Column("boolean", {
        name: "esta_activo",
        nullable: true,
        default: () => "true",
    })
    estaActivo: boolean | null;

    @OneToMany(() => Aula, (aula) => aula.idGrado)
    aulas: Aula[];

    @ManyToOne(() => Pension, (pension) => pension.grados, {
        onDelete: "RESTRICT",
    })
    @JoinColumn([{ name: "id_pension", referencedColumnName: "idPension" }])
    idPension: Pension;

    @OneToMany(() => Matricula, (matricula) => matricula.idGrado)
    matriculas: Matricula[];

    @OneToMany(() => CursoGrado, (cursoGrado) => cursoGrado.grado)
    cursoGrados: CursoGrado[];
}
