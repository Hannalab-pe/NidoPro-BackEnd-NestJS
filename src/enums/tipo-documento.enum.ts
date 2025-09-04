export enum TipoDocumento {
    DNI = 'DNI',
    CARNET_EXTRANJERIA = 'Carnet de Extranjería',
    PASAPORTE = 'Pasaporte',
    CEDULA_IDENTIDAD = 'Cédula de Identidad',
    OTRO = 'Otro'
}

export const TIPOS_DOCUMENTO_ARRAY = Object.values(TipoDocumento);
