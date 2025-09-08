import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  UploadedFile,
  ParseUUIDPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiParam, ApiQuery } from '@nestjs/swagger';
import { PensionEstudianteService } from './pension-estudiante.service';
import { CreatePensionEstudianteDto } from './dto/create-pension-estudiante.dto';
import { UpdatePensionEstudianteDto } from './dto/update-pension-estudiante.dto';
import { UploadVoucherDto } from './dto/upload-voucher.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
import { FilterPensionDto } from './dto/filter-pension.dto';
import { ConfiguracionPensionesDto } from './dto/configuracion-pensiones.dto';

@ApiTags('Pensión Estudiante')
@Controller('pension-estudiante')
export class PensionEstudianteController {
  constructor(private readonly pensionEstudianteService: PensionEstudianteService) { }

  // 1. CREAR PENSIÓN INDIVIDUAL (Para admin)
  @Post()
  @ApiOperation({ summary: 'Crear una pensión individual' })
  @ApiResponse({ status: 201, description: 'Pensión creada exitosamente' })
  create(@Body() createPensionEstudianteDto: CreatePensionEstudianteDto) {
    return this.pensionEstudianteService.create(
      createPensionEstudianteDto,
      createPensionEstudianteDto.registradoPorId
    );
  }

  // 2. CONFIGURAR Y GENERAR PENSIONES - VERSIÓN OPTIMIZADA (Para coordinadora)
  @Post('configurar-anio-escolar-optimizada')
  @ApiOperation({
    summary: 'Configurar y generar pensiones automáticamente - VERSIÓN OPTIMIZADA',
    description: 'Versión optimizada que usa transacciones y bulk operations. 90% más rápida que la versión normal.'
  })
  @ApiResponse({ status: 201, description: 'Pensiones generadas exitosamente con optimización' })
  @ApiQuery({
    name: 'registradoPorId',
    required: false,
    description: 'ID del trabajador que registra las pensiones (temporal, debería venir del JWT)',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  configurarPensionesPorAnioOptimizada(
    @Body() configuracion: ConfiguracionPensionesDto,
    // TODO: Obtener registradoPorId desde JWT del usuario autenticado
    @Query('registradoPorId') registradoPorId?: string
  ) {
    // Temporal: usar un ID por defecto si no se proporciona
    const trabajadorId = registradoPorId || 'temp-trabajador-id';

    return this.pensionEstudianteService.generarPensionesPorAnioEscolarOptimizada(
      configuracion.anioEscolar,
      configuracion,
      trabajadorId
    );
  }

  // 3. VER PENSIONES DE UN APODERADO (Para padres)
  @Get('apoderado/:apoderadoId')
  @ApiOperation({ summary: 'Obtener pensiones de los hijos de un apoderado' })
  @ApiParam({ name: 'apoderadoId', description: 'ID del apoderado' })
  @ApiResponse({ status: 200, description: 'Pensiones encontradas' })
  findByApoderado(
    @Param('apoderadoId', ParseUUIDPipe) apoderadoId: string,
    @Query() filters?: FilterPensionDto
  ) {
    return this.pensionEstudianteService.findByApoderado(apoderadoId, filters);
  }

  // 4. SUBIR VOUCHER DE PAGO (Para padres)
  @Post(':id/upload-voucher')
  @UseInterceptors(FileInterceptor('voucher'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Subir voucher de pago de pensión' })
  @ApiParam({ name: 'id', description: 'ID de la pensión' })
  @ApiResponse({ status: 200, description: 'Voucher subido exitosamente' })
  uploadVoucher(
    @Param('id', ParseUUIDPipe) pensionId: string,
    @Body() uploadData: UploadVoucherDto,
    @UploadedFile() file: any
  ) {
    // Aquí deberías implementar el guardado del archivo y obtener su URL
    const fileUrl = file ? `/uploads/vouchers/${file.filename}` : '';

    if (!fileUrl) {
      throw new Error('No se pudo procesar el archivo');
    }

    return this.pensionEstudianteService.uploadVoucher(pensionId, uploadData, fileUrl);
  }

  // 5. VER PAGOS PENDIENTES DE VERIFICACIÓN (Para admin)
  @Get('pending-verification')
  @ApiOperation({ summary: 'Obtener pagos pendientes de verificación' })
  @ApiResponse({ status: 200, description: 'Pagos pendientes encontrados' })
  findPendingVerifications() {
    return this.pensionEstudianteService.findPendingVerifications();
  }

  // 6. VERIFICAR PAGO (Para admin)
  @Patch(':id/verify')
  @ApiOperation({ summary: 'Verificar o rechazar un pago' })
  @ApiParam({ name: 'id', description: 'ID de la pensión' })
  @ApiResponse({ status: 200, description: 'Pago verificado exitosamente' })
  verifyPayment(
    @Param('id', ParseUUIDPipe) pensionId: string,
    @Body() verifyData: VerifyPaymentDto
  ) {
    // El ID del verificador debería venir del JWT del usuario autenticado
    const verificadoPorId = 'temp-trabajador-id'; // Temporal

    return this.pensionEstudianteService.verifyPayment(pensionId, verifyData, verificadoPorId);
  }

  // 7. MARCAR PENSIONES VENCIDAS (Cron job o admin)
  @Post('mark-overdue')
  @ApiOperation({ summary: 'Marcar pensiones vencidas automáticamente' })
  @ApiResponse({ status: 200, description: 'Pensiones vencidas marcadas' })
  markOverduePensions() {
    return this.pensionEstudianteService.markOverduePensions();
  }

  // 8. LISTAR TODAS LAS PENSIONES CON FILTROS
  @Get()
  @ApiOperation({ summary: 'Obtener todas las pensiones con filtros opcionales' })
  @ApiQuery({ name: 'estadoPension', required: false })
  @ApiQuery({ name: 'anio', required: false })
  @ApiQuery({ name: 'mes', required: false })
  @ApiResponse({ status: 200, description: 'Pensiones encontradas' })
  findAll(@Query() filters?: FilterPensionDto) {
    return this.pensionEstudianteService.findAll(filters);
  }

  // 9. OBTENER UNA PENSIÓN POR ID
  @Get(':id')
  @ApiOperation({ summary: 'Obtener una pensión por ID' })
  @ApiParam({ name: 'id', description: 'ID de la pensión' })
  @ApiResponse({ status: 200, description: 'Pensión encontrada' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.pensionEstudianteService.findOne(id);
  }

  // 10. ACTUALIZAR PENSIÓN
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una pensión' })
  @ApiParam({ name: 'id', description: 'ID de la pensión' })
  @ApiResponse({ status: 200, description: 'Pensión actualizada exitosamente' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePensionEstudianteDto: UpdatePensionEstudianteDto
  ) {
    return this.pensionEstudianteService.update(id, updatePensionEstudianteDto);
  }

  // 11. ELIMINAR PENSIÓN
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una pensión' })
  @ApiParam({ name: 'id', description: 'ID de la pensión' })
  @ApiResponse({ status: 200, description: 'Pensión eliminada exitosamente' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.pensionEstudianteService.remove(id);
  }

  // 12. 🔥 NUEVO: PROCESAR INGRESOS MASIVOS A CAJA SIMPLE
  @Post('procesar-ingresos-masivos')
  @ApiOperation({
    summary: 'Procesar ingresos masivos de pensiones pagadas a Caja Simple',
    description: 'Toma todas las pensiones pagadas del mes/año especificado y crea automáticamente los ingresos en Caja Simple'
  })
  @ApiResponse({ status: 200, description: 'Ingresos masivos procesados exitosamente' })
  @ApiQuery({ name: 'mes', required: true, description: 'Mes a procesar (1-12)', example: 9 })
  @ApiQuery({ name: 'anio', required: true, description: 'Año a procesar', example: 2025 })
  @ApiQuery({ name: 'registradoPorId', required: false, description: 'ID del trabajador que registra' })
  procesarIngresosMasivos(
    @Query('mes') mes: number,
    @Query('anio') anio: number,
    @Query('registradoPorId') registradoPorId?: string
  ) {
    const trabajadorId = registradoPorId || 'temp-trabajador-id';
    return this.pensionEstudianteService.procesarIngresosMasivosPensiones(mes, anio, trabajadorId);
  }

  // 13. 🔥 NUEVO: REPORTE DE CONCILIACIÓN PENSIONES vs CAJA SIMPLE  
  @Get('reporte-conciliacion/:mes/:anio')
  @ApiOperation({
    summary: 'Generar reporte de conciliación entre pensiones y caja simple',
    description: 'Compara las pensiones del mes con los ingresos registrados en Caja Simple para identificar inconsistencias'
  })
  @ApiParam({ name: 'mes', description: 'Mes a verificar (1-12)' })
  @ApiParam({ name: 'anio', description: 'Año a verificar' })
  @ApiResponse({ status: 200, description: 'Reporte de conciliación generado' })
  generarReporteConciliacion(
    @Param('mes') mes: number,
    @Param('anio') anio: number
  ) {
    return this.pensionEstudianteService.generarReporteConciliacion(mes, anio);
  }

  // 14. 🔥 NUEVO: INFORMACIÓN DEL PERIODO ESCOLAR
  @Get('info/periodo-escolar')
  @ApiOperation({
    summary: 'Obtener información del periodo escolar y configuración de pensiones',
    description: 'Información útil para entender el periodo escolar actual y la configuración de pensiones'
  })
  @ApiQuery({ name: 'anioEscolar', required: false, description: 'Año escolar específico (opcional)' })
  @ApiResponse({ status: 200, description: 'Información del periodo escolar obtenida' })
  obtenerInformacionPeriodoEscolar(@Query('anioEscolar') anioEscolar?: number) {
    return this.pensionEstudianteService.obtenerInformacionPeriodoEscolar(anioEscolar);
  }

  // 15. 🔥 NUEVO: RESUMEN DE CONFIGURACIÓN DE PENSIONES
  @Get('info/resumen-configuracion')
  @ApiOperation({
    summary: 'Obtener resumen completo de la configuración de pensiones',
    description: 'Estado general del sistema de pensiones: período escolar, grados, estudiantes, etc.'
  })
  @ApiQuery({ name: 'anioEscolar', required: false, description: 'Año escolar específico (opcional)' })
  @ApiResponse({ status: 200, description: 'Resumen de configuración obtenido' })
  obtenerResumenConfiguracion(@Query('anioEscolar') anioEscolar?: number) {
    return this.pensionEstudianteService.obtenerResumenConfiguracionPensiones(anioEscolar);
  }

  // 12. DESCARGAR VOUCHER
  @Get(':id/voucher')
  @ApiOperation({ summary: 'Descargar voucher de una pensión' })
  @ApiParam({ name: 'id', description: 'ID de la pensión' })
  @ApiResponse({ status: 200, description: 'Voucher descargado' })
  async downloadVoucher(@Param('id', ParseUUIDPipe) pensionId: string) {
    const pension = await this.pensionEstudianteService.findOne(pensionId);

    if (!pension.comprobanteUrl) {
      throw new Error('No hay voucher disponible para esta pensión');
    }

    return {
      success: true,
      message: 'Voucher encontrado',
      url: pension.comprobanteUrl
    };
  }
}
