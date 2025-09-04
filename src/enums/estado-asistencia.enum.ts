export enum EstadoAsistencia {
    PRESENTE = 'Presente',
    AUSENTE = 'Ausente',
    TARDANZA = 'Tardanza',
    JUSTIFICADO = 'Justificado',
    FALTA_INJUSTIFICADA = 'Falta injustificada'
}

export const ESTADOS_ASISTENCIA_ARRAY = Object.values(EstadoAsistencia);
