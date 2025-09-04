import { Asistencia } from "src/asistencia/entities/asistencia.entity";
import { Informe } from "src/informe/entities/informe.entity";
import { LibretaBimestral } from "src/libreta-bimestral/entities/libreta-bimestral.entity";
import { Matricula } from "src/matricula/entities/matricula.entity";
import { Nota } from "src/nota/entities/nota.entity";
import { PensionEstudiante } from "src/pension-estudiante/entities/pension-estudiante.entity";
import { Rol } from "src/rol/entities/rol.entity";
import { TareaEntrega } from "src/tarea-entrega/entities/tarea-entrega.entity";
import { Usuario } from "src/usuario/entities/usuario.entity";
import {
    Column,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    OneToMany,
    OneToOne,
} from "typeorm";
@Index(
    "idx_estudiante_info",
    ["apellido", "nombre", "nroDocumento", "tipoDocumento"],
    {}
)
@Index("idx_estudiante_emergencia", ["contactoEmergencia", "nroEmergencia"], {})
@Index("estudiante_pkey", ["idEstudiante"], { unique: true })
@Index("estudiante_nro_documento_key", ["nroDocumento"], { unique: true })
@Entity("estudiante", { schema: "public" })
export class Estudiante {
    @Column("uuid", {
        primary: true,
        name: "id_estudiante",
        default: () => "uuid_generate_v4()",
    })
    idEstudiante: string;

    @Column("character varying", { name: "nombre", length: 100 })
    nombre: string;

    @Column("character varying", { name: "apellido", length: 100 })
    apellido: string;

    @Column("character varying", {
        name: "contacto_emergencia",
        nullable: true,
        length: 200,
    })
    contactoEmergencia: string | null;

    @Column("character varying", {
        name: "nro_emergencia",
        nullable: true,
        length: 20,
    })
    nroEmergencia: string | null;

    @Column("character varying", {
        name: "tipo_documento",
        nullable: true,
        length: 20,
    })
    tipoDocumento: string | null;

    @Column("character varying", {
        name: "nro_documento",
        nullable: true,
        unique: true,
        length: 20,
    })
    nroDocumento: string | null;

    @Column("text", { name: "observaciones", nullable: true })
    observaciones: string | null;

    @Column('uuid', { name: "id_usuario" })
    id_Usuario: string;

    @OneToMany(() => Asistencia, (asistencia) => asistencia.idEstudiante2)
    asistencias: Asistencia[];

    @ManyToOne(() => Rol, (rol) => rol.estudiantes, { onDelete: "RESTRICT" })
    @JoinColumn([{ name: "id_rol", referencedColumnName: "idRol" }])
    idRol: Rol;

    @OneToOne(() => Usuario, (usuario) => usuario.estudiantes, {
        onDelete: "CASCADE",
    })
    @JoinColumn([{ name: "id_usuario", referencedColumnName: "idUsuario" }])
    idUsuario: Usuario;

    @OneToMany(() => Informe, (informe) => informe.idEstudiante)
    informes: Informe[];

    @OneToMany(() => Matricula, (matricula) => matricula.idEstudiante)
    matriculas: Matricula[];

    @OneToMany(() => Nota, (nota) => nota.idEstudiante2)
    notas: Nota[];

    @OneToMany(() => TareaEntrega, (tareaEntrega) => tareaEntrega.idEstudiante2)
    tareaEntregas: TareaEntrega[];

    @OneToMany(
        () => LibretaBimestral,
        (libretaBimestral) => libretaBimestral.idEstudiante2
    )
    libretaBimestrals: LibretaBimestral[];

    @OneToMany(
        () => PensionEstudiante,
        (pensionEstudiante) => pensionEstudiante.estudiante
    )
    pensionEstudiantes: PensionEstudiante[];

}
