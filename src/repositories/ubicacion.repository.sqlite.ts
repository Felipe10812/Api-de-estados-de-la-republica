import { Database } from "sqlite";
import { logger } from "../config/logger";
import { InformacionPostal, IUbicacionRepository } from "../interfaces/ubicacion.interface";

export class UbicacionRepositorio implements IUbicacionRepository {
    constructor(private readonly db: Database) { }

    async obtenerEstados(): Promise<string[]> {
        try {
            const rows = await this.db.all('SELECT id, nombre FROM estados ORDER BY nombre ASC');
            return rows.map(row => row.nombre);
        } catch (error) {
            logger.error(`Error SQL en obtenerEstados: ${error}`);
            throw new Error('Error al consultar los estados');
        }
    }

    async obtenerMunicipios(estado: string): Promise<string[] | null> {
        try {
            const query = `
                SELECT m.nombre
                FROM municipios m
                JOIN estados e ON m.estado_id = e.id
                WHERE e.nombre = ?
                ORDER BY m.nombre ASC
            `;
            const rows = await this.db.all(query, [estado]);

            return rows.length > 0 ? rows.map(row => row.nombre) : null;
        } catch (error) {
            logger.error(`Error SQL en obtenerMunicipios: ${error}`);
            throw new Error('Error al consultar los municipios');
        }
    }

    async obtenerColoniasPorCP(cp: string): Promise<InformacionPostal | null> {
        try {
            const query = `
                SELECT c.nombre as colonia, c.tipo_asentamiento, m.nombre as municipio, e.nombre as estado
                FROM colonias c
                JOIN municipios m ON c.municipio_id = m.id
                JOIN estados e ON m.estado_id = e.id
                WHERE c.codigo_postal = ?
            `;
            const rows = await this.db.all(query, [cp]);

            if (rows.length === 0) return null;

            return {
                estado: rows[0].estado,
                municipio: rows[0].municipio,
                colonias: rows.map(row => ({
                    nombre: row.colonia,
                    tipo: row.tipo_asentamiento
                }))
            };
        } catch (error) {
            logger.error(`Error SQL en obtenerColoniasPorCP: ${error}`);
            throw new Error('Error al consultar el código postal');
        }
    }

    async obtenerEstadosConMunicipios(): Promise<{ estado: string; municipios: string[] }[]> {
        try {
            const query = `
                SELECT e.nombre as estado, m.nombre as municipio
                FROM estados e
                LEFT JOIN municipios m ON m.estado_id = e.id
                ORDER BY e.nombre ASC, m.nombre ASC
            `;
            const rows = await this.db.all(query);

            const estadosMap: { [key: string]: string[] } = {};
            rows.forEach(row => {
                if (typeof row.estado === 'string') {
                    let municipios = estadosMap[row.estado];

                    if (!municipios) {
                        municipios = [];
                        estadosMap[row.estado] = municipios;
                    }

                    if (row.municipio) {
                        municipios.push(row.municipio);
                    }
                }
            });

            return Object.keys(estadosMap).map(estado => ({
                estado,
                municipios: estadosMap[estado] ?? []
            }));
        } catch (error) {
            logger.error(`Error SQL en obtenerEstadosConMunicipios: ${error}`);
            throw new Error('Error al consultar los estados con municipios');
        }
    }

    async obtenerColoniasPorMunicipio(municipio: string): Promise<InformacionPostal | null> {
        try {
            const query = `
                SELECT c.nombre as colonia, c.tipo_asentamiento, m.nombre as municipio, e.nombre as estado
                FROM colonias c
                JOIN municipios m ON c.municipio_id = m.id
                JOIN estados e ON m.estado_id = e.id
                WHERE m.nombre = ?
            `;
            const rows = await this.db.all(query, [municipio]);

            if (rows.length === 0) return null;

            return {
                estado: rows[0].estado,
                municipio: rows[0].municipio,
                colonias: rows.map(row => ({
                    nombre: row.colonia,
                    tipo: row.tipo_asentamiento
                }))
            };
        } catch (error) {
            logger.error(`Error SQL en obtenerColoniasPorMunicipio: ${error}`);
            throw new Error('Error al consultar las colonias por municipio');
        }
    }
}
