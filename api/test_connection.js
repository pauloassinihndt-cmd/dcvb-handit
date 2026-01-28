import mysql from 'mysql2/promise';

const configs = [
    { host: 'localhost', user: 'dcvb-user', password: 'H4nd1t#DCVB25', database: 'dcvb-db' },
    { host: '127.0.0.1', user: 'dcvb-user', password: 'H4nd1t#DCVB25', database: 'dcvb-db' }
];

async function test() {
    for (const config of configs) {
        console.log(`--- Testing ${JSON.stringify(config)} ---`);
        try {
            const connection = await mysql.createConnection(config);
            console.log('SUCCESS!');
            await connection.end();
        } catch (e) {
            console.log('FAILED CODE:', e.code);
            console.log('FAILED MESSAGE:', e.message);
            console.log('FULL ERROR:', e);
        }
    }
}

test();
