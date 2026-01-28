-- DCVB - Sistema de Diagnóstico de Maturidade Orçamentária
-- SQLite Database Schema

-- 1. Industries (Ramos de Atividade / Segmentos)
CREATE TABLE industries (
    id TEXT PRIMARY KEY, -- UUID
    name TEXT NOT NULL,
    active INTEGER DEFAULT 1, -- 0 = Inativo, 1 = Ativo
    is_fixed INTEGER DEFAULT 0, -- Se é o registro padrão 'Geral'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Sections (Áreas do Diagnóstico: Controladoria, Comercial, etc.)
CREATE TABLE sections (
    id TEXT PRIMARY KEY, -- UUID
    industry_id TEXT NOT NULL,
    title TEXT NOT NULL,
    order_index INTEGER DEFAULT 0,
    FOREIGN KEY (industry_id) REFERENCES industries(id) ON DELETE CASCADE
);

-- 3. Questions (Perguntas por Área)
CREATE TABLE questions (
    id TEXT PRIMARY KEY, -- UUID
    section_id TEXT NOT NULL,
    text TEXT NOT NULL,
    order_index INTEGER DEFAULT 0,
    FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE
);

-- 4. Question Options (Opções de resposta para pontuação)
CREATE TABLE question_options (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question_id TEXT NOT NULL,
    text TEXT NOT NULL,
    score_value INTEGER NOT NULL, -- Geralmente 0, 1, 2, 3
    order_index INTEGER DEFAULT 0,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

-- 5. Section Feedbacks (Textos de recomendações baseados no nível de maturidade)
CREATE TABLE section_feedbacks (
    id TEXT PRIMARY KEY, -- UUID
    section_id TEXT NOT NULL UNIQUE,
    initial_text TEXT,      -- Nível 1
    basic_text TEXT,        -- Nível 2
    intermediate_text TEXT, -- Nível 3
    advanced_text TEXT,     -- Nível 4
    FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE
);

-- 6. Industry Scoring Weights (Pesos para A, B, C, D por indústria)
CREATE TABLE industry_scoring_weights (
    industry_id TEXT PRIMARY KEY,
    option_a_weight INTEGER DEFAULT 0,
    option_b_weight INTEGER DEFAULT 33,
    option_c_weight INTEGER DEFAULT 66,
    option_d_weight INTEGER DEFAULT 100,
    FOREIGN KEY (industry_id) REFERENCES industries(id) ON DELETE CASCADE
);

-- 7. Scoring Configurations (Limites de pontuação para níveis de maturidade por indústria)
CREATE TABLE scoring_configs (
    industry_id TEXT PRIMARY KEY,
    level_1_limit INTEGER DEFAULT 0,
    level_2_limit INTEGER DEFAULT 33,
    level_3_limit INTEGER DEFAULT 66,
    level_4_limit INTEGER DEFAULT 100,
    FOREIGN KEY (industry_id) REFERENCES industries(id) ON DELETE CASCADE
);

-- 8. Diagnoses (Cabeçalho do Diagnóstico realizado / Histórico)
CREATE TABLE diagnoses (
    id TEXT PRIMARY KEY, -- UUID
    industry_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    user_company TEXT NOT NULL,
    user_position TEXT,
    user_email TEXT,
    user_etn TEXT,
    user_seller TEXT,
    total_score REAL DEFAULT 0,
    maturity_level TEXT, -- 'Inicial', 'Básico', 'Intermediário', 'Avançado'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (industry_id) REFERENCES industries(id)
);

-- 9. Diagnosis Answers (Respostas individuais de cada diagnóstico)
CREATE TABLE diagnosis_answers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    diagnosis_id TEXT NOT NULL,
    question_id TEXT NOT NULL,
    selected_option_id INTEGER NOT NULL,
    score_value INTEGER NOT NULL,
    FOREIGN KEY (diagnosis_id) REFERENCES diagnoses(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(id),
    FOREIGN KEY (selected_option_id) REFERENCES question_options(id)
);

-- 10. Diagnosis Section Results (Resumo por área para o relatório)
CREATE TABLE diagnosis_section_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    diagnosis_id TEXT NOT NULL,
    section_id TEXT NOT NULL,
    section_title TEXT NOT NULL,
    score REAL NOT NULL,
    feedback_text TEXT,
    FOREIGN KEY (diagnosis_id) REFERENCES diagnoses(id) ON DELETE CASCADE,
    FOREIGN KEY (section_id) REFERENCES sections(id)
);

-- Índices para performance
CREATE INDEX idx_sections_industry ON sections(industry_id);
CREATE INDEX idx_questions_section ON questions(section_id);
CREATE INDEX idx_answers_diagnosis ON diagnosis_answers(diagnosis_id);
CREATE INDEX idx_results_diagnosis ON diagnosis_section_results(diagnosis_id);
-- 11. Users (Administradores do sistema)
CREATE TABLE users (
    id TEXT PRIMARY KEY, -- UUID
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL, -- Senha
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
