import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { Trabajador } from '../../trabajador/entities/trabajador.entity';

@Index('idx_notificacion_trabajador_fecha', ['idTrabajador', 'fecha', 'leido'])
@Index('idx_notificacion_generador', ['generadoPor', 'fecha'])
@Entity('notificacion', { schema: 'public' })
export class Notificacion {
  @Column('uuid', {
    primary: true,
    name: 'id_notificacion',
    default: () => 'uuid_generate_v4()',
  })
  idNotificacion: string;

  @Column('varchar', { name: 'titulo', length: 50 })
  titulo: string;

  @Column('text', { name: 'descripcion' })
  descripcion: string;

  @Column('timestamp', { name: 'fecha' })
  fecha: Date;

  @Column('boolean', { name: 'leido', default: () => 'false' })
  leido: boolean;

  @Column('uuid', { name: 'id_trabajador' })
  idTrabajador: string;

  @Column('uuid', { name: 'generado_por' })
  generadoPor: string;

  @ManyToOne(() => Trabajador, (trabajador) => trabajador.notificaciones, {
    onDelete: 'CASCADE',
  })
  @JoinColumn([{ name: 'id_trabajador', referencedColumnName: 'idTrabajador' }])
  trabajador: Trabajador;

  @ManyToOne(() => Trabajador, (trabajador) => trabajador.notificaciones, {
    onDelete: 'CASCADE',
  })
  @JoinColumn([{ name: 'generado_por', referencedColumnName: 'idTrabajador' }])
  usuarioGenerador: Trabajador;
}
