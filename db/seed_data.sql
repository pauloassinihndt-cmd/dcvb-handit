-- Inserção de Dados Iniciais para o DCVB
USE dcvb_db;

-- 1. Indústria Padrão
INSERT IGNORE INTO industries (id, name, active, is_fixed) VALUES ('default-geral', 'Geral', 1, 1);

-- 2. Pesos de Pontuação (Padrão 0, 33, 66, 100)
INSERT IGNORE INTO industry_scoring_weights (industry_id, option_a_weight, option_b_weight, option_c_weight, option_d_weight) 
VALUES ('default-geral', 0, 33, 66, 100);

-- 3. Seções, Perguntas e Opções
-- As seções e perguntas serão inseridas com IDs fixos para facilitar referências futuras

-- SEÇÃO: GERAIS
SET @section_gerais = 'gerais';
INSERT IGNORE INTO sections (id, industry_id, title, order_index) VALUES (@section_gerais, 'default-geral', 'Gerais', 0);

INSERT IGNORE INTO section_feedbacks (id, section_id, initial_text, basic_text, intermediate_text, advanced_text) 
VALUES (UUID(), @section_gerais, 
'Nível Inicial: Processos ainda não estruturados.', 
'Nível Básico: Existem controles, mas manuais e pouco integrados.', 
'Nível Intermediário: Processos definidos e parcialmente automatizados.', 
'Nível Avançado: Gestão otimizada com alta automação e uso de dados.');

-- Perguntas da Seção Gerais
INSERT IGNORE INTO questions (id, section_id, text, order_index) VALUES ('q1', @section_gerais, 'Qual é a percepção geral sobre o processo orçamentário na empresa?', 0);
INSERT IGNORE INTO question_options (question_id, text, order_index) VALUES ('q1', 'Caótico e manual', 0), ('q1', 'Organizado mas desconectado', 1), ('q1', 'Integrado e fluido', 2), ('q1', 'Altamente estratégico e automatizado', 3);

INSERT IGNORE INTO questions (id, section_id, text, order_index) VALUES ('q2', @section_gerais, 'Quanto tempo a empresa leva para fechar o ciclo orçamentário?', 1);
INSERT IGNORE INTO question_options (question_id, text, order_index) VALUES ('q2', 'Mais de 4 meses', 0), ('q2', '2 a 4 meses', 1), ('q2', '1 a 2 meses', 2), ('q2', 'Menos de 1 mês', 3);

INSERT IGNORE INTO questions (id, section_id, text, order_index) VALUES ('q3', @section_gerais, 'Qual o nível de confiança nos dados orçados?', 2);
INSERT IGNORE INTO question_options (question_id, text, order_index) VALUES ('q3', 'Baixo', 0), ('q3', 'Médio', 1), ('q3', 'Alto', 2), ('q3', 'Total', 3);

INSERT IGNORE INTO questions (id, section_id, text, order_index) VALUES ('q4', @section_gerais, 'Com que frequência o orçamento é revisado?', 3);
INSERT IGNORE INTO question_options (question_id, text, order_index) VALUES ('q4', 'Nunca', 0), ('q4', 'Anualmente', 1), ('q4', 'Semestralmente', 2), ('q4', 'Mensalmente/Trimestralmente', 3);

INSERT IGNORE INTO questions (id, section_id, text, order_index) VALUES ('q5', @section_gerais, 'Qual a principal ferramenta utilizada?', 4);
INSERT IGNORE INTO question_options (question_id, text, order_index) VALUES ('q5', 'Papel/Planilhas manuais', 0), ('q5', 'Planilhas complexas com macros', 1), ('q5', 'ERP básico', 2), ('q5', 'Sistema de gestão orçamentária dedicado (EPM/CPM)', 3);

INSERT IGNORE INTO questions (id, section_id, text, order_index) VALUES ('q6', @section_gerais, 'Como é o envolvimento dos gestores no processo?', 5);
INSERT IGNORE INTO question_options (question_id, text, order_index) VALUES ('q6', 'Nenhum', 0), ('q6', 'Baixo/Forçado', 1), ('q6', 'Médio/Colaborativo', 2), ('q6', 'Alto/Donos do número', 3);


