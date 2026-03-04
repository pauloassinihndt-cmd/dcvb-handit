import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const testConnection = async () => {
    console.log('--- Testando Conexão com o Banco ---');
    console.log('Configuração atual no .env:');
    console.log(`HOST: ${process.env.DB_HOST}`);
    console.log(`USER: ${process.env.DB_USER}`);
    console.log(`DB: ${process.env.DB_NAME}`);
    console.log(`PASSWORD: ${(process.env.DB_PASSWORD || process.env.DB_PASS) ? 'Preenchida (' + ((process.env.DB_PASSWORD || process.env.DB_PASS).length) + ' caracteres)' : 'Vazia'}`);

    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD || process.env.DB_PASS,
            database: process.env.DB_NAME
        });

        console.log('✅ Conexão estabelecida com sucesso!');

        const [rows] = await connection.execute('SELECT COUNT(*) as total FROM diagnoses');
        console.log(`✅ Tabela 'diagnoses' encontrada. Total de registros: ${rows[0].total}`);

        await connection.end();
    } catch (error) {
        console.error('❌ ERRO NA CONEXÃO:');
        console.error(error.message);

        if (error.code === 'ER_BAD_DB_ERROR') {
            console.log('Dica: O banco de dados não existe. Verifique se o nome está correto.');
        } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.log('Dica: Usuário ou senha incorretos.');
        } else if (error.code === 'ECONNREFUSED') {
            console.log('Dica: O servidor MySQL não está rodando ou o HOST está errado.');
        }
    }
};

testConnection();
