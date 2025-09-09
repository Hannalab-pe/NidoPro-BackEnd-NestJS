import { Column, Entity, Index, OneToOne } from 'typeorm';
import { Estudiante } from '../../estudiante/entities/estudiante.entity';
import { Trabajador } from 'src/trabajador/entities/trabajador.entity';
@Index('idx_usuario_fechas', ['actualizado', 'creado'], {})
@Index('idx_usuario_auth', ['contrasena', 'estaActivo', 'usuario'], {})
@Index('usuario_pkey', ['idUsuario'], { unique: true })
@Index('usuario_usuario_key', ['usuario'], { unique: true })
@Entity('usuario', { schema: 'public' })
export class Usuario {
  @Column('uuid', {
    primary: true,
    name: 'id_usuario',
    default: () => 'uuid_generate_v4()',
  })
  idUsuario: string;

  @Column('character varying', { name: 'usuario', unique: true, length: 100 })
  usuario: string;

  @Column('character varying', { name: 'contrasena', length: 255 })
  contrasena: string;

  @Column('boolean', {
    name: 'esta_activo',
    nullable: true,
    default: () => 'true',
  })
  estaActivo: boolean | null;

  @Column('boolean', {
    name: 'cambio_contrasena',
    default: () => 'false',
  })
  cambioContrasena: boolean | null;

  @Column('date', {
    name: 'creado',
    nullable: true,
    default: () => 'CURRENT_DATE',
  })
  creado: string | null;

  @Column('date', {
    name: 'actualizado',
    nullable: true,
    default: () => 'CURRENT_DATE',
  })
  actualizado: string | null;

  @OneToOne(() => Estudiante, (estudiante) => estudiante.idUsuario)
  estudiantes: Estudiante[];

  @OneToOne(() => Trabajador, (trabajador) => trabajador.idUsuario)
  trabajadores: Trabajador[];
}