-- SEÇÃO: CONTROLADORIA FP&A
SET @section_control = 'controladoria';
INSERT IGNORE INTO sections (id, industry_id, title, order_index) VALUES (@section_control, 'default-geral', 'Controladoria FP&A', 1);

INSERT IGNORE INTO section_feedbacks (id, section_id, initial_text, basic_text, intermediate_text, advanced_text) 
VALUES (UUID(), @section_control, 
'Nível Inicial: Processos ainda não estruturados.', 
'Nível Básico: Existem controles, mas manuais e pouco integrados.', 
'Nível Intermediário: Processos definidos e parcialmente automatizados.', 
'Nível Avançado: Gestão otimizada com alta automação e uso de dados.');

INSERT IGNORE INTO questions (id, section_id, text, order_index) VALUES ('c1', @section_control, 'A controladoria atua mais como?', 0);
INSERT IGNORE INTO question_options (question_id, text, order_index) VALUES ('c1', 'Compiladora de dados', 0), ('c1', 'Auditora de números', 1), ('c1', 'Parceira de negócios', 2), ('c1', 'Estratega do negócio', 3);

INSERT IGNORE INTO questions (id, section_id, text, order_index) VALUES ('c2', @section_control, 'Como é feito o DRE Orçado?', 1);
INSERT IGNORE INTO question_options (question_id, text, order_index) VALUES ('c2', 'Não é feito', 0), ('c2', 'Manual em Excel', 1), ('c2', 'Parcialmente automatizado', 2), ('c2', 'Totalmente integrado ao realizado', 3);

INSERT IGNORE INTO questions (id, section_id, text, order_index) VALUES ('c3', @section_control, 'Existe projeção de Fluxo de Caixa indireto?', 2);
INSERT IGNORE INTO question_options (question_id, text, order_index) VALUES ('c3', 'Não', 0), ('c3', 'Sim, manual', 1), ('c3', 'Sim, automatizado', 2), ('c3', 'Sim, com cenários em tempo real', 3);

INSERT IGNORE INTO questions (id, section_id, text, order_index) VALUES ('c4', @section_control, 'O Balanço Patrimonial é projetado?', 3);
INSERT IGNORE INTO question_options (question_id, text, order_index) VALUES ('c4', 'Não', 0), ('c4', 'Raramente', 1), ('c4', 'Sim, mas desconectado', 2), ('c4', 'Sim, integrado ao DRE e Caixa', 3);

INSERT IGNORE INTO questions (id, section_id, text, order_index) VALUES ('c5', @section_control, 'Qual o nível de detalhe das despesas?', 4);
INSERT IGNORE INTO question_options (question_id, text, order_index) VALUES ('c5', 'Conta contábil apenas', 0), ('c5', 'Centro de Custo', 1), ('c5', 'Centro de Custo + Projeto/Atividade', 2), ('c5', 'Multidimensional (CC, Projeto, Produto, etc)', 3);

INSERT IGNORE INTO questions (id, section_id, text, order_index) VALUES ('c6', @section_control, 'Como são tratados os rateios de despesas?', 5);
INSERT IGNORE INTO question_options (question_id, text, order_index) VALUES ('c6', 'Não existem', 0), ('c6', 'Base fixa/manual', 1), ('c6', 'Drivers simples', 2), ('c6', 'Drivers dinâmicos e múltiplos estágios', 3);


-- SEÇÃO: COMERCIAL
SET @section_comercial = 'comercial';
INSERT IGNORE INTO sections (id, industry_id, title, order_index) VALUES (@section_comercial, 'default-geral', 'Comercial', 2);

INSERT IGNORE INTO section_feedbacks (id, section_id, initial_text, basic_text, intermediate_text, advanced_text) 
VALUES (UUID(), @section_comercial, 
'Nível Inicial: Processos ainda não estruturados.', 
'Nível Básico: Existem controles, mas manuais e pouco integrados.', 
'Nível Intermediário: Processos definidos e parcialmente automatizados.', 
'Nível Avançado: Gestão otimizada com alta automação e uso de dados.');

INSERT IGNORE INTO questions (id, section_id, text, order_index) VALUES ('v1', @section_comercial, 'Como é feita a projeção de vendas?', 0);
INSERT IGNORE INTO question_options (question_id, text, order_index) VALUES ('v1', 'Meta Top-Down apenas', 0), ('v1', 'Baseada em histórico', 1), ('v1', 'Colaborativa (Bottom-up)', 2), ('v1', 'Preditiva com drivers de mercado', 3);

