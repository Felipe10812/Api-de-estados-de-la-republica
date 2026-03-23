export const config = {
    // ConfiguraciÃ³n del servidor
    server: {
        port: process.env.PORT || '3000',
    },

    // ConfiguraciÃ³n de la base de datos
    database: {
        url: process.env.CONNECTION_URL || '',
        token: process.env.TOKEN_SECRET || '',
    },

    // ConfiguraciÃ³n del modo de ejecuciÃ³n
    modo: {
        //estado: process.env.NODE_ENV || 'development'
        secure: 'true'
    }
};
