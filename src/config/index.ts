export const config = {
    // Configuración del servidor
    server: {
        port: process.env.PORT || '3000',
    },

    // Configuración de la base de datos
    database: {
        url: process.env.DATABASE_URL_REMOTE,
    },

    // Configuración del modo de ejecución
    modo: {
        //estado: process.env.NODE_ENV || 'development'
        secure: 'true'
    }
};