INSERT IGNORE INTO questions (id, section_id, text, order_index) VALUES ('v2', @section_comercial, 'Existe orçamento de volume x preço?', 1);
INSERT IGNORE INTO question_options (question_id, text, order_index) VALUES ('v2', 'Não, apenas valor total', 0), ('v2', 'Em alguns produtos', 1), ('v2', 'Sim, para principais linhas', 2), ('v2', 'Sim, para todo o mix', 3);

INSERT IGNORE INTO questions (id, section_id, text, order_index) VALUES ('v3', @section_comercial, 'O orçamento de deduções de vendas é detalhado?', 2);
INSERT IGNORE INTO question_options (question_id, text, order_index) VALUES ('v3', 'Percentual fixo sobre Venda Bruta', 0), ('v3', 'Por canal/produto (médio)', 1), ('v3', 'Cálculo imposto a imposto', 2), ('v3', 'Detalhado por cliente/SKU e tributo', 3);

INSERT IGNORE INTO questions (id, section_id, text, order_index) VALUES ('v4', @section_comercial, 'Existe simulação de cenários de vendas?', 3);
INSERT IGNORE INTO question_options (question_id, text, order_index) VALUES ('v4', 'Não', 0), ('v4', 'Apenas otimista/pessimista', 1), ('v4', 'Simulações manuais', 2), ('v4', 'Simulações dinâmicas (what-if)', 3);

INSERT IGNORE INTO questions (id, section_id, text, order_index) VALUES ('v5', @section_comercial, 'A equipe comercial tem acesso fácil às suas metas e real?', 4);
INSERT IGNORE INTO question_options (question_id, text, order_index) VALUES ('v5', 'Não', 0), ('v5', 'Recebem relatórios estáticos', 1), ('v5', 'Acesso limitado', 2), ('v5', 'Dashboard online em tempo real', 3);

INSERT IGNORE INTO questions (id, section_id, text, order_index) VALUES ('v6', @section_comercial, 'Existe cálculo de comissões no orçamento?', 5);
INSERT IGNORE INTO question_options (question_id, text, order_index) VALUES ('v6', 'Não', 0), ('v6', 'Estimativa global', 1), ('v6', 'Por vendedor', 2), ('v6', 'Regra detalhada por SKU/Canal', 3);


-- SEÇÃO: OPERAÇÕES
SET @section_operacoes = 'operacoes';
INSERT IGNORE INTO sections (id, industry_id, title, order_index) VALUES (@section_operacoes, 'default-geral', 'Operações', 3);

INSERT IGNORE INTO section_feedbacks (id, section_id, initial_text, basic_text, intermediate_text, advanced_text) 
VALUES (UUID(), @section_operacoes, 
'Nível Inicial: Processos ainda não estruturados.', 
'Nível Básico: Existem controles, mas manuais e pouco integrados.', 
'Nível Intermediário: Processos definidos e parcialmente automatizados.', 
'Nível Avançado: Gestão otimizada com alta automação e uso de dados.');

INSERT IGNORE INTO questions (id, section_id, text, order_index) VALUES ('o1', @section_operacoes, 'Como é o orçamento de produção/serviços?', 0);
INSERT IGNORE INTO question_options (question_id, text, order_index) VALUES ('o1', 'Baseado em histórico financeiro', 0), ('o1', 'Baseado em volume de vendas', 1), ('o1', 'BOM (Ficha Técnica) explodida', 2), ('o1', 'BOM + Capacidade instalada (MRP)', 3);

INSERT IGNORE INTO questions (id, section_id, text, order_index) VALUES ('o2', @section_operacoes, 'Os custos variáveis são calculados como?', 1);
INSERT IGNORE INTO question_options (question_id, text, order_index) VALUES ('o2', '% da Receita', 0), ('o2', 'Custo médio histórico', 1), ('o2', 'Custo padrão', 2), ('o2', 'Custo padrão com revisão periódica', 3);

