import fs from 'fs';
import readline from 'readline';
import { logger } from './logger';
import { config } from '../config';
import { createClient, InStatement } from '@libsql/client';

async function poblarBaseDeDatos() {
  logger.info('⚙️ Iniciando creación de la base de datos...');

  const db = createClient({
    url: config.database.url,
    authToken: config.database.token,
  });

  // 1. Crear el esquema
  await db.executeMultiple(`
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

  logger.info('📖 Leyendo y procesando archivo SEPOMEX...');

  const fileStream = fs.createReadStream('./src/config/CPdescarga.txt', {
    encoding: 'latin1',
  });
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  const estadosMap = new Map<string, number>();
  const municipiosMap = new Map<string, number>();
  let batch: InStatement[] = [];
  const BATCH_SIZE = 500;
  let contadorLineas = 0;

  try {
    for await (const linea of rl) {
      const columnas = linea.split('|');

      // Validar estructura mínima de la línea
      const cpBruto = columnas[0] ?? '';
      if (
        columnas.length < 5 ||
        cpBruto === 'd_codigo' ||
        !/^\d{5}$/.test(cpBruto.trim())
      ) {
        continue;
      }

      const cp = (columnas[0] || '').trim();
      const coloniaNombre = (columnas[1] || '').trim();
      const tipoAsentamiento = (columnas[2] || '').trim();
      const municipioNombre = (columnas[3] || '').trim();
      const estadoNombre = (columnas[4] || '').trim();

      if (!estadoNombre || !municipioNombre || !coloniaNombre) {
        continue;
      }

      // 1. Procesar Estado
      let estadoId = estadosMap.get(estadoNombre);
      if (estadoId === undefined) {
        await db.execute({
          sql: 'INSERT OR IGNORE INTO estados (nombre) VALUES (?)',
          args: [estadoNombre],
        });

        const res = await db.execute({
          sql: 'SELECT id FROM estados WHERE nombre = ?',
          args: [estadoNombre],
        });

        const row = res.rows[0];
        if (!row) {
          throw new Error(
            `Fallo crítico: No se encontró el ID para el estado ${estadoNombre}`,
          );
        }

        const rawId = (row as any).id;
        if (typeof rawId !== 'number' && typeof rawId !== 'bigint') {
          throw new Error(
            `Fallo crítico: ID inválido (${String(
              rawId,
            )}) para el estado ${estadoNombre}`,
          );
        }

        estadoId = Number(rawId);
        estadosMap.set(estadoNombre, estadoId);
      }

      // 2. Procesar Municipio
      const municipioKey = `${estadoId}-${municipioNombre}`;
      let municipioId = municipiosMap.get(municipioKey);
      if (municipioId === undefined) {
        await db.execute({
          sql: 'INSERT OR IGNORE INTO municipios (estado_id, nombre) VALUES (?, ?)',
          args: [estadoId, municipioNombre],
        });

        const res = await db.execute({
          sql: 'SELECT id FROM municipios WHERE estado_id = ? AND nombre = ?',
          args: [estadoId, municipioNombre],
        });

        const row = res.rows[0];
        if (!row) {
          throw new Error(
            `Fallo crítico: No se encontró el ID para el municipio ${municipioNombre}`,
          );
        }

        const rawId = (row as any).id;
        if (typeof rawId !== 'number' && typeof rawId !== 'bigint') {
          throw new Error(
            `Fallo crítico: ID inválido (${String(
              rawId,
            )}) para el municipio ${municipioNombre}`,
          );
        }

        municipioId = Number(rawId);
        municipiosMap.set(municipioKey, municipioId);
      }

      // 3. Acumular Colonias en Batch
      batch.push({
        sql: 'INSERT INTO colonias (municipio_id, nombre, codigo_postal, tipo_asentamiento) VALUES (?, ?, ?, ?)',
        args: [municipioId, coloniaNombre, cp, tipoAsentamiento],
      });

      contadorLineas++;

      // Ejecutar lote
      if (batch.length >= BATCH_SIZE) {
        await db.batch(batch, 'write');
        batch = [];

        if (contadorLineas % 5000 === 0) {
          logger.info(`⏳ Progreso: ${contadorLineas} líneas procesadas...`);
        }
      }
    }

    // Insertar remanentes
    if (batch.length > 0) {
      await db.batch(batch, 'write');
    }

    logger.info(`✅ Proceso finalizado. Total: ${contadorLineas} registros.`);
  } catch (error) {
    logger.error(`❌ Error durante la población: ${error}`);
    throw error;
  } finally {
    await db.close();
  }
}

poblarBaseDeDatos().catch(err => logger.error(`Error crítico: ${err}`));
