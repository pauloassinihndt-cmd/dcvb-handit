import mysql from 'mysql2/promise';

const config = { host: 'localhost', user: 'dcvb-user', password: 'H4nd1tDCVB25', database: 'dcvb-db' };

async function checkSchema() {
    console.log(`--- Checking Connection & Schema with NEW Password ---`);
    try {
        const connection = await mysql.createConnection(config);
        console.log('SUCCESS: Connection established!');

        const [rows] = await connection.query('SHOW TABLES');
        console.log('Tables found:', rows.length);

        await connection.end();
    } catch (e) {
        console.error('FAILED TO CONNECT WITH NEW PASSWORD:');
        console.error('Code:', e.code);
        console.error('Message:', e.message);
    }
}

checkSchema();
