export const config = {
    // Configuracion del servidor
    server: {
        port: process.env.PORT || '3000',
    },

    // Configuracion de la base de datos
    database: {
        url: process.env.CONNECTION_URL || '',
        token: process.env.TOKEN_SECRET || '',
    },

    // Configuracion del modo de ejecucion
    modo: {
        //estado: process.env.NODE_ENV || 'development'
        secure: 'true'
    }
};
