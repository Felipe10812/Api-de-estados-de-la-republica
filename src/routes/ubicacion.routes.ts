import { Router } from 'express';
import { UbicacionController } from '../controllers/ubicacion.controller';
import { UbicacionService } from '../services/ubicacion.service';
import DatabaseConexion from '../config/database';
import { UbicacionRepositorio } from '../repositories/ubicacion.repository.sqlite';
import { cpParamSchema, estadoParamSchema, validarParams } from '../middlewares/validator.middleware';

const router = Router();

// --- INVERSIÓN DE DEPENDENCIAS EN ACCIÓN ---
DatabaseConexion.conectar().then(db => {

    const repository = new UbicacionRepositorio(db);
    const service = new UbicacionService(repository);
    const controller = new UbicacionController(service);

    // --- DEFINICIÓN DE RUTAS ---

    /**
     * @openapi
     * /api/v1/estados:
     *   get:
     *     tags:
     *       - Geografía
     *     summary: Obtener todos los estados de la República
     *     description: Devuelve una lista alfabética de los 32 estados de México.
     *     responses:
     *       '200':
     *         description: Operación exitosa
     */
    router.get('/estados', controller.getEstados);

    /**
     * @openapi
     * /api/v1/estados-con-municipios:
     *   get:
     *     tags:
     *       - Geografía
     *     summary: Obtener todos los estados y sus municipios
     *     description: Devuelve una lista completa de cada estado junto con un arreglo de todos sus municipios.
     *     responses:
     *       '200':
     *         description: Operación exitosa. Devuelve un arreglo de estados.
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 type: object
     *                 properties:
     *                   estado:
     *                     type: string
     *                     example: "Jalisco"
     *                   municipios:
     *                     type: array
     *                     items:
     *                       type: string
     *                     example: ["Guadalajara", "Zapopan", "Tlaquepaque"]
     */
    router.get('/estados-con-municipios', controller.getEstadosConMunicipios);

    /**
     * @openapi
     * /api/v1/estados/{estado}/municipios:
     *   get:
     *     tags:
     *       - Geografía
     *     summary: Obtener municipios por estado
     *     parameters:
     *       - in: path
     *         name: estado
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       '200':
     *         description: Lista de municipios
     */
    router.get(
        '/estados/:estado/municipios',
        validarParams(estadoParamSchema),
        controller.getMunicipios
    );

    /**
     * @openapi
     * /api/v1/cp/{cp}:
     *   get:
     *     tags:
     *       - Códigos Postales
     *     summary: Buscar información por Código Postal
     *     parameters:
     *       - in: path
     *         name: cp
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       '200':
     *         description: Información geográfica encontrada
     */
    router.get(
        '/cp/:cp',
        validarParams(cpParamSchema),
        controller.getColoniaPorCP
    );

}).catch(err => {
    console.error("Error al inicializar las rutas con la base de datos", err);
});

export default router;
