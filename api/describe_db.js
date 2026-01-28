import pool from './src/config/db.js';

async function describe() {
    try {
        const [rows] = await pool.query('SHOW TABLES');
        console.log('Tables:', rows);

        const tables = ['industries', 'sections', 'questions', 'diagnoses', 'users'];
        for (const table of tables) {
            try {
                const [desc] = await pool.query(`DESCRIBE ${table}`);
                console.log(`Table ${table} columns:`, desc.map(r => r.Field));
            } catch (e) {
                console.log(`Error describing ${table}:`, e);
            }
        }
    } catch (error) {
        console.error('Database connection error:', error);
    }
    process.exit(0);
}

describe();
