export enum CalificacionKinder {
    AD = 'AD', // Logro Destacado
    A = 'A',   // Logro Esperado  
    B = 'B',   // En Proceso
    C = 'C'    // En Inicio
}

export class CalificacionKinderHelper {
    // Conversión de calificación literal a valor numérico
    static calificacionANumero(calificacion: string): number {
        switch (calificacion.toUpperCase()) {
            case CalificacionKinder.AD:
                return 4; // Logro Destacado (18-20)
            case CalificacionKinder.A:
                return 3; // Logro Esperado (14-17)
            case CalificacionKinder.B:
                return 2; // En Proceso (11-13)
            case CalificacionKinder.C:
                return 1; // En Inicio (0-10)
            default:
                return 0;
        }
    }

    // Conversión de valor numérico a calificación literal
    static numeroACalificacion(promedio: number): string {
        if (promedio >= 3.5) {
            return CalificacionKinder.AD; // Logro Destacado
        } else if (promedio >= 2.5) {
            return CalificacionKinder.A;  // Logro Esperado
        } else if (promedio >= 1.5) {
            return CalificacionKinder.B;  // En Proceso
        } else {
            return CalificacionKinder.C;  // En Inicio
        }
    }

    // Conversión a escala 0-20 (si necesitas compatibilidad)
    static calificacionAEscala20(calificacion: string): number {
        switch (calificacion.toUpperCase()) {
            case CalificacionKinder.AD:
                return 19; // Logro Destacado
            case CalificacionKinder.A:
                return 15; // Logro Esperado
            case CalificacionKinder.B:
                return 12; // En Proceso
            case CalificacionKinder.C:
                return 8;  // En Inicio
            default:
                return 0;
        }
    }

    // Obtener descripción de la calificación
    static obtenerDescripcion(calificacion: string): string {
        switch (calificacion.toUpperCase()) {
            case CalificacionKinder.AD:
                return 'Logro Destacado';
            case CalificacionKinder.A:
                return 'Logro Esperado';
            case CalificacionKinder.B:
                return 'En Proceso';
            case CalificacionKinder.C:
                return 'En Inicio';
            default:
                return 'Sin Calificación';
        }
    }
}
