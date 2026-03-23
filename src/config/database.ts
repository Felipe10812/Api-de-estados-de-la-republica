import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import { logger } from './logger';

class DatabaseConexion {
    private static instancia: Database | null = null;

    static async conectar(): Promise<Database> {
        if (!this.instancia) {
            this.instancia = await open({
                filename: './mexico.db', // El archivo que crearemos con el seeder
                driver: sqlite3.Database
            });
            logger.info('Conexión a SQLite establecida correctamente.');
        }
        return this.instancia;
    }

    static async desconectar(): Promise<void> {
        if (this.instancia) {
            await this.instancia.close();
            this.instancia = null;
            logger.info('Conexión a SQLite cerrada.');
        }
    }
}

export default DatabaseConexion;
