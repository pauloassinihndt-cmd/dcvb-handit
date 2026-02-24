import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Carregar o .env a partir do diretório raiz da API (../../.env relativo a src/config/)
dotenv.config({ path: join(__dirname, '../../.env') });

console.log(`[DB] Conectando como usuário: ${process.env.DB_USER} | Host: ${process.env.DB_HOST} | DB: ${process.env.DB_NAME} | Senha lida: ${process.env.DB_PASSWORD?.length || 0} caracteres`);

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'dcvb-db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

export default pool;
