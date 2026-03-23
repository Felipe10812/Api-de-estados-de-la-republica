import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { logger } from '../config/logger';

// --- ESQUEMAS DE VALIDACIÓN ---

// Regla para la URL: /estados/:estado/municipios
export const estadoParamSchema = z.object({
    estado: z.string()
        .min(3, "El nombre del estado debe tener al menos 3 caracteres")
        .max(50, "El nombre del estado es demasiado largo")
});

// Regla para la URL: /cp/:cp
export const cpParamSchema = z.object({
    cp: z.string()
        // Expresión regular: Exactamente 5 dígitos numéricos
        .regex(/^\d{5}$/, "El Código Postal debe contener exactamente 5 números (ej. 66600)")
});


// --- EL MIDDLEWARE INTERCEPTOR ---

// Esta función recibe un esquema de Zod y revisa los req.params
export const validarParams = (schema: z.ZodTypeAny) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        try {
            schema.parse(req.params);
            next();
        } catch (error) {
            if (error instanceof z.ZodError) {
                // Volvemos a mapear los errores para que se lean en español y no como [object Object]
                const mensajesError = error.issues.map(err => err.message);
                logger.warn(`Petición bloqueada por Zod: ${mensajesError.join(', ')}`);

                res.status(400).json({
                    success: false,
                    error: 'Datos inválidos en la URL',
                    detalles: mensajesError
                });
            } else {
                res.status(500).json({ success: false, error: 'Error interno de validación' });
            }
        }
    };
};
