import pool from './src/config/db.js';

async function removeDuplicates() {
    console.log('Iniciando remoção de perguntas duplicadas na área Geral...');
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Identificar o ID da indústria 'Geral'
        const [industries] = await connection.query("SELECT id FROM industries WHERE name = 'Geral'");
        if (industries.length === 0) {
            console.log("Indústria 'Geral' não encontrada.");
            return;
        }
        const industryId = industries[0].id;
        console.log(`ID da Indústria Geral: ${industryId}`);

        // 2. Buscar perguntas duplicadas (mesmo texto e mesma seção)
        // Usamos um JOIN para encontrar IDs diferentes com o mesmo texto e seção
        const [duplicates] = await connection.query(`
            SELECT q1.id as id_to_delete, q1.text, q1.section_id, q2.id as id_to_keep
            FROM questions q1
            JOIN questions q2 ON q1.text = q2.text AND q1.section_id = q2.section_id AND q1.id <> q2.id
            JOIN sections s ON q1.section_id = s.id
            WHERE s.industry_id = ?
            AND q1.id > q2.id
        `, [industryId]);

        console.log(`Encontradas ${duplicates.length} perguntas duplicadas.`);

        if (duplicates.length > 0) {
            const idsToDelete = duplicates.map(d => d.id_to_delete);

            // 3. Deletar as duplicatas
            // O ON DELETE CASCADE cuidará das opções e feedbacks se houver.
            await connection.query('DELETE FROM questions WHERE id IN (?)', [idsToDelete]);
            console.log(`${idsToDelete.length} perguntas duplicadas removidas com sucesso.`);
        }

        await connection.commit();
        console.log('Operação finalizada.');
    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Erro ao remover duplicatas:', error);
    } finally {
        if (connection) connection.release();
        process.exit();
    }
}

removeDuplicates();
