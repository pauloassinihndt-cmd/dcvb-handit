import mysql from 'mysql2/promise';

const config = { host: 'localhost', user: 'dcvb-user', password: 'H4nd1t#DCVB25', database: 'dcvb-db' };

async function checkSchema() {
    console.log(`--- Checking Schema for ${config.database} ---`);
    try {
        const connection = await mysql.createConnection(config);
        console.log('SUCCESS: Connection established.');

        const tablesToCheck = ['users', 'industries', 'sections', 'questions', 'industry_scoring_weights'];

        for (const table of tablesToCheck) {
            try {
                const [rows] = await connection.query(`SHOW TABLES LIKE '${table}'`);
                if (rows.length > 0) {
                    console.log(`Table '${table}': EXISTS`);
                    const [columns] = await connection.query(`DESCRIBE ${table}`);
                    console.log(`  Columns:`, columns.map(c => `${c.Field} (${c.Type})`).join(', '));
                } else {
                    console.error(`Table '${table}': MISSING!`);
                }
            } catch (err) {
                console.error(`Error checking table '${table}':`, err.message);
            }
        }

        await connection.end();
    } catch (e) {
        console.error('FAILED TO CONNECT:', e.message);
    }
}

checkSchema();
