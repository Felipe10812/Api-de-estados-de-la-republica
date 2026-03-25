# API de Estados de la República Mexicana

Una API RESTful robusta desarrollada con **Node.js**, **Express** y **TypeScript** que proporciona información detallada sobre la división política de México, incluyendo estados, municipios y códigos postales.

## Características

- **Información Geográfica:** Consulta los 32 estados, sus municipios y colonias.
- **Búsqueda por CP:** Obtén información detallada de cualquier código postal de México.
- **Base de Datos Flexible:** Utiliza **Turso (LibSQL/SQLite)** para un rendimiento óptimo y baja latencia.
- **Documentación Interactiva:** Incluye **Swagger UI** para explorar y probar los endpoints fácilmente.
- **Validación de Datos:** Uso de **Zod** para garantizar la integridad de los parámetros de entrada.
- **Logs Profesionales:** Sistema de logging implementado con **Winston**.

## Stack Tecnológico

- **Runtime:** Node.js (v20+)
- **Lenguaje:** TypeScript
- **Framework:** Express 5
- **Base de Datos:** Turso (LibSQL) / SQLite
- **Documentación:** Swagger (swagger-jsdoc & swagger-ui-express)
- **Validación:** Zod
- **Logger:** Winston
- **Entorno de Desarrollo:** Nodemon, ts-node

## Requisitos Previos

- Node.js instalado (se recomienda usar la versión especificada en `.nvmrc`).
- Una instancia de base de datos en [Turso](https://turso.tech/) o un archivo SQLite local.
- El archivo de datos de SEPOMEX (`src/config/CPdescarga.txt`) para la carga inicial de datos.

## Configuración e Instalación

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/Felipe10812/Api-de-estados-de-la-republica.git
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno:**
   Copia el archivo `.env.example` a `.env` y completa los valores necesarios:
   ```bash
   cp .env.example .env
   ```
   *   `PORT`: Puerto donde correrá el servidor (defecto: 3000).
   *   `CONNECTION_URL`: URL de tu base de datos Turso o ruta al archivo SQLite local.
   *   `TOKEN_SECRET`: Token de autenticación de Turso (si aplica).

4. **Poblar la base de datos:**
   El proyecto incluye un script de "seeding" que procesa el archivo oficial de **Correos de México (SEPOMEX)** para generar la estructura y datos necesarios:
   ```bash
   npm run seed
   ```
   *Nota: Asegúrate de que el archivo `src/config/CPdescarga.txt` esté presente antes de ejecutar este comando.*

## Ejecución

- **Modo Desarrollo:**
  ```bash
   npm run dev
  ```
- **Construcción (Build):**
  ```bash
   npm run build
  ```
- **Producción:**
  ```bash
   npm run start
  ```

## Endpoints Principales

La API base se encuentra en `/api/v1`.

| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| `GET` | `/estados` | Lista alfabética de los 32 estados. |
| `GET` | `/estados-con-municipios` | Todos los estados con sus respectivos municipios. |
| `GET` | `/estados/:estado/municipios` | Lista de municipios de un estado específico. |
| `GET` | `/cp/:cp` | Información geográfica asociada a un Código Postal. |

## Documentación de la API

Una vez que el servidor esté en funcionamiento, puedes acceder a la documentación interactiva (Swagger) en:
`http://localhost:3000/api-docs`

---
Desarrollado por [Felipe Acosta](https://github.com/Felipe10812)
