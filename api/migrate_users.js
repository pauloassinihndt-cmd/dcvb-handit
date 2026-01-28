import pool from './src/config/db.js';

async function migrate() {
    try {
        console.log('Verificando/Criando tabela de usuários...');
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS users (
                id VARCHAR(36) PRIMARY KEY,
                username VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Tabela de usuários pronta.');
        process.exit(0);
    } catch (error) {
        console.error('Erro na migração:', error);
        process.exit(1);
    }
}

migrate();
