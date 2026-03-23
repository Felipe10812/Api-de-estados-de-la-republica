import swaggerJSDoc, { OAS3Options } from 'swagger-jsdoc';

const options: OAS3Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API Geográfica de México 🇲🇽',
            version: '1.0.0',
            description: 'API RESTful para consultar Estados, Municipios y Códigos Postales de México basada en datos de SEPOMEX.',
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Servidor Local',
            },
        ],
    },
    apis: ['./src/routes/*.ts'],
};

export const swaggerSpec = swaggerJSDoc(options);
