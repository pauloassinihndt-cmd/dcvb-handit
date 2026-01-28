import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

console.log('Tentando conexão com o Banco:', {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'dcvb-user',
    database: process.env.DB_NAME || 'dcvb-db'
});

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'dcvb-user',
    password: process.env.DB_PASSWORD || process.env.DB_PASS || 'H4nd1t#DCVB25',
    database: process.env.DB_NAME || 'dcvb-db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

export default pool;
