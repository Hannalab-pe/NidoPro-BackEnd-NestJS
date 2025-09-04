import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ApoderadoModule } from './apoderado/apoderado.module';
import { AsignacionAulaModule } from './asignacion-aula/asignacion-aula.module';
import { AsignacionCursoModule } from './asignacion-curso/asignacion-curso.module';
import { AsistenciaModule } from './asistencia/asistencia.module';
import { AulaModule } from './aula/aula.module';
import { CronogramaModule } from './cronograma/cronograma.module';
import { CursoModule } from './curso/curso.module';
import { EstudianteModule } from './estudiante/estudiante.module';
import { EvaluacionModule } from './evaluacion/evaluacion.module';
import { GradoModule } from './grado/grado.module';
import { InformeModule } from './informe/informe.module';
import { MatriculaModule } from './matricula/matricula.module';
import { NotaModule } from './nota/nota.module';
import { PensionModule } from './pension/pension.module';
import { TrabajadorModule } from './trabajador/trabajador.module';
import { RolModule } from './rol/rol.module';
import { UsuarioModule } from './usuario/usuario.module';
import { AuthModule } from './auth/auth.module';

// Configuracion
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { MatriculaAulaModule } from './matricula-aula/matricula-aula.module';
import { TareaModule } from './tarea/tarea.module';
import { TareaEntregaModule } from './tarea-entrega/tarea-entrega.module';
import { CursoGradoModule } from './curso-grado/curso-grado.module';
import { EvualuacionDocenteBimestralModule } from './evualuacion-docente-bimestral/evualuacion-docente-bimestral.module';
import { LibretaBimestralModule } from './libreta-bimestral/libreta-bimestral.module';
import { ObservacionDocenteModule } from './observacion-docente/observacion-docente.module';
import { PeriodoEscolarModule } from './periodo-escolar/periodo-escolar.module';
import { BimestreModule } from './bimestre/bimestre.module';
import { ProgramacionMensualModule } from './programacion-mensual/programacion-mensual.module';
import { SueldoTrabajadorModule } from './sueldo-trabajador/sueldo-trabajador.module';
import { TipoSeguroModule } from './tipo-seguro/tipo-seguro.module';
import { SeguroTrabajadorModule } from './seguro-trabajador/seguro-trabajador.module';
import { PlanillaMensualModule } from './planilla-mensual/planilla-mensual.module';
import { DetallePlanillaModule } from './detalle-planilla/detalle-planilla.module';
import { CajaModule } from './caja/caja.module';
import { CategoriaGastoModule } from './categoria-gasto/categoria-gasto.module';
import { PresupuestoMensualModule } from './presupuesto-mensual/presupuesto-mensual.module';
import { GastoOperativoModule } from './gasto-operativo/gasto-operativo.module';
import { SaldoCajaModule } from './saldo-caja/saldo-caja.module';
import { PensionEstudianteModule } from './pension-estudiante/pension-estudiante.module';
import { TipoContratoModule } from './tipo-contrato/tipo-contrato.module';
import { ContratoTrabajadorModule } from './contrato-trabajador/contrato-trabajador.module';
import { HistorialContratoModule } from './historial-contrato/historial-contrato.module';
import { RenovacionContratoModule } from './renovacion-contrato/renovacion-contrato.module';
import { AuditoriaFinancieraModule } from './auditoria-financiera/auditoria-financiera.module';
import { ReporteProgramadorModule } from './reporte-programador/reporte-programador.module';
import { HistorialReporteModule } from './historial-reporte/historial-reporte.module';
import { AnotacionesEstudianteModule } from './anotaciones-estudiante/anotaciones-estudiante.module';
import { CajaSimpleModule } from './caja-simple/caja-simple.module';
import { CategoriaSimpleModule } from './categoria-simple/categoria-simple.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      schema: process.env.DB_SCHEMA,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
    }),
    ApoderadoModule,
    AsignacionAulaModule,
    AsignacionCursoModule,
    AsistenciaModule,
    AulaModule,
    CronogramaModule,
    CursoModule,
    EstudianteModule,
    EvaluacionModule,
    GradoModule,
    InformeModule,
    MatriculaModule,
    NotaModule,
    PensionModule,
    TrabajadorModule,
    RolModule,
    UsuarioModule,
    AuthModule,
    MatriculaAulaModule,
    TareaModule,
    TareaEntregaModule,
    CursoGradoModule,
    EvualuacionDocenteBimestralModule,
    LibretaBimestralModule,
    ObservacionDocenteModule,
    PeriodoEscolarModule,
    BimestreModule,
    ProgramacionMensualModule,
    SueldoTrabajadorModule,
    TipoSeguroModule,
    SeguroTrabajadorModule,
    PlanillaMensualModule,
    DetallePlanillaModule,
    CajaModule,
    CategoriaGastoModule,
    PresupuestoMensualModule,
    GastoOperativoModule,
    SaldoCajaModule,
    PensionEstudianteModule,
    TipoContratoModule,
    ContratoTrabajadorModule,
    HistorialContratoModule,
    RenovacionContratoModule,
    AuditoriaFinancieraModule,
    ReporteProgramadorModule,
    HistorialReporteModule,
    AnotacionesEstudianteModule,
    CajaSimpleModule,
    CategoriaSimpleModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
