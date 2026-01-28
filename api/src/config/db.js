import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

console.log('Tentando conexão com o Banco:', {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'dcvb-user',
    database: process.env.DB_NAME || 'dcvb-db'
});

const pool = mysql.createPool({
    host: 'localhost',
    user: 'dcvb-user',
    password: 'H4nd1tDCVB25',
    database: 'dcvb-db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

export default pool;
