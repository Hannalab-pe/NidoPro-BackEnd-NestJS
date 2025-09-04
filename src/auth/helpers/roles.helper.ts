import { UserRole } from '../../enums/roles.enum';

export class RolesHelper {
    // Roles que pueden ser asignados a trabajadores
    static readonly ROLES_TRABAJADORES = [
        UserRole.DIRECTORA,
        UserRole.SECRETARIA,
        UserRole.DOCENTE
    ];

    // Roles que pueden ser asignados a estudiantes
    static readonly ROLES_ESTUDIANTES = [
        UserRole.ESTUDIANTE,
        UserRole.APODERADO
    ];

    // Roles administrativos con permisos elevados
    static readonly ROLES_ADMINISTRATIVOS = [
        UserRole.DIRECTORA,
        UserRole.SECRETARIA
    ];

    // Roles docentes
    static readonly ROLES_DOCENTES = [
        UserRole.DOCENTE
    ];

    /**
     * Verifica si un rol es válido para trabajadores
     */
    static esRolValidoParaTrabajador(rol: string): boolean {
        return this.ROLES_TRABAJADORES.includes(rol as UserRole);
    }

    /**
     * Verifica si un rol es válido para estudiantes
     */
    static esRolValidoParaEstudiante(rol: string): boolean {
        return this.ROLES_ESTUDIANTES.includes(rol as UserRole);
    }

    /**
     * Verifica si un rol tiene permisos administrativos
     */
    static tienePermisosAdministrativos(rol: string): boolean {
        return this.ROLES_ADMINISTRATIVOS.includes(rol as UserRole);
    }

    /**
     * Verifica si un rol es docente
     */
    static esRolDocente(rol: string): boolean {
        return this.ROLES_DOCENTES.includes(rol as UserRole);
    }

    /**
     * Obtiene la descripción de un rol
     */
    static getDescripcionRol(rol: UserRole): string {
        const descripciones = {
            [UserRole.DIRECTORA]: 'Directora del colegio - Máximos permisos administrativos',
            [UserRole.SECRETARIA]: 'Secretaria - Permisos administrativos generales',
            [UserRole.DOCENTE]: 'Docente - Permisos para gestión académica',
            [UserRole.APODERADO]: 'Apoderado - Acceso a información de estudiantes a cargo',
            [UserRole.ESTUDIANTE]: 'Estudiante - Acceso limitado a información personal'
        };
        return descripciones[rol] || 'Rol sin descripción';
    }
}
