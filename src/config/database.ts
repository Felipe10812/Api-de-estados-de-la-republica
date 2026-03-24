import { createClient, Client } from '@libsql/client';
import { config } from './index.js';
import { logger } from './logger.js';

class DatabaseConexion {
    private static instancia: Client | null = null;

    static async conectar(): Promise<Client> {
        if (!this.instancia) {
            this.instancia = createClient({
                url: config.database.url,
                authToken: config.database.token,
            });
            logger.info('Conexión a Turso establecida correctamente.');
        }
        return this.instancia;
    }

    static async desconectar(): Promise<void> {
        if (this.instancia) {
            await this.instancia.close();
            this.instancia = null;
            logger.info('Conexión a Turso cerrada.');
        }
    }
}

export default DatabaseConexion;