INSERT IGNORE INTO questions (id, section_id, text, order_index) VALUES ('o3', @section_operacoes, 'Existe orçamento de investimentos (CAPEX)?', 2);
INSERT IGNORE INTO question_options (question_id, text, order_index) VALUES ('o3', 'Não', 0), ('o3', 'Lista de desejos', 1), ('o3', 'Projetos aprovados', 2), ('o3', 'Gestão de portfólio de projetos com ROI', 3);

INSERT IGNORE INTO questions (id, section_id, text, order_index) VALUES ('o4', @section_operacoes, 'Como é projetado o headcount operacional?', 3);
INSERT IGNORE INTO question_options (question_id, text, order_index) VALUES ('o4', 'Manual/Global', 0), ('o4', 'Por setor', 1), ('o4', 'Baseado em drivers de volume', 2), ('o4', 'Otimizado por turno/capacidade', 3);

INSERT IGNORE INTO questions (id, section_id, text, order_index) VALUES ('o5', @section_operacoes, 'Existe controle de estoques projetado?', 4);
INSERT IGNORE INTO question_options (question_id, text, order_index) VALUES ('o5', 'Não', 0), ('o5', 'Giro médio global', 1), ('o5', 'Giro por categoria', 2), ('o5', 'Giro por SKU e política de cobertura', 3);

INSERT IGNORE INTO questions (id, section_id, text, order_index) VALUES ('o6', @section_operacoes, 'A manutenção é orçada?', 5);
INSERT IGNORE INTO question_options (question_id, text, order_index) VALUES ('o6', 'Não', 0), ('o6', 'Valor fixo mensal', 1), ('o6', 'Base zero', 2), ('o6', 'Preventiva/Corretiva baseada em ativos', 3);


-- SEÇÃO: PESSOAS (RH)
SET @section_pessoas = 'pessoas';
INSERT IGNORE INTO sections (id, industry_id, title, order_index) VALUES (@section_pessoas, 'default-geral', 'Pessoas (RH)', 4);

INSERT IGNORE INTO section_feedbacks (id, section_id, initial_text, basic_text, intermediate_text, advanced_text) 
VALUES (UUID(), @section_pessoas, 
'Nível Inicial: Processos ainda não estruturados.', 
'Nível Básico: Existem controles, mas manuais e pouco integrados.', 
'Nível Intermediário: Processos definidos e parcialmente automatizados.', 
'Nível Avançado: Gestão otimizada com alta automação e uso de dados.');

INSERT IGNORE INTO questions (id, section_id, text, order_index) VALUES ('r1', @section_pessoas, 'Como é feito o orçamento de folha?', 0);
INSERT IGNORE INTO question_options (question_id, text, order_index) VALUES ('r1', 'Linha única de custo', 0), ('r1', 'Por centro de custo', 1), ('r1', 'Por cargo/salário médio', 2), ('r1', 'Matricial (colaborador a colaborador)', 3);

INSERT IGNORE INTO questions (id, section_id, text, order_index) VALUES ('r2', @section_pessoas, 'Os encargos e benefícios são calculados como?', 1);
INSERT IGNORE INTO question_options (question_id, text, order_index) VALUES ('r2', 'Flat (% sobre salário)', 0), ('r2', 'Por sindicato', 1), ('r2', 'Regra detalhada por verba', 2), ('r2', 'Cálculo exato por benefício/perfil', 3);

INSERT IGNORE INTO questions (id, section_id, text, order_index) VALUES ('r3', @section_pessoas, 'Existe planejamento de contratações?', 2);
INSERT IGNORE INTO question_options (question_id, text, order_index) VALUES ('r3', 'Não', 0), ('r3', 'Valor global', 1), ('r3', 'Vagas aprovadas', 2), ('r3', 'Cronograma físico-financeiro de vagas', 3);

INSERT IGNORE INTO questions (id, section_id, text, order_index) VALUES ('r4', @section_pessoas, 'Como são projetados os aumentos/dissídios?', 3);
INSERT IGNORE INTO question_options (question_id, text, order_index) VALUES ('r4', 'Não são', 0), ('r4', 'Percentual global', 1), ('r4', 'Por sindicato/mês base', 2), ('r4', 'Por mérito individual + dissídio', 3);

