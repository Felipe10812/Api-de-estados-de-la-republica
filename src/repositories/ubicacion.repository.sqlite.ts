import { Client } from "@libsql/client";
import { logger } from "../config/logger.js";
import { InformacionPostal, IUbicacionRepository } from "../interfaces/ubicacion.interface.js";

export class UbicacionRepositorio implements IUbicacionRepository {
    private db: Client;

    constructor(db: Client) {
        this.db = db;
    }

    async obtenerEstados(): Promise<string[]> {
        try {
            const result = await this.db.execute('SELECT id, nombre FROM estados ORDER BY nombre ASC');
            return result.rows.map(row => String(row.nombre));
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
            const result = await this.db.execute(query, [estado]);

            return result.rows.length > 0 ? result.rows.map(row => String(row.nombre)) : null;
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
            const result = await this.db.execute({
                sql: query,
                args: [cp]
            });

            if (result.rows.length === 0) return null;

            const firstRow = result.rows[0];
            if (!firstRow) return null;

            return {
                estado: String(firstRow.estado),
                municipio: String(firstRow.municipio),
                colonias: result.rows.map(row => ({
                    nombre: String(row.colonia),
                    tipo: String(row.tipo_asentamiento)
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
            const result = await this.db.execute(query);

            const estadosMap: { [key: string]: string[] } = {};
            result.rows.forEach(row => {
                if (typeof row.estado === 'string') {
                    let municipios = estadosMap[row.estado];

                    if (!municipios) {
                        municipios = [];
                        estadosMap[row.estado] = municipios;
                    }

                    if (row.municipio) {
                        municipios.push(String(row.municipio));
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
            const result = await this.db.execute({
                sql: query,
                args: [municipio]
            });

            if (result.rows.length === 0) return null;

            const firstRow = result.rows[0];
            if (!firstRow) return null;

            return {
                estado: String(firstRow.estado),
                municipio: String(firstRow.municipio),
                colonias: result.rows.map(row => ({
                    nombre: String(row.colonia),
                    tipo: String(row.tipo_asentamiento)
                }))
            };
        } catch (error) {
            logger.error(`Error SQL en obtenerColoniasPorMunicipio: ${error}`);
            throw new Error('Error al consultar las colonias por municipio');
        }
    }
}
