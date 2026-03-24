import express, { Application } from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { config } from '../config/index.js';
import DatabaseConexion from '../config/database.js';
import ubicacionRoutes from '../routes/ubicacion.routes.js';
import { swaggerSpec } from '../config/swagger.js';

class Server {
    public app: Application;
    private port: string | number;

    constructor() {
        this.app = express();
        this.port = config.server.port;

        // El orden es importante
        this.dbConection();
        this.middlewares();
        this.routes();
    }

    private async dbConection(): Promise<void> {
        try {
            // Llamamos a nuestro Singleton de Turso
            await DatabaseConexion.conectar();
            console.log('Base de datos Turso lista para recibir consultas.');
        } catch (error) {
            console.error('Error crítico al conectar a la base de datos:', error);
        }
    }

    private middlewares(): void {
        // Habilitar CORS
        this.app.use(cors());

        // Lectura y parseo del body
        this.app.use(express.json());
    }

    private routes(): void {
        this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

        this.app.use('/api/v1', ubicacionRoutes);
    }

    public listen(): void {
        this.app.listen(this.port, () => {
            const serverUrl = `http://localhost:${this.port}`;
            console.log(`\nServidor corriendo en ${serverUrl}`);
            console.log(`Documentación de API (Swagger) disponible en ${serverUrl}/api-docs\n`);
        });
    }
}

export default Server;
