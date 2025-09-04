export enum MetodoPago {
    EFECTIVO = 'Efectivo',
    TRANSFERENCIA_BANCARIA = 'Transferencia bancaria',
    DEPOSITO_BANCARIO = 'Depósito bancario',
    TARJETA_CREDITO = 'Tarjeta de crédito',
    TARJETA_DEBITO = 'Tarjeta de débito',
    PAGO_MOVIL = 'Pago móvil',
    
}

export const METODOS_PAGO_ARRAY = Object.values(MetodoPago);
