import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments, registerDecorator, ValidationOptions } from 'class-validator';
import { TipoCalificacion } from '../enums/tipo-calificacion.enum';

@ValidatorConstraint({ name: 'calificacionValidator', async: false })
export class CalificacionValidatorConstraint implements ValidatorConstraintInterface {
    validate(value: any, args: ValidationArguments) {
        const dto = args.object as any;

        if (dto.tipoCalificacion === TipoCalificacion.NUMERICA) {
            // Validar que todos los campos numéricos estén presentes
            return dto.puntajePlanificacionNumerico !== undefined &&
                dto.puntajeMetodologiaNumerico !== undefined &&
                dto.puntajePuntualidadNumerico !== undefined &&
                dto.puntajeCreatividadNumerico !== undefined &&
                dto.puntajeComunicacionNumerico !== undefined;
        } else if (dto.tipoCalificacion === TipoCalificacion.LITERAL) {
            // Validar que todos los campos literales estén presentes
            return dto.puntajePlanificacionLiteral !== undefined &&
                dto.puntajeMetodologiaLiteral !== undefined &&
                dto.puntajePuntualidadLiteral !== undefined &&
                dto.puntajeCreatividadLiteral !== undefined &&
                dto.puntajeComunicacionLiteral !== undefined;
        }

        return false;
    }

    defaultMessage(args: ValidationArguments) {
        const dto = args.object as any;

        if (!dto.tipoCalificacion) {
            return 'Debe especificar el tipo de calificación (NUMERICA o LITERAL)';
        }

        const tipo = dto.tipoCalificacion === TipoCalificacion.NUMERICA ? 'numéricos' : 'literales';
        return `Todos los puntajes ${tipo} son requeridos para el tipo de calificación seleccionado`;
    }
}

export function IsValidCalificacion(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: CalificacionValidatorConstraint,
        });
    };
}