INSERT IGNORE INTO questions (id, section_id, text, order_index) VALUES ('r5', @section_pessoas, 'O orçamento de treinamento é detalhado?', 4);
INSERT IGNORE INTO question_options (question_id, text, order_index) VALUES ('r5', 'Não', 0), ('r5', 'Verba global', 1), ('r5', 'Por área', 2), ('r5', 'Por colaborador/curso', 3);

INSERT IGNORE INTO questions (id, section_id, text, order_index) VALUES ('r6', @section_pessoas, 'O RH participa ativamente da validação?', 5);
INSERT IGNORE INTO question_options (question_id, text, order_index) VALUES ('r6', 'Não', 0), ('r6', 'Apenas recebe os números', 1), ('r6', 'Valida headcount', 2), ('r6', 'Valida toda a despesa de pessoal', 3);


-- SEÇÃO: RESULTADOS CONECTADOS
SET @section_conectados = 'conectados';
INSERT IGNORE INTO sections (id, industry_id, title, order_index) VALUES (@section_conectados, 'default-geral', 'Resultados Conectados', 5);

INSERT IGNORE INTO section_feedbacks (id, section_id, initial_text, basic_text, intermediate_text, advanced_text) 
VALUES (UUID(), @section_conectados, 
'Nível Inicial: Processos ainda não estruturados.', 
'Nível Básico: Existem controles, mas manuais e pouco integrados.', 
'Nível Intermediário: Processos definidos e parcialmente automatizados.', 
'Nível Avançado: Gestão otimizada com alta automação e uso de dados.');

INSERT IGNORE INTO questions (id, section_id, text, order_index) VALUES ('x1', @section_conectados, 'Os sistemas (Vendas, RH, Produção) conversam com o Orçamento?', 0);
INSERT IGNORE INTO question_options (question_id, text, order_index) VALUES ('x1', 'Não, tudo manual', 0), ('x1', 'Algumas importações', 1), ('x1', 'Integração via banco de dados', 2), ('x1', 'Integração nativa/API em tempo real', 3);

INSERT IGNORE INTO questions (id, section_id, text, order_index) VALUES ('x2', @section_conectados, 'Quanto tempo leva para gerar um relatório de realizado x orçado?', 1);
INSERT IGNORE INTO question_options (question_id, text, order_index) VALUES ('x2', 'Dias/Semanas', 0), ('x2', '1 a 2 dias', 1), ('x2', 'Algumas horas', 2), ('x2', 'Imediato (Real-time)', 3);

INSERT IGNORE INTO questions (id, section_id, text, order_index) VALUES ('x3', @section_conectados, 'A empresa utiliza Dashboards de gestão?', 2);
INSERT IGNORE INTO question_options (question_id, text, order_index) VALUES ('x3', 'Não, apenas planilhas', 0), ('x3', 'Sim, estáticos (PPT)', 1), ('x3', 'Sim, BI (PowerBI/Tableau)', 2), ('x3', 'Sim, integrados à ferramenta de planejamento', 3);

INSERT IGNORE INTO questions (id, section_id, text, order_index) VALUES ('x4', @section_conectados, 'É fácil fazer análises de "root-cause" (clicar e detalhar)?', 3);
INSERT IGNORE INTO question_options (question_id, text, order_index) VALUES ('x4', 'Não é possível', 0), ('x4', 'Difícil (precisa abrir várias fontes)', 1), ('x4', 'Razoável', 2), ('x4', 'Sim, Drill-down completo', 3);

INSERT IGNORE INTO questions (id, section_id, text, order_index) VALUES ('x5', @section_conectados, 'A tomada de decisão é baseada em dados?', 4);
INSERT IGNORE INTO question_options (question_id, text, order_index) VALUES ('x5', 'Não, feeling', 0), ('x5', 'Às vezes', 1), ('x5', 'Maioria das vezes', 2), ('x5', 'Sempre (Data Driven)', 3);

INSERT IGNORE INTO questions (id, section_id, text, order_index) VALUES ('x6', @section_conectados, 'Qual a satisfação com a tecnologia atual?', 5);
INSERT IGNORE INTO question_options (question_id, text, order_index) VALUES ('x6', 'Insatisfeito', 0), ('x6', 'Neutro', 1), ('x6', 'Satisfeito', 2), ('x6', 'Muito Satisfeito', 3);
