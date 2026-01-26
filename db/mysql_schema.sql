-- DCVB - Sistema de Diagnóstico de Maturidade Orçamentária
-- MySQL Schema (Revisado e Completo)

CREATE DATABASE IF NOT EXISTS dcvb_db;
USE dcvb_db;

-- 1. TABELA DE USUÁRIOS (Administrativo)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. TABELA DE INDÚSTRIAS (RAMOS DE ATIVIDADE)
CREATE TABLE IF NOT EXISTS industries (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    active TINYINT(1) DEFAULT 1,
    is_fixed TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 3. CONFIGURAÇÃO DE PESOS (A, B, C, D) POR RAMO
CREATE TABLE IF NOT EXISTS industry_scoring_weights (
    industry_id VARCHAR(36) PRIMARY KEY,
    option_a_weight INT DEFAULT 0,
    option_b_weight INT DEFAULT 33,
    option_c_weight INT DEFAULT 66,
    option_d_weight INT DEFAULT 100,
    CONSTRAINT fk_scoring_industry FOREIGN KEY (industry_id) REFERENCES industries(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 4. TABELA DE ÁREAS (SEÇÕES)
CREATE TABLE IF NOT EXISTS sections (
    id VARCHAR(36) PRIMARY KEY,
    industry_id VARCHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    order_index INT DEFAULT 0,
    CONSTRAINT fk_sections_industry FOREIGN KEY (industry_id) REFERENCES industries(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 5. TEXTOS DE FEEDBACK POR ÁREA E NÍVEL
CREATE TABLE IF NOT EXISTS section_feedbacks (
    id VARCHAR(36) PRIMARY KEY,
    section_id VARCHAR(36) NOT NULL UNIQUE,
    initial_text TEXT,      -- 0% - 25%
    basic_text TEXT,        -- 26% - 50%
    intermediate_text TEXT, -- 51% - 75%
    advanced_text TEXT,     -- 76% - 100%
    CONSTRAINT fk_feedbacks_section FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 6. TABELA DE PERGUNTAS
CREATE TABLE IF NOT EXISTS questions (
    id VARCHAR(36) PRIMARY KEY,
    section_id VARCHAR(36) NOT NULL,
    text TEXT NOT NULL,
    order_index INT DEFAULT 0,
    disabled TINYINT(1) DEFAULT 0,
    CONSTRAINT fk_questions_section FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 7. OPÇÕES DE PERGUNTA (Texto das opções)
CREATE TABLE IF NOT EXISTS question_options (
    id INT AUTO_INCREMENT PRIMARY KEY,
    question_id VARCHAR(36) NOT NULL,
    text VARCHAR(255) NOT NULL,
    order_index INT DEFAULT 0,
    CONSTRAINT fk_options_question FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 8. TABELA DE DIAGNÓSTICOS (CABEÇALHO)
CREATE TABLE IF NOT EXISTS diagnoses (
    id VARCHAR(36) PRIMARY KEY,
    industry_id VARCHAR(36) NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    user_company VARCHAR(255) NOT NULL,
    user_position VARCHAR(255) NOT NULL,
    ramo_atividade_texto VARCHAR(255),
    etn VARCHAR(100),
    vendedor VARCHAR(255),
    tempo_orcamento VARCHAR(100),
    pessoas_processo VARCHAR(100),
    faturamento VARCHAR(100),
    faixa_colaboradores VARCHAR(100),
    erp VARCHAR(100),
    total_score DECIMAL(5,2) DEFAULT 0,
    maturity_level VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_diag_industry FOREIGN KEY (industry_id) REFERENCES industries(id)
) ENGINE=InnoDB;

-- 9. RESPOSTAS DETALHADAS
CREATE TABLE IF NOT EXISTS diagnosis_answers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    diagnosis_id VARCHAR(36) NOT NULL,
    question_id VARCHAR(36) NOT NULL,
    selected_option_index INT NOT NULL,
    score_at_time INT NOT NULL,
    CONSTRAINT fk_ans_diagnosis FOREIGN KEY (diagnosis_id) REFERENCES diagnoses(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 10. RESULTADOS POR ÁREA
CREATE TABLE IF NOT EXISTS diagnosis_section_results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    diagnosis_id VARCHAR(36) NOT NULL,
    section_id VARCHAR(36) NOT NULL,
    section_title VARCHAR(255) NOT NULL,
    score DECIMAL(5,2) NOT NULL,
    feedback_text TEXT,
    CONSTRAINT fk_res_diagnosis FOREIGN KEY (diagnosis_id) REFERENCES diagnoses(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Inserção de usuário administrador inicial (senha: admin123 - Ideal trocar após migração para API)
INSERT IGNORE INTO users (username, password_hash, role) VALUES ('admin', 'admin123', 'admin');
