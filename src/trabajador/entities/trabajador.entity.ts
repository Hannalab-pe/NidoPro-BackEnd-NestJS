import {
    Column,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    OneToMany,
} from "typeorm";
import { Usuario } from "src/usuario/entities/usuario.entity";
import { AsignacionAula } from "src/asignacion-aula/entities/asignacion-aula.entity";
import { AsignacionCurso } from "src/asignacion-curso/entities/asignacion-curso.entity";
import { AuditoriaFinanciera } from "src/auditoria-financiera/entities/auditoria-financiera.entity";
import { Caja } from "src/caja/entities/caja.entity";
import { ContratoTrabajador } from "src/contrato-trabajador/entities/contrato-trabajador.entity";
import { Cronograma } from "src/cronograma/entities/cronograma.entity";
import { DetallePlanilla } from "src/detalle-planilla/entities/detalle-planilla.entity";
import { EvaluacionDocenteBimestral } from "src/evualuacion-docente-bimestral/entities/evualuacion-docente-bimestral.entity";
import { GastoOperativo } from "src/gasto-operativo/entities/gasto-operativo.entity";
import { HistorialContrato } from "src/historial-contrato/entities/historial-contrato.entity";
import { HistorialReporte } from "src/historial-reporte/entities/historial-reporte.entity";
import { Informe } from "src/informe/entities/informe.entity";
import { ObservacionDocente } from "src/observacion-docente/entities/observacion-docente.entity";
import { PensionEstudiante } from "src/pension-estudiante/entities/pension-estudiante.entity";
import { PlanillaMensual } from "src/planilla-mensual/entities/planilla-mensual.entity";
import { PresupuestoMensual } from "src/presupuesto-mensual/entities/presupuesto-mensual.entity";
import { ProgramacionMensual } from "src/programacion-mensual/entities/programacion-mensual.entity";
import { RenovacionContrato } from "src/renovacion-contrato/entities/renovacion-contrato.entity";
import { ReporteProgramado } from "src/reporte-programador/entities/reporte-programado.entity";
import { Rol } from "src/rol/entities/rol.entity";
import { SaldoCaja } from "src/saldo-caja/entities/saldo-caja.entity";
import { SeguroTrabajador } from "src/seguro-trabajador/entities/seguro-trabajador.entity";
import { SueldoTrabajador } from "src/sueldo-trabajador/entities/sueldo-trabajador.entity";
import { Tarea } from "src/tarea/entities/tarea.entity";

@Index(
    "idx_trabajador_info",
    ["apellido", "estaActivo", "nombre", "nroDocumento", "tipoDocumento"],
    {}
)
@Index("idx_trabajador_contacto", ["correo", "telefono"], {})
@Index("trabajador_correo_key", ["correo"], { unique: true })
@Index("trabajador_pkey", ["idTrabajador"], { unique: true })
@Index("trabajador_nro_documento_key", ["nroDocumento"], { unique: true })
@Index("trabajador_telefono_key", ["telefono"], { unique: true })
@Entity("trabajador", { schema: "public" })
export class Trabajador {
    @Column("uuid", {
        primary: true,
        name: "id_trabajador",
        default: () => "uuid_generate_v4()",
    })
    idTrabajador: string;

    @Column("character varying", { name: "nombre", length: 100 })
    nombre: string;

    @Column("character varying", { name: "apellido", length: 100 })
    apellido: string;

    @Column("character varying", { name: "tipo_documento", length: 20 })
    tipoDocumento: string;

    @Column("character varying", {
        name: "nro_documento",
        unique: true,
        length: 20,
    })
    nroDocumento: string;

    @Column("text", { name: "direccion", nullable: true })
    direccion: string | null;

    @Column("character varying", {
        name: "correo",
        nullable: true,
        unique: true,
        length: 255,
    })
    correo: string | null;

    @Column("character varying", {
        name: "telefono",
        nullable: true,
        unique: true,
        length: 20,
    })
    telefono: string | null;

    @Column("boolean", {
        name: "esta_activo",
        nullable: true,
        default: () => "true",
    })
    estaActivo: boolean | null;

    @OneToMany(
        () => AsignacionAula,
        (asignacionAula) => asignacionAula.idTrabajador
    )
    asignacionAulas: AsignacionAula[];

    @OneToMany(
        () => AsignacionCurso,
        (asignacionCurso) => asignacionCurso.idTrabajador
    )
    asignacionCursos: AsignacionCurso[];

    @OneToMany(
        () => AuditoriaFinanciera,
        (auditoriaFinanciera) => auditoriaFinanciera.usuarioResponsable
    )
    auditoriaFinancieras: AuditoriaFinanciera[];

    @OneToMany(() => Caja, (caja) => caja.idTrabajadorResponsable)
    cajas: Caja[];

    @OneToMany(
        () => ContratoTrabajador,
        (contratoTrabajador) => contratoTrabajador.aprobadoPor
    )
    contratoTrabajadors: ContratoTrabajador[];

    @OneToMany(
        () => ContratoTrabajador,
        (contratoTrabajador) => contratoTrabajador.creadoPor
    )
    contratoTrabajadors2: ContratoTrabajador[];

