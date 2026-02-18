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

// Rota de Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// --- ROTAS DO SISTEMA ---

// Listar Indústrias
app.get('/industries', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM industries WHERE active = 1 ORDER BY created_at ASC');
        const mappedRows = Array.isArray(rows) ? rows.map(row => ({
            ...row,
            isFixed: row.is_fixed === 1 || row.is_fixed === true
        })) : [];
        res.json(mappedRows);
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json([]); // Retorna array vazio em caso de erro para não quebrar o frontend
    }
});

// Adicionar Nova Indústria
app.post('/industries', async (req, res) => {
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
        console.log('Indústria adicionada com sucesso!');
        res.status(201).json({ id, name, active: 1, isFixed: false });
    } catch (error) {
        if (connection) await connection.rollback();
        console.error('ERRO CRÍTICO AO ADICIONAR INDÚSTRIA:', error);
        res.status(500).json({ error: error.message, stack: error.stack });
    } finally {
        if (connection) connection.release();
    }
});

// Atualizar Nome da Indústria
app.put('/industries/:id', async (req, res) => {
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
app.patch('/industries/:id/toggle', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.execute('UPDATE industries SET active = 1 - active WHERE id = ?', [id]);
        res.json({ message: 'Status alterado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Excluir Indústria
app.delete('/industries/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.execute('DELETE FROM industries WHERE id = ?', [id]);
        res.json({ message: 'Indústria removida' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Obter Perguntas por Indústria
app.get('/questions/:industryId', async (req, res) => {
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
app.post('/diagnoses', async (req, res) => {
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

        // 2. Inserir Respostas
        for (const [qId, optIdx] of Object.entries(answers)) {
            await connection.execute(
                'INSERT INTO diagnosis_answers (diagnosis_id, question_id, selected_option_index, score_at_time) VALUES (?, ?, ?, ?)',
                [id, qId, optIdx, 0] // score_at_time pode ser calculado aqui se necessário
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
app.get('/history', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM diagnoses ORDER BY created_at DESC');

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
app.get('/history/:id/details', async (req, res) => {
    const { id } = req.params;
    try {
        const [answers] = await pool.query('SELECT * FROM diagnosis_answers WHERE diagnosis_id = ?', [id]);
        const [results] = await pool.query('SELECT * FROM diagnosis_section_results WHERE diagnosis_id = ?', [id]);

        // Mapear respostas para o formato { questionId: optionIndex }
        const mappedAnswers = {};
        answers.forEach(ans => {
            mappedAnswers[ans.question_id] = ans.selected_option_index;
        });

        res.json({
            answers: mappedAnswers,
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
app.delete('/history/:id', async (req, res) => {
    const { id } = req.params;
    try {
        // O MySQL com ON DELETE CASCADE nas tabelas diagnosis_answers e diagnosis_section_results
        // cuidará de remover os detalhes automaticamente.
        await pool.execute('DELETE FROM diagnoses WHERE id = ?', [id]);
        res.json({ message: 'Diagnóstico removido com sucesso' });
    } catch (error) {
        console.error('Erro ao excluir histórico:', error);
        res.status(500).json({ error: error.message });
    }
});

// Excluir Vários Diagnósticos (Bulk Delete)
app.post('/history/delete-many', async (req, res) => {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: 'Lista de IDs inválida' });
    }
    try {
        await pool.query('DELETE FROM diagnoses WHERE id IN (?)', [ids]);
        res.json({ message: `${ids.length} diagnósticos removidos com sucesso` });
    } catch (error) {
        console.error('Erro ao excluir múltiplos históricos:', error);
        res.status(500).json({ error: error.message });
    }
});

// Atualizar Estrutura de Perguntas de uma Indústria
app.put('/questions/:industryId', async (req, res) => {
    const { industryId } = req.params;
    const sections = req.body;
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Limpar seções atuais (Cascade limpará perguntas, opções e feedbacks)
        await connection.execute('DELETE FROM sections WHERE industry_id = ?', [industryId]);

        // 2. Reinserir estrutura
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
        res.json({ message: 'Estrutura atualizada com sucesso' });
    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Erro ao salvar perguntas:', error);
        res.status(500).json({ error: error.message });
    } finally {
        if (connection) connection.release();
    }
});

// --- ROTAS DE AUTENTICAÇÃO E SEGURANÇA ---

// Login simplificado (verificando no banco)
app.post('/login', async (req, res) => {
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
app.post('/admin/change-password', async (req, res) => {
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

app.listen(port, () => {
    console.log(`Backend DCVB rodando em http://localhost:${port}`);
});
