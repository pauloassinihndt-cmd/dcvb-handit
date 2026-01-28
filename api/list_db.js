import mysql from 'mysql2/promise';

async function test() {
    const config = { host: '127.0.0.1', user: 'root', password: '' }; // Trying most common local
    try {
        const connection = await mysql.createConnection(config);
        const [rows] = await connection.query('SHOW DATABASES');
        console.log('Databases:', rows.map(r => r.Database));
        await connection.end();
    } catch (e) {
        console.log('Root connection failed:', e.message);
    }
}

test();
