import fs from 'fs';
import readline from 'readline';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { logger } from './logger';

async function poblarBaseDeDatos() {
    logger.info('⚙️ Iniciando creación de la base de datos...');

    const db = await open({
        filename: './mexico.db',
        driver: sqlite3.Database
    });

    // 1. Crear el esquema
    await db.exec(`
    DROP TABLE IF EXISTS colonias;
    DROP TABLE IF EXISTS municipios;
    DROP TABLE IF EXISTS estados;

    CREATE TABLE estados (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL UNIQUE
    );

    CREATE TABLE municipios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      estado_id INTEGER NOT NULL,
      nombre TEXT NOT NULL,
      UNIQUE(estado_id, nombre)
    );

    CREATE TABLE colonias (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      municipio_id INTEGER NOT NULL,
      nombre TEXT NOT NULL,
      codigo_postal TEXT NOT NULL,
      tipo_asentamiento TEXT,
      FOREIGN KEY (municipio_id) REFERENCES municipios(id)
    );

    CREATE INDEX idx_codigo_postal ON colonias(codigo_postal);
  `);

    logger.info('📖 Leyendo el archivo de SEPOMEX (Esto tomará unos segundos)...');

    const fileStream = fs.createReadStream('./src/config/CPdescarga.txt', 'latin1');
    const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

    const estadosMap = new Map<string, number>();
    const municipiosMap = new Map<string, number>();

    await db.exec('BEGIN TRANSACTION');

    const insertEstado = await db.prepare('INSERT INTO estados (nombre) VALUES (?)');
    const insertMunicipio = await db.prepare('INSERT INTO municipios (estado_id, nombre) VALUES (?, ?)');
    const insertColonia = await db.prepare('INSERT INTO colonias (municipio_id, nombre, codigo_postal, tipo_asentamiento) VALUES (?, ?, ?, ?)');

    for await (const linea of rl) {
        const columnas = linea.split('|');

        const cpBruto = columnas[0] || '';

        if (columnas.length < 5 || cpBruto === 'd_codigo' || cpBruto.trim() === '') {
            continue;
        }

        const cp = (columnas[0] || '').trim();
        const coloniaNombre = (columnas[1] || '').trim();
        const tipoAsentamiento = (columnas[2] || '').trim();
        const municipioNombre = (columnas[3] || '').trim();
        const estadoNombre = (columnas[4] || '').trim();

        // Evitar insertar basura si la línea está corrupta
        if (!/^\d{4,5}$/.test(cp)) continue;

        // Procesar Estado
        let estadoId = estadosMap.get(estadoNombre);
        if (!estadoId) {
            const res = await insertEstado.run(estadoNombre);
            estadoId = res.lastID!;
            estadosMap.set(estadoNombre, estadoId);
        }

        // Procesar Municipio
        const municipioKey = `${estadoId}-${municipioNombre}`;
        let municipioId = municipiosMap.get(municipioKey);
        if (!municipioId) {
            const res = await insertMunicipio.run(estadoId, municipioNombre);
            municipioId = res.lastID!;
            municipiosMap.set(municipioKey, municipioId);
        }

        // Procesar Colonia
        await insertColonia.run(municipioId, coloniaNombre, cp, tipoAsentamiento);
    }

    logger.info('💾 Guardando registros en el disco...');
    await db.exec('COMMIT');

    await insertEstado.finalize();
    await insertMunicipio.finalize();
    await insertColonia.finalize();
    await db.close();

    logger.info('✅ ¡Base de datos mexico.db creada con éxito!');
}

poblarBaseDeDatos().catch(err => logger.error(`Error crítico: ${err}`));