    @OneToMany(
        () => ContratoTrabajador,
        (contratoTrabajador) => contratoTrabajador.idTrabajador2
    )
    contratoTrabajadors3: ContratoTrabajador[];

    @OneToMany(() => Cronograma, (cronograma) => cronograma.idTrabajador)
    cronogramas: Cronograma[];

    @OneToMany(
        () => DetallePlanilla,
        (detallePlanilla) => detallePlanilla.idTrabajador2
    )
    detallePlanillas: DetallePlanilla[];

    @OneToMany(
        () => EvaluacionDocenteBimestral,
        (evaluacionDocenteBimestral) => evaluacionDocenteBimestral.idCoordinador
    )
    evaluacionDocenteBimestrals: EvaluacionDocenteBimestral[];

    @OneToMany(
        () => EvaluacionDocenteBimestral,
        (evaluacionDocenteBimestral) => evaluacionDocenteBimestral.idTrabajador2
    )
    evaluacionDocenteBimestrals2: EvaluacionDocenteBimestral[];

    @OneToMany(
        () => GastoOperativo,
        (gastoOperativo) => gastoOperativo.aprobadoPor
    )
    gastoOperativos: GastoOperativo[];

    @OneToMany(
        () => GastoOperativo,
        (gastoOperativo) => gastoOperativo.solicitadoPor
    )
    gastoOperativos2: GastoOperativo[];

    @OneToMany(
        () => HistorialContrato,
        (historialContrato) => historialContrato.idTrabajador2
    )
    historialContratoes: HistorialContrato[];

    @OneToMany(
        () => HistorialContrato,
        (historialContrato) => historialContrato.realizadoPor
    )
    historialContratoes2: HistorialContrato[];

    @OneToMany(
        () => HistorialReporte,
        (historialReporte) => historialReporte.ejecutadoPor
    )
    historialReportes: HistorialReporte[];

    @OneToMany(() => Informe, (informe) => informe.idTrabajador)
    informes: Informe[];

    @OneToMany(
        () => ObservacionDocente,
        (observacionDocente) => observacionDocente.idCoordinador
    )
    observacionDocentes: ObservacionDocente[];

    @OneToMany(
        () => ObservacionDocente,
        (observacionDocente) => observacionDocente.idTrabajador
    )
    observacionDocentes2: ObservacionDocente[];

    @OneToMany(
        () => PensionEstudiante,
        (pensionEstudiante) => pensionEstudiante.registradoPor
    )
    pensionEstudiantes: PensionEstudiante[];

    @OneToMany(
        () => PlanillaMensual,
        (planillaMensual) => planillaMensual.aprobadoPor
    )
    planillaMensuals: PlanillaMensual[];

    @OneToMany(
        () => PlanillaMensual,
        (planillaMensual) => planillaMensual.generadoPor
    )
    planillaMensuals2: PlanillaMensual[];

    @OneToMany(
        () => PlanillaMensual,
        (planillaMensual) => planillaMensual.pagadoPor
    )
    planillaMensuals3: PlanillaMensual[];

    @OneToMany(
        () => PresupuestoMensual,
        (presupuestoMensual) => presupuestoMensual.creadoPor
    )
    presupuestoMensuals: PresupuestoMensual[];

    @OneToMany(
        () => ProgramacionMensual,
        (programacionMensual) => programacionMensual.trabajador
    )
    programacionMensuals: ProgramacionMensual[];

    @OneToMany(
        () => RenovacionContrato,
        (renovacionContrato) => renovacionContrato.aprobadoPor
    )
    renovacionContratoes: RenovacionContrato[];

    @OneToMany(
        () => ReporteProgramado,
        (reporteProgramado) => reporteProgramado.creadoPor
    )
    reporteProgramados: ReporteProgramado[];

    @OneToMany(() => SaldoCaja, (saldoCaja) => saldoCaja.calculadoPor)
    saldoCajas: SaldoCaja[];

    @OneToMany(
        () => SeguroTrabajador,
        (seguroTrabajador) => seguroTrabajador.creadoPor
    )
    seguroTrabajadors: SeguroTrabajador[];

    @OneToMany(
        () => SeguroTrabajador,
        (seguroTrabajador) => seguroTrabajador.idTrabajador2
    )
    seguroTrabajadors2: SeguroTrabajador[];

    @OneToMany(
        () => SueldoTrabajador,
        (sueldoTrabajador) => sueldoTrabajador.creadoPor
    )
    sueldoTrabajadors: SueldoTrabajador[];

    @OneToMany(
        () => SueldoTrabajador,
        (sueldoTrabajador) => sueldoTrabajador.idTrabajador
    )
    sueldoTrabajadors2: SueldoTrabajador[];

    @OneToMany(() => Tarea, (tarea) => tarea.idTrabajador)
    tareas: Tarea[];

    @ManyToOne(() => Rol, (rol) => rol.trabajadores, { onDelete: "RESTRICT" })
    @JoinColumn([{ name: "id_rol", referencedColumnName: "idRol" }])
    idRol: Rol;

    @ManyToOne(() => Usuario, (usuario) => usuario.trabajadores, {
        onDelete: "CASCADE",
    })
    @JoinColumn([{ name: "id_usuario", referencedColumnName: "idUsuario" }])
    idUsuario: Usuario;
}
