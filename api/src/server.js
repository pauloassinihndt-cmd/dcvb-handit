import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './config/db.js';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Criar roteador para API para suportar o prefixo /api usado no frontend e nginx
const apiRouter = express.Router();

// --- MIGRATION DE BANCO (executada uma vez no startup) ---
async function runMigrations() {
    try {
        const dbName = process.env.DB_NAME || 'dcvb-db';
        const table = 'diagnosis_answers';

        // Verificar e adicionar coluna question_text_snapshot
        const [colQ] = await pool.execute(
            `SELECT COUNT(*) as cnt FROM INFORMATION_SCHEMA.COLUMNS 
             WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = 'question_text_snapshot'`,
            [dbName, table]
        );
        if (colQ[0].cnt === 0) {
            await pool.execute(`ALTER TABLE ${table} ADD COLUMN question_text_snapshot TEXT`);
            console.log('[MIGRATION] Coluna question_text_snapshot criada.');
        }

        // Verificar e adicionar coluna answer_text_snapshot
        const [colA] = await pool.execute(
            `SELECT COUNT(*) as cnt FROM INFORMATION_SCHEMA.COLUMNS 
             WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = 'answer_text_snapshot'`,
            [dbName, table]
        );
        if (colA[0].cnt === 0) {
            await pool.execute(`ALTER TABLE ${table} ADD COLUMN answer_text_snapshot VARCHAR(500)`);
            console.log('[MIGRATION] Coluna answer_text_snapshot criada.');
        }

        console.log('[MIGRATION] Verificacao de colunas de snapshot concluida.');
    } catch (e) {
        console.warn('[MIGRATION] Erro na migration de snapshot:', e.message);
    }
}

// Rota de Health Check
apiRouter.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// --- ROTAS DO SISTEMA ---

// Listar Indústrias (apenas ativas - usada no formulário do usuário)
apiRouter.get('/industries', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM industries WHERE active = 1 ORDER BY created_at ASC');
        const mappedRows = Array.isArray(rows) ? rows.map(row => ({
            ...row,
            isFixed: row.is_fixed === 1 || row.is_fixed === true,
            active: true // Como filtramos por active = 1, todos aqui são true
        })) : [];
        res.json(mappedRows);
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json([]); // Retorna array vazio em caso de erro para não quebrar o frontend
    }
});

// Listar TODAS as Indústrias (ativas e inativas - usada pelo painel admin)
apiRouter.get('/industries/all', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM industries ORDER BY created_at ASC');
        const mappedRows = Array.isArray(rows) ? rows.map(row => ({
            ...row,
            isFixed: row.is_fixed === 1 || row.is_fixed === true,
            active: row.active === 1 || row.active === true
        })) : [];
        res.json(mappedRows);
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json([]);
    }
});


// Adicionar Nova Indústria
apiRouter.post('/industries', async (req, res) => {
    const { name } = req.body;
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const id = uuidv4();

        // 1. Inserir a indústria
        console.log('Tentando inserir indústria:', { id, name });
        await connection.execute(
            'INSERT INTO industries (id, name, active, is_fixed) VALUES (?, ?, 1, 0)',
            [id, name]
        );

        // 2. Inserir pesos padrão
        try {
            console.log('Tentando inserir pesos padrão para:', id);
            await connection.execute(
                'INSERT INTO industry_scoring_weights (industry_id, option_a_weight, option_b_weight, option_c_weight, option_d_weight) VALUES (?, 0, 33, 66, 100)',
                [id]
            );
        } catch (weightError) {
            console.warn('Aviso: Falha ao inserir pesos (tabela pode estar ausente):', weightError.message);
        }

        await connection.commit();
        console.log(`[INDUSTRIA] "${name}" adicionada com sucesso! ID: ${id}`);
        res.status(201).json({ id, name, active: 1, isFixed: false });
    } catch (error) {
        if (connection) await connection.rollback();
        console.error(`[ERRO-INDUSTRIA] Falha ao adicionar "${name}":`, error.message);
        res.status(500).json({ error: error.message, stack: error.stack });
    } finally {
        if (connection) connection.release();
    }
});

