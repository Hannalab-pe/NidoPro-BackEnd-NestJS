import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { Usuario } from '../../usuario/entities/usuario.entity';
import { Trabajador } from '../../trabajador/entities/trabajador.entity';
@Index('idx_notificacion_usuario_fecha', ['idUsuario', 'fecha', 'leido'])
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

  @Column('uuid', { name: 'id_usuario' })
  idUsuario: string;

  @Column('uuid', { name: 'generado_por' })
  generadoPor: string;

  @ManyToOne(() => Usuario, (usuario) => usuario.notificaciones, {
    onDelete: 'CASCADE',
  })
  @JoinColumn([{ name: 'id_usuario', referencedColumnName: 'idUsuario' }])
  usuario: Usuario;

  @ManyToOne(
    () => Trabajador,
    (trabajador) => trabajador.notificacionesGeneradas,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn([{ name: 'generado_por', referencedColumnName: 'idTrabajador' }])
  usuarioGenerador: Trabajador;
}
