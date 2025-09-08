import { Apoderado } from 'src/apoderado/entities/apoderado.entity';
import { Estudiante } from 'src/estudiante/entities/estudiante.entity';
import { Grado } from 'src/grado/entities/grado.entity';
import { MatriculaAula } from 'src/matricula-aula/entities/matricula-aula.entity';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
@Index(
  'idx_matricula_info',
  ['costoMatricula', 'fechaIngreso', 'metodoPago'],
  {},
)
@Index('matricula_pkey', ['idMatricula'], { unique: true })
@Entity('matricula', { schema: 'public' })
export class Matricula {
  @Column('uuid', {
    primary: true,
    name: 'id_matricula',
    default: () => 'uuid_generate_v4()',
  })
  idMatricula: string;

  @Column('numeric', { name: 'costo_matricula', precision: 10, scale: 2 })
  costoMatricula: string;

  @Column('date', { name: 'fecha_ingreso' })
  fechaIngreso: string;

  @Column('character varying', {
    name: 'metodo_pago',
    nullable: true,
    length: 50,
  })
  metodoPago: string | null;

  @Column('text', { name: 'voucher_img', nullable: true })
  voucherImg: string | null;

  @Column('character varying', {
    name: 'anio_escolar',
    length: 4,
    default: () => `'${new Date().getFullYear()}'`,
  })
  anioEscolar: string;

  @ManyToOne(() => Apoderado, (apoderado) => apoderado.matriculas, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn([{ name: 'id_apoderado', referencedColumnName: 'idApoderado' }])
  idApoderado: Apoderado;

  @ManyToOne(() => Estudiante, (estudiante) => estudiante.matriculas, {
    onDelete: 'CASCADE',
  })
  @JoinColumn([{ name: 'id_estudiante', referencedColumnName: 'idEstudiante' }])
  idEstudiante: Estudiante;

  @ManyToOne(() => Grado, (grado) => grado.matriculas, { onDelete: 'RESTRICT' })
  @JoinColumn([{ name: 'id_grado', referencedColumnName: 'idGrado' }])
  idGrado: Grado;

  @OneToOne(() => MatriculaAula, (matriculaAula) => matriculaAula.matricula)
  matriculaAula: MatriculaAula;
}