// Atualizar Nome da Indústria
apiRouter.put('/industries/:id', async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    try {
        await pool.execute('UPDATE industries SET name = ? WHERE id = ?', [name, id]);
        res.json({ message: 'Indústria atualizada' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Alternar Status da Indústria
apiRouter.patch('/industries/:id/toggle', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.execute('UPDATE industries SET active = 1 - active WHERE id = ?', [id]);
        res.json({ message: 'Status alterado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Excluir Indústria
apiRouter.delete('/industries/:id', async (req, res) => {
    const { id } = req.params;

    // Trava para o Ramo Geral
    if (id === 'default-geral') {
        return res.status(403).json({ error: 'O Ramo Geral é protegido e não pode ser removido.' });
    }
    try {
        await pool.execute('DELETE FROM industries WHERE id = ?', [id]);
        res.json({ message: 'Indústria removida' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Obter Pesos de Pontuação de uma Indústria
apiRouter.get('/industries/:id/scoring', async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query('SELECT * FROM industry_scoring_weights WHERE industry_id = ?', [id]);
        if (rows.length === 0) {
            // Retorna padrão se não houver configuração
            return res.json({ industry_id: id, option_a_weight: 0, option_b_weight: 33, option_c_weight: 66, option_d_weight: 100, score_mode: 'percent' });
        }
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Atualizar Pesos de Pontuação de uma Indústria
apiRouter.put('/industries/:id/scoring', async (req, res) => {
    const { id } = req.params;
    const { option_a_weight, option_b_weight, option_c_weight, option_d_weight, score_mode } = req.body;
    const mode = score_mode === 'points' ? 'points' : 'percent';
    try {
        // Garante que a coluna score_mode existe (ALTER TABLE seguro)
        await pool.execute(`
            INSERT INTO industry_scoring_weights (industry_id, option_a_weight, option_b_weight, option_c_weight, option_d_weight, score_mode)
            VALUES (?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                option_a_weight = VALUES(option_a_weight),
                option_b_weight = VALUES(option_b_weight),
                option_c_weight = VALUES(option_c_weight),
                option_d_weight = VALUES(option_d_weight),
                score_mode = VALUES(score_mode)
        `, [id, option_a_weight, option_b_weight, option_c_weight, option_d_weight, mode]);
        res.json({ success: true, score_mode: mode });
    } catch (error) {
        console.error('Erro ao salvar pesos:', error);
        res.status(500).json({ error: error.message });
    }
});

// Obter Perguntas por Indústria
apiRouter.get('/questions/:industryId', async (req, res) => {
    const { industryId } = req.params;
    try {
        // Busca as seções
        const [sections] = await pool.query('SELECT * FROM sections WHERE industry_id = ? ORDER BY order_index ASC', [industryId]);

        // Para cada seção, busca suas perguntas
        const result = await Promise.all(sections.map(async (section) => {
            const [questions] = await pool.query('SELECT * FROM questions WHERE section_id = ? AND disabled = 0 ORDER BY order_index ASC', [section.id]);

            // Para cada pergunta, busca suas opções
            const questionsWithChoices = await Promise.all(questions.map(async (q) => {
                const [options] = await pool.query('SELECT * FROM question_options WHERE question_id = ? ORDER BY order_index ASC', [q.id]);
                return { ...q, options: options.map(o => o.text) }; // Mantendo formato do frontend
            }));

            // Busca feedback
            const [feedback] = await pool.query('SELECT * FROM section_feedbacks WHERE section_id = ?', [section.id]);

            return {
                ...section,
                questions: questionsWithChoices,
                feedback: feedback[0] ? {
                    levels: {
                        initial: feedback[0].initial_text,
                        basic: feedback[0].basic_text,
                        intermediate: feedback[0].intermediate_text,
                        advanced: feedback[0].advanced_text
                    }
                } : null
            };
        }));

        res.json(result);
    } catch (error) {
        console.error('Database error in questions:', error);
        res.status(500).json([]);
    }
});

// Salvar Novo Diagnóstico
apiRouter.post('/diagnoses', async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const { id, industry_id, userInfo, total_score, maturity_level, answers, sectionScores } = req.body;

        // 1. Inserir Diagnóstico
        await connection.execute(`
            INSERT INTO diagnoses (
                id, industry_id, user_name, user_email, user_company, user_position, 
                etn, vendedor, tempo_orcamento, pessoas_processo, faturamento, 
                faixa_colaboradores, erp, total_score, maturity_level
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                id, industry_id, userInfo.nome, userInfo.email, userInfo.empresa, userInfo.cargo,
                userInfo.etn || null, userInfo.vendedor || null, userInfo.tempoOrcamento || null,
                userInfo.pessoasProcesso || null, userInfo.faturamento || null,
                userInfo.faixaColaboradores || null, userInfo.erp || null,
                total_score, maturity_level
            ]
        );

        // 2. Inserir Respostas com Snapshot de Texto (para preservar histórico)
        for (const [qId, optIdx] of Object.entries(answers)) {
            // Busca textos no banco para garantir precisão
            const [qRows] = await connection.query('SELECT text FROM questions WHERE id = ?', [qId]);
            const [oRows] = await connection.query(
                'SELECT text FROM question_options WHERE question_id = ? ORDER BY order_index ASC LIMIT 1 OFFSET ?',
                [qId, Number(optIdx)]
            );

            const questionText = qRows[0]?.text || null;
            const answerText = oRows[0]?.text || null;

            await connection.execute(
                'INSERT INTO diagnosis_answers (diagnosis_id, question_id, selected_option_index, score_at_time, question_text_snapshot, answer_text_snapshot) VALUES (?, ?, ?, ?, ?, ?)',
                [id, qId, Number(optIdx), 0, questionText, answerText]
            );
        }

        // 3. Inserir Resultados por Seção
        for (const s of sectionScores) {
            await connection.execute(
                'INSERT INTO diagnosis_section_results (diagnosis_id, section_id, section_title, score, feedback_text) VALUES (?, ?, ?, ?, ?)',
                [id, s.id, s.title, s.score, s.feedback_calculated || null]
            );
        }

        await connection.commit();
        console.log(`[DIAGNOSTICO] Salvo com sucesso. ID: ${id} | Empresa: ${userInfo.empresa} | Score: ${total_score}%`);
        res.status(201).json({ message: 'Diagnóstico salvo com sucesso', id });
    } catch (error) {
        if (connection) await connection.rollback();
        console.error('ERRO AO SALVAR DIAGNÓSTICO:', error);
        res.status(500).json({ error: error.message });
    } finally {
        if (connection) connection.release();
    }
});

// Listar Histórico
apiRouter.get('/history', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT d.*, COALESCE(isw.score_mode, 'percent') AS score_mode
            FROM diagnoses d
            LEFT JOIN industry_scoring_weights isw ON isw.industry_id = d.industry_id
            ORDER BY d.created_at DESC
        `);

        // Mapear para o formato que o frontend espera
        const mappedRows = rows.map(row => ({
            ...row,
            id: row.id,
            company: row.user_company,
            name: row.user_name,
            score: row.total_score,
            date: row.created_at,
            userInfo: {
                nome: row.user_name,
                email: row.user_email,
                empresa: row.user_company,
                cargo: row.user_position,
                etn: row.etn,
                vendedor: row.vendedor,
                tempoOrcamento: row.tempo_orcamento,
                pessoasProcesso: row.pessoas_processo,
                faturamento: row.faturamento,
                faixaColaboradores: row.faixa_colaboradores,
                erp: row.erp
            }
        }));

        res.json(mappedRows);
    } catch (error) {
        console.error('Erro ao buscar histórico:', error);
        res.status(500).json({ error: error.message });
    }
});

// Obter detalhes de um diagnóstico (Respostas e Resultados de Seção)
apiRouter.get('/history/:id/details', async (req, res) => {
    const { id } = req.params;
    try {
        const [answers] = await pool.query('SELECT * FROM diagnosis_answers WHERE diagnosis_id = ?', [id]);
        const [results] = await pool.query('SELECT * FROM diagnosis_section_results WHERE diagnosis_id = ?', [id]);

        // Mapear respostas para o formato { questionId: optionIndex }
        const mappedAnswers = {};
        const answersSnapshot = []; // Lista detalhada com textos preservados
        answers.forEach(ans => {
            mappedAnswers[ans.question_id] = ans.selected_option_index;
            answersSnapshot.push({
                questionId: ans.question_id,
                selectedOptionIndex: ans.selected_option_index,
                questionText: ans.question_text_snapshot || null,
                answerText: ans.answer_text_snapshot || null,
            });
        });

        res.json({
            answers: mappedAnswers,
            answersSnapshot, // Snapshot completo com textos do momento do diagnóstico
            sectionScores: results.map(r => ({
                id: r.section_id,
                title: r.section_title,
                score: parseFloat(r.score),
                subject: r.section_title,
                A: parseFloat(r.score),
                fullMark: 100,
                feedback_calculated: r.feedback_text
            }))
        });
    } catch (error) {
        console.error('Erro ao buscar detalhes do histórico:', error);
        res.status(500).json({ error: error.message });
    }
});

// Excluir um Diagnóstico do Histórico
apiRouter.delete('/history/:id', async (req, res) => {
    const { id } = req.params;
    console.log('Tentando excluir diagnóstico:', id);
    try {
        const [result] = await pool.execute('DELETE FROM diagnoses WHERE id = ?', [id]);
        console.log('Resultado da exclusão:', result);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Diagnóstico não encontrado' });
        }
        res.json({ message: 'Diagnóstico removido com sucesso' });
    } catch (error) {
        console.error('Erro ao excluir histórico:', error);
        res.status(500).json({ error: error.message });
    }
});

// Excluir Vários Diagnósticos (Bulk Delete)
apiRouter.post('/history/delete-many', async (req, res) => {
    const { ids } = req.body;
    console.log('Tentando excluir múltiplos diagnósticos:', ids);
    if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: 'Lista de IDs inválida' });
    }
    try {
        const [result] = await pool.query('DELETE FROM diagnoses WHERE id IN (?)', [ids]);
        console.log('Resultado da exclusão múltipla:', result);
        res.json({ message: `${result.affectedRows} diagnósticos removidos com sucesso` });
    } catch (error) {
        console.error('Erro ao excluir múltiplos históricos:', error);
        res.status(500).json({ error: error.message });
    }
});

// Atualizar Estrutura de Perguntas de uma Indústria
apiRouter.put('/questions/:industryId', async (req, res) => {
    const { industryId } = req.params;
    const sections = req.body;
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        console.log(`[IMPORT-PERGUNTAS] Iniciando atualização para Indústria: ${industryId}`);
        console.log(`[IMPORT-PERGUNTAS] Seções a processar: ${sections.length}`);

        // 1. Limpar seções atuais (Cascade limpará perguntas, opções e feedbacks)
        await connection.execute('DELETE FROM sections WHERE industry_id = ?', [industryId]);

        // 2. Reinserir estrutura
        let totalQuestions = 0;
        for (const [sIdx, section] of sections.entries()) {
            const sId = section.id && !section.id.startsWith('section-') ? section.id : uuidv4();
            await connection.execute(
                'INSERT INTO sections (id, industry_id, title, order_index) VALUES (?, ?, ?, ?)',
                [sId, industryId, section.title, sIdx]
            );

            // Feedbacks
            if (section.feedback?.levels) {
                const fId = uuidv4();
                await connection.execute(
                    'INSERT INTO section_feedbacks (id, section_id, initial_text, basic_text, intermediate_text, advanced_text) VALUES (?, ?, ?, ?, ?, ?)',
                    [fId, sId, section.feedback.levels.initial, section.feedback.levels.basic, section.feedback.levels.intermediate, section.feedback.levels.advanced]
                );
            }

            // Perguntas
            if (section.questions) {
                for (const [qIdx, q] of section.questions.entries()) {
                    totalQuestions++;
                    const qId = q.id && !q.id.startsWith('q-') ? q.id : uuidv4();
                    await connection.execute(
                        'INSERT INTO questions (id, section_id, text, order_index, disabled) VALUES (?, ?, ?, ?, ?)',
                        [qId, sId, q.text, qIdx, q.disabled ? 1 : 0]
                    );

                    // Opções
                    if (q.options) {
                        for (const [oIdx, optText] of q.options.entries()) {
                            await connection.execute(
                                'INSERT INTO question_options (question_id, text, order_index) VALUES (?, ?, ?)',
                                [qId, optText, oIdx]
                            );
                        }
                    }
                }
            }
        }

        await connection.commit();
        console.log(`[IMPORT-PERGUNTAS] Sucesso! ${sections.length} seções e ${totalQuestions} perguntas importadas.`);
        res.json({ message: 'Estrutura atualizada com sucesso' });
    } catch (error) {
        if (connection) await connection.rollback();
        console.error(`[IMPORT-PERGUNTAS-ERRO] Falha na indústria ${industryId}:`, error.message);
        res.status(500).json({ error: error.message });
    } finally {
        if (connection) connection.release();
    }
});

// Importação em Lote de Feedbacks
// Helper: normaliza string para comparação (remove acentos, lowercase, trim)
const normalizeForCompare = (str) => {
    if (!str) return '';
    return str.toString().trim().toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, ' ');
};

apiRouter.post('/questions/import-feedbacks', async (req, res) => {
    const feedbackList = req.body; // Array de { industryName, areaName, feedbacks }
    console.log(`[IMPORT-FEEDBACKS] Iniciando importação em lote para ${feedbackList.length} itens.`);
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        let updatedCount = 0;
        const createdIndustries = [];
        const createdAreas = [];

        // Buscar todos os ramos e seções de uma vez para comparação normalizada
        const [allIndustriesRaw] = await connection.query('SELECT id, name FROM industries');
        const [allSectionsRaw] = await connection.query('SELECT id, industry_id, title FROM sections');

        // Usar arrays mutáveis para adicionar criações feitas neste loop
        const allIndustries = [...allIndustriesRaw];
        const allSections = [...allSectionsRaw];

        for (const item of feedbackList) {
            if (!item.industryName || !item.areaName) continue;

            const normIndustryName = normalizeForCompare(item.industryName);

            // 1. Achar ou CRIAR Indústria
            let matchedIndustry = allIndustries.find(i => normalizeForCompare(i.name) === normIndustryName);

            if (!matchedIndustry) {
                const newId = uuidv4();
                console.log(`[import-feedbacks] Criando ramo: "${item.industryName}"`);
                await connection.execute(
                    'INSERT INTO industries (id, name, active) VALUES (?, ?, 1)',
                    [newId, item.industryName.trim()]
                );
                // Inserir pesos padrão (Tabela correta: industry_scoring_weights)
                await connection.execute(
                    'INSERT INTO industry_scoring_weights (industry_id, option_a_weight, option_b_weight, option_c_weight, option_d_weight) VALUES (?, 0, 33, 66, 100)',
                    [newId]
                );
                matchedIndustry = { id: newId, name: item.industryName.trim() };
                allIndustries.push(matchedIndustry);
                createdIndustries.push(item.industryName.trim());
            }

            // Trava para o Ramo Geral no import de feedbacks
            if (matchedIndustry.id === 'default-geral') {
                console.warn(`[import-feedbacks] Tentativa de alterar feedback do Ramo Geral ignorada.`);
                continue;
            }

            const normAreaName = normalizeForCompare(item.areaName);

            // 2. Achar ou CRIAR Seção
            let matchedSection = allSections.find(
                s => s.industry_id === matchedIndustry.id && normalizeForCompare(s.title) === normAreaName
            );

            if (!matchedSection) {
                const newSectionId = uuidv4();
                console.log(`[import-feedbacks] Criando área: "${item.areaName}" no ramo "${item.industryName}"`);
                await connection.execute(
                    'INSERT INTO sections (id, industry_id, title, order_index) VALUES (?, ?, ?, 0)',
                    [newSectionId, matchedIndustry.id, item.areaName.trim()]
                );
                matchedSection = { id: newSectionId, industry_id: matchedIndustry.id, title: item.areaName.trim() };
                allSections.push(matchedSection);
                createdAreas.push(`${item.industryName} > ${item.areaName}`);
            }

            const sectionId = matchedSection.id;

            // 3. Atualizar ou Inserir Feedback
            const [existing] = await connection.query('SELECT id FROM section_feedbacks WHERE section_id = ?', [sectionId]);
            if (existing.length > 0) {
                await connection.execute(
                    'UPDATE section_feedbacks SET initial_text = ?, basic_text = ?, intermediate_text = ?, advanced_text = ? WHERE section_id = ?',
                    [item.feedbacks.initial, item.feedbacks.basic, item.feedbacks.intermediate, item.feedbacks.advanced, sectionId]
                );
            } else {
                await connection.execute(
                    'INSERT INTO section_feedbacks (id, section_id, initial_text, basic_text, intermediate_text, advanced_text) VALUES (?, ?, ?, ?, ?, ?)',
                    [uuidv4(), sectionId, item.feedbacks.initial, item.feedbacks.basic, item.feedbacks.intermediate, item.feedbacks.advanced]
                );
            }
            updatedCount++;
        }

        await connection.commit();
        console.log(`[import-feedbacks] Concluído: ${updatedCount} feedbacks, ${createdIndustries.length} ramos criados, ${createdAreas.length} áreas criadas.`);
        res.json({ updatedCount, createdIndustries, createdAreas });
    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Erro no import de feedbacks:', error);
        res.status(500).json({ error: error.message });
    } finally {
        if (connection) connection.release();
    }
});

// Duplicar Estrutura ou Feedbacks entre Ramos
apiRouter.post('/questions/duplicate', async (req, res) => {
    const { source, target } = req.body;

    // Trava para o Ramo Geral
    if (target.industryId === 'default-geral') {
        return res.status(403).json({ error: 'Não é permitido alterar a estrutura do Ramo Geral via duplicação.' });
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        let query = 'SELECT * FROM sections WHERE industry_id = ?';
        let params = [source.industryId];
        if (source.sectionId) {
            query += ' AND id = ?';
            params.push(source.sectionId);
        }
        const [sections] = await connection.query(query, params);

        for (const section of sections) {
            let targetSectionId;
            const [existing] = await connection.query('SELECT id FROM sections WHERE industry_id = ? AND title = ?', [target.industryId, section.title]);

            if (existing.length > 0) {
                targetSectionId = existing[0].id;
            } else if (!target.sectionId) {
                targetSectionId = uuidv4();
                await connection.execute(
                    'INSERT INTO sections (id, industry_id, title, order_index) VALUES (?, ?, ?, ?)',
                    [targetSectionId, target.industryId, section.title, section.order_index]
                );
            } else {
                continue;
            }

            // --- DUPLICAÇÃO DE PERGUNTAS E OPÇÕES ---
            // 1. Buscar perguntas da seção de origem
            const [questions] = await connection.query('SELECT * FROM questions WHERE section_id = ?', [section.id]);

            for (const q of questions) {
                const newQuestionId = uuidv4();

                // 2. Inserir a pergunta na nova seção (ou mesma se já existir e estivermos apenas populando)
                await connection.execute(
                    'INSERT INTO questions (id, section_id, text, order_index, disabled) VALUES (?, ?, ?, ?, ?)',
                    [newQuestionId, targetSectionId, q.text, q.order_index, q.disabled]
                );

                // 3. Buscar e inserir opções para esta pergunta
                const [options] = await connection.query('SELECT * FROM question_options WHERE question_id = ?', [q.id]);
                for (const opt of options) {
                    await connection.execute(
                        'INSERT INTO question_options (question_id, text, order_index) VALUES (?, ?, ?)',
                        [newQuestionId, opt.text, opt.order_index]
                    );
                }
            }

            const [feedbacks] = await connection.query('SELECT * FROM section_feedbacks WHERE section_id = ?', [section.id]);
            if (feedbacks.length > 0) {
                const f = feedbacks[0];
                const [targetFeedbacks] = await connection.query('SELECT id FROM section_feedbacks WHERE section_id = ?', [targetSectionId]);
                if (targetFeedbacks.length > 0) {
                    await connection.execute(
                        'UPDATE section_feedbacks SET initial_text = ?, basic_text = ?, intermediate_text = ?, advanced_text = ? WHERE section_id = ?',
                        [f.initial_text, f.basic_text, f.intermediate_text, f.advanced_text, targetSectionId]
                    );
                } else {
                    await connection.execute(
                        'INSERT INTO section_feedbacks (id, section_id, initial_text, basic_text, intermediate_text, advanced_text) VALUES (?, ?, ?, ?, ?, ?)',
                        [uuidv4(), targetSectionId, f.initial_text, f.basic_text, f.intermediate_text, f.advanced_text]
                    );
                }
            }
        }

        await connection.commit();
        res.json({ success: true, message: 'Duplicação concluída' });
    } catch (error) {
        if (connection) await connection.rollback();
        res.status(500).json({ error: error.message });
    } finally {
        if (connection) connection.release();
    }
});

// --- ROTAS DE AUTENTICAÇÃO E SEGURANÇA ---

// Login simplificado (verificando no banco)
apiRouter.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const [rows] = await pool.query('SELECT * FROM users WHERE username = ? AND password_hash = ?', [username, password]);
        if (rows.length > 0) {
            res.json({ success: true, user: { id: rows[0].id, username: rows[0].username } });
        } else {
            res.status(401).json({ success: false, message: 'Usuário ou senha inválidos' });
        }
    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ error: error.message, detail: 'Erro ao verificar credenciais no banco de dados' });
    }
});

