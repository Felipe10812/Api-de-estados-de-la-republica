import { Request, Response } from 'express';
import { UbicacionService } from '../services/ubicacion.service.js';

export class UbicacionController {
    constructor(private readonly ubicacion: UbicacionService) { }

    getEstados = async (req: Request, res: Response) => {
        try {
            const estados = await this.ubicacion.obtenerEstados();
            res.json(estados);
        } catch (error) {
            console.error('Error al obtener estados:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }

    getMunicipios = async (req: Request, res: Response) => {
        const { estado } = req.params;

        if (typeof estado !== 'string') {
            return res.status(400).json({ error: 'El parámetro "estado" debe ser una cadena de texto.' });
        }

        try {
            const municipios = await this.ubicacion.obtenerMunicipios(estado);
            if (municipios) {
                res.json(municipios);
            } else {
                res.status(404).json({ error: `Estado '${estado}' no encontrado.` });
            }
        } catch (error) {
            console.error('Error al obtener municipios:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }

    getColoniaPorCP = async (req: Request, res: Response) => {
        const { cp } = req.params;

        if (typeof cp !== 'string') {
            return res.status(400).json({ error: 'El parámetro "cp" debe ser una cadena de texto.' });
        }

        try {
            const colonias = await this.ubicacion.obtenerColoniasPorCP(cp);
            if (colonias) {
                res.json(colonias);
            } else {
                res.status(404).json({ error: `Código postal '${cp}' no encontrado.` });
            }
        } catch (error) {
            console.error('Error al obtener colonias por código postal:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }

    getEstadosConMunicipios = async (req: Request, res: Response) => {
        try {
            const data = await this.ubicacion.obtenerEstadosConMunicipios();
            res.json(data);
        } catch (error) {
            console.error('Error al obtener estados con municipios:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }
}
