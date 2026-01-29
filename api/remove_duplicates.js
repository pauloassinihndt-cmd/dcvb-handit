import pool from './src/config/db.js';

async function removeDuplicates() {
    console.log('Iniciando limpeza profunda de duplicidades...');
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // 1. REMOVER PERGUNTAS DUPLICADAS NA MESMA SEÇÃO (ÁREA)
        // Buscamos perguntas com o mesmo texto dentro da mesma seção
        const [dupQuestions] = await connection.query(`
            SELECT q1.id as id_to_delete, q1.text, q1.section_id
            FROM questions q1
            JOIN questions q2 ON q1.text = q2.text 
                AND q1.section_id = q2.section_id 
                AND q1.id <> q2.id
            WHERE q1.id > q2.id
        `);

        if (dupQuestions.length > 0) {
            console.log(`Encontradas ${dupQuestions.length} perguntas duplicadas.`);
            const idsToDelete = dupQuestions.map(d => d.id_to_delete);
            await connection.query('DELETE FROM questions WHERE id IN (?)', [idsToDelete]);
            console.log('Perguntas duplicadas removidas.');
        } else {
            console.log('Nenhuma pergunta duplicada encontrada.');
        }

        // 2. REMOVER RESPOSTAS (OPÇÕES) DUPLICADAS NA MESMA PERGUNTA
        // Buscamos opções com o mesmo texto dentro da mesma pergunta
        const [dupOptions] = await connection.query(`
            SELECT o1.id as id_to_delete, o1.text, o1.question_id
            FROM question_options o1
            JOIN question_options o2 ON o1.text = o2.text 
                AND o1.question_id = o2.question_id 
                AND o1.id <> o2.id
            WHERE o1.id > o2.id
        `);

        if (dupOptions.length > 0) {
            console.log(`Encontradas ${dupOptions.length} opções (respostas) duplicadas.`);
            const optIdsToDelete = dupOptions.map(d => d.id_to_delete);
            await connection.query('DELETE FROM question_options WHERE id IN (?)', [optIdsToDelete]);
            console.log('Respostas duplicadas removidas.');
        } else {
            console.log('Nenhuma resposta duplicada encontrada.');
        }

        await connection.commit();
        console.log('--- Limpeza concluída com sucesso! ---');
    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Erro durante a limpeza:', error);
    } finally {
        if (connection) connection.release();
        process.exit();
    }
}

removeDuplicates();