// Alterar Senha
apiRouter.post('/admin/change-password', async (req, res) => {
    const { username, currentPassword, newPassword } = req.body;
    try {
        // Verifica se a senha atual está correta
        const [rows] = await pool.query('SELECT * FROM users WHERE username = ? AND password_hash = ?', [username, currentPassword]);

        if (rows.length === 0) {
            return res.status(401).json({ success: false, message: 'Senha atual incorreta' });
        }

        // Atualiza para a nova senha
        await pool.execute('UPDATE users SET password_hash = ? WHERE username = ?', [newPassword, username]);

        res.json({ success: true, message: 'Senha alterada com sucesso' });
    } catch (error) {
        console.error('Erro ao alterar senha:', error);
        res.status(500).json({ error: error.message });
    }
});

// Vincular as rotas à aplicação com suporte a ambos prefixos (local e proxy nginx)
app.use('/api', apiRouter);
app.use('/', apiRouter);

// Rota para capturar 404 e ajudar no debug de caminhos
app.use((req, res) => {
    console.warn(`[404] Rota não encontrada: ${req.method} ${req.url}`);
    res.status(404).json({ error: 'Rota não encontrada', path: req.url });
});

// Middleware de erro global
app.use((err, req, res, next) => {
    console.error('[500] Erro interno do servidor:', err);
    res.status(500).json({ error: 'Erro interno do servidor', detail: err.message });
});

app.listen(port, async () => {
    console.log(`Backend DCVB rodando em http://localhost:${port}`);
    await runMigrations();
});
