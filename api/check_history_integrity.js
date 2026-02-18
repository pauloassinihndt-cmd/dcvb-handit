import pool from './src/config/db.js';

async function checkIntegrity() {
    console.log('--- Iniciando Verificação de Integridade dos Históricos ---');
    const connection = await pool.getConnection();

    try {
        // 1. Total de diagnósticos
        const [totalDiagnoses] = await connection.query('SELECT COUNT(*) as count FROM diagnoses');
        console.log(`Total de diagnósticos no histórico: ${totalDiagnoses[0].count}`);

        // 2. Diagnósticos sem nenhuma resposta
        const [noAnswers] = await connection.query(`
            SELECT d.id, d.user_name, d.created_at 
            FROM diagnoses d 
            LEFT JOIN diagnosis_answers da ON d.id = da.diagnosis_id 
            WHERE da.diagnosis_id IS NULL
        `);
        if (noAnswers.length > 0) {
            console.warn(`[ALERTA] Encontrados ${noAnswers.length} diagnósticos sem NENHUMA resposta vinculada:`);
            noAnswers.forEach(d => console.log(`  - ID: ${d.id} | Usuário: ${d.user_name} | Data: ${d.created_at}`));
        } else {
            console.log('[OK] Todos os diagnósticos possuem respostas vinculadas.');
        }

        // 3. Diagnósticos sem resultados de seção (usados para o gráfico/relatório)
        const [noResults] = await connection.query(`
            SELECT d.id, d.user_name, d.created_at 
            FROM diagnoses d 
            LEFT JOIN diagnosis_section_results dsr ON d.id = dsr.diagnosis_id 
            WHERE dsr.diagnosis_id IS NULL
        `);
        if (noResults.length > 0) {
            console.warn(`[ALERTA] Encontrados ${noResults.length} diagnósticos sem resultados de seção:`);
            noResults.forEach(d => console.log(`  - ID: ${d.id} | Usuário: ${d.user_name} | Data: ${d.created_at}`));
        } else {
            console.log('[OK] Todos os diagnósticos possuem resultados de seção.');
        }

        // 4. Verificar Indústrias inexistentes
        const [invalidIndustries] = await connection.query(`
            SELECT d.id, d.user_name, d.industry_id 
            FROM diagnoses d 
            LEFT JOIN industries i ON d.industry_id = i.id 
            WHERE i.id IS NULL
        `);
        if (invalidIndustries.length > 0) {
            console.warn(`[ALERTA] Encontrados ${invalidIndustries.length} diagnósticos com Indústria (industry_id) inválida ou removida:`);
            invalidIndustries.forEach(d => console.log(`  - ID: ${d.id} | Usuário: ${d.user_name} | IndustryID: ${d.industry_id}`));
        } else {
            console.log('[OK] Todas as indústrias referenciadas existem.');
        }

        // 5. Verificar Respostas Órfãs (sem diagnóstico pai)
        const [orphanAnswers] = await connection.query(`
            SELECT COUNT(*) as count 
            FROM diagnosis_answers da 
            LEFT JOIN diagnoses d ON da.diagnosis_id = d.id 
            WHERE d.id IS NULL
        `);
        if (orphanAnswers[0].count > 0) {
            console.warn(`[ALERTA] Encontradas ${orphanAnswers[0].count} respostas órfãs (sem diagnóstico correspondente).`);
        } else {
            console.log('[OK] Nenhuma resposta órfã encontrada.');
        }

        // 6. Verificar Resultados de Seção Órfãos
        const [orphanResults] = await connection.query(`
            SELECT COUNT(*) as count 
            FROM diagnosis_section_results dsr 
            LEFT JOIN diagnoses d ON dsr.diagnosis_id = d.id 
            WHERE d.id IS NULL
        `);
        if (orphanResults[0].count > 0) {
            console.warn(`[ALERTA] Encontrados ${orphanResults[0].count} resultados de seção órfãos.`);
        } else {
            console.log('[OK] Nenhum resultado de seção órfão encontrado.');
        }

        // 7. Verificar Diagnósticos Duplicados (Mesmo usuário, empresa e score em intervalo de 10 min)
        const [duplicates] = await connection.query(`
            SELECT d1.id as id1, d2.id as id2, d1.user_name, d1.user_company, d1.created_at
            FROM diagnoses d1
            JOIN diagnoses d2 ON d1.user_name = d2.user_name 
                AND d1.user_company = d2.user_company 
                AND d1.total_score = d2.total_score 
                AND d1.id < d2.id
            WHERE ABS(TIMESTAMPDIFF(SECOND, d1.created_at, d2.created_at)) < 600
        `);
        if (duplicates.length > 0) {
            console.warn(`[ALERTA] Encontrados ${duplicates.length} diagnósticos potencialmente duplicados (mesmos dados em < 10min):`);
            duplicates.forEach(d => console.log(`  - IDs: ${d.id1} e ${d.id2} | Usuário: ${d.user_name} | Empresa: ${d.user_company}`));
        } else {
            console.log('[OK] Nenhum diagnóstico duplicado óbvio encontrado.');
        }

        // 8. Comparação de Scores (Opcional - verifica se total_score bate com a média dos resultados de seção)
        // Note: total_score no banco é REAL, a média pode variar um pouco por arredondamento
        const [scoreMismatch] = await connection.query(`
            SELECT d.id, d.user_name, d.total_score, AVG(dsr.score) as avg_score
            FROM diagnoses d
            JOIN diagnosis_section_results dsr ON d.id = dsr.diagnosis_id
            GROUP BY d.id
            HAVING ABS(d.total_score - AVG(dsr.score)) > 0.01
        `);
        if (scoreMismatch.length > 0) {
            console.warn(`[AVISO] Encontrados ${scoreMismatch.length} diagnósticos onde o total_score difere da média das seções:`);
            scoreMismatch.forEach(d => console.log(`  - ID: ${d.id} | DB Total: ${d.total_score} | Avg Calc: ${d.avg_score.toFixed(2)}`));
        }

        console.log('--- Verificação Concluída ---');
    } catch (error) {
        console.error('Erro durante a verificação de integridade:', error);
    } finally {
        if (connection) connection.release();
        process.exit();
    }
}

checkIntegrity();
