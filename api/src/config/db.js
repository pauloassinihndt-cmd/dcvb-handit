import mysql from 'mysql2/promise';

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
