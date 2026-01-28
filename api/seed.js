import pool from './src/config/db.js';
import { v4 as uuidv4 } from 'uuid';

const questionsData = [
    {
        id: 'gerais',
        title: 'Gerais',
        questions: [
            { id: 'q1', text: 'Qual é a percepção geral sobre o processo orçamentário na empresa?', options: ['Caótico e manual', 'Organizado mas desconectado', 'Integrado e fluido', 'Altamente estratégico e automatizado'] },
            { id: 'q2', text: 'Quanto tempo a empresa leva para fechar o ciclo orçamentário?', options: ['Mais de 4 meses', '2 a 4 meses', '1 a 2 meses', 'Menos de 1 mês'] },
            { id: 'q3', text: 'Qual o nível de confiança nos dados orçados?', options: ['Baixo', 'Médio', 'Alto', 'Total'] },
            { id: 'q4', text: 'Com que frequência o orçamento é revisado?', options: ['Nunca', 'Anualmente', 'Semestralmente', 'Mensalmente/Trimestralmente'] },
            { id: 'q5', text: 'Qual a principal ferramenta utilizada?', options: ['Papel/Planilhas manuais', 'Planilhas complexas com macros', 'ERP básico', 'Sistema de gestão orçamentária dedicado (EPM/CPM)'] },
            { id: 'q6', text: 'Como é o envolvimento dos gestores no processo?', options: ['Nenhum', 'Baixo/Forçado', 'Médio/Colaborativo', 'Alto/Donos do número'] },
        ]
    },
    {
        id: 'controladoria',
        title: 'Controladoria FP&A',
        questions: [
            { id: 'c1', text: 'A controladoria atua mais como?', options: ['Compiladora de dados', 'Auditora de números', 'Parceira de negócios', 'Estratega do negócio'] },
            { id: 'c2', text: 'Como é feito o DRE Orçado?', options: ['Não é feito', 'Manual em Excel', 'Parcialmente automatizado', 'Totalmente integrado ao realizado'] },
            { id: 'c3', text: 'Existe projeção de Fluxo de Caixa indireto?', options: ['Não', 'Sim, manual', 'Sim, automatizado', 'Sim, com cenários em tempo real'] },
            { id: 'c4', text: 'O Balanço Patrimonial é projetado?', options: ['Não', 'Raramente', 'Sim, mas desconectado', 'Sim, integrado ao DRE e Caixa'] },
            { id: 'c5', text: 'Qual o nível de detalhe das despesas?', options: ['Conta contábil apenas', 'Centro de Custo', 'Centro de Custo + Projeto/Atividade', 'Multidimensional (CC, Projeto, Produto, etc)'] },
            { id: 'c6', text: 'Como são tratados os rateios de despesas?', options: ['Não existem', 'Base fixa/manual', 'Drivers simples', 'Drivers dinâmicos e múltiplos estágios'] },
        ]
    },
    {
        id: 'comercial',
        title: 'Comercial',
        questions: [
            { id: 'v1', text: 'Como é feita a projeção de vendas?', options: ['Meta Top-Down apenas', 'Baseada em histórico', 'Colaborativa (Bottom-up)', 'Preditiva com drivers de mercado'] },
            { id: 'v2', text: 'Existe orçamento de volume x preço?', options: ['Não, apenas valor total', 'Em alguns produtos', 'Sim, para principais linhas', 'Sim, para todo o mix'] },
            { id: 'v3', text: 'O orçamento de deduções de vendas é detalhado?', options: ['Percentual fixo sobre Venda Bruta', 'Por canal/produto (médio)', 'Cálculo imposto a imposto', 'Detalhado por cliente/SKU e tributo'] },
            { id: 'v4', text: 'Existe simulação de cenários de vendas?', options: ['Não', 'Apenas otimista/pessimista', 'Simulações manuais', 'Simulações dinâmicas (what-if)'] },
            { id: 'v5', text: 'A equipe comercial tem acesso fácil às suas metas e real?', options: ['Não', 'Recebem relatórios estáticos', 'Acesso limitado', 'Dashboard online em tempo real'] },
            { id: 'v6', text: 'Existe cálculo de comissões no orçamento?', options: ['Não', 'Estimativa global', 'Por vendedor', 'Regra detalhada por SKU/Canal'] },
        ]
    },
    {
        id: 'operacoes',
        title: 'Operações',
        questions: [
            { id: 'o1', text: 'Como é o orçamento de produção/serviços?', options: ['Baseado em histórico financeiro', 'Baseado em volume de vendas', 'BOM (Ficha Técnica) explodida', 'BOM + Capacidade instalada (MRP)'] },
            { id: 'o2', text: 'Os custos variáveis são calculados como?', options: ['% da Receita', 'Custo médio histórico', 'Custo padrão', 'Custo padrão com revisão periódica'] },
            { id: 'o3', text: 'Existe orçamento de investimentos (CAPEX)?', options: ['Não', 'Lista de desejos', 'Projetos aprovados', 'Gestão de portfólio de projetos com ROI'] },
            { id: 'o4', text: 'Como é projetado o headcount operacional?', options: ['Manual/Global', 'Por setor', 'Baseado em drivers de volume', 'Otimizado por turno/capacidade'] },
            { id: 'o5', text: 'Existe controle de estoques projetado?', options: ['Não', 'Giro médio global', 'Giro por categoria', 'Giro por SKU e política de cobertura'] },
            { id: 'o6', text: 'A manutenção é orçada?', options: ['Não', 'Valor fixo mensal', 'Base zero', 'Preventiva/Corretiva baseada em ativos'] },
        ]
    },
    {
        id: 'pessoas',
        title: 'Pessoas (RH)',
        questions: [
            { id: 'r1', text: 'Como é feito o orçamento de folha?', options: ['Linha única de custo', 'Por centro de custo', 'Por cargo/salário médio', 'Matricial (colaborador a colaborador)'] },
            { id: 'r2', text: 'Os encargos e benefícios são calculados como?', options: ['Flat (% sobre salário)', 'Por sindicato', 'Regra detalhada por verba', 'Cálculo exato por benefício/perfil'] },
            { id: 'r3', text: 'Existe planejamento de contratações?', options: ['Não', 'Valor global', 'Vagas aprovadas', 'Cronograma físico-financeiro de vagas'] },
            { id: 'r4', text: 'Como são projetados os aumentos/dissídios?', options: ['Não são', 'Percentual global', 'Por sindicato/mês base', 'Por mérito individual + dissídio'] },
            { id: 'r5', text: 'O orçamento de treinamento é detalhado?', options: ['Não', 'Verba global', 'Por área', 'Por colaborador/curso'] },
            { id: 'r6', text: 'O RH participa ativamente da validação?', options: ['Não', 'Apenas recebe os números', 'Valida headcount', 'Valida toda a despesa de pessoal'] },
        ]
    },
    {
        id: 'conectados',
        title: 'Resultados Conectados',
        questions: [
            { id: 'x1', text: 'Os sistemas (Vendas, RH, Produção) conversam com o Orçamento?', options: ['Não, tudo manual', 'Algumas importações', 'Integração via banco de dados', 'Integração nativa/API em tempo real'] },
            { id: 'x2', text: 'Quanto tempo leva para gerar um relatório de realizado x orçado?', options: ['Dias/Semanas', '1 a 2 dias', 'Algumas horas', 'Imediato (Real-time)'] },
            { id: 'x3', text: 'A empresa utiliza Dashboards de gestão?', options: ['Não, apenas planilhas', 'Sim, estáticos (PPT)', 'Sim, BI (PowerBI/Tableau)', 'Sim, integrados à ferramenta de planejamento'] },
            { id: 'x4', text: 'É fácil fazer análises de "root-cause" (clicar e detalhar)?', options: ['Não é possível', 'Difícil (precisa abrir várias fontes)', 'Razoável', 'Sim, Drill-down completo'] },
            { id: 'x5', text: 'A tomada de decisão é baseada em dados?', options: ['Não, feeling', 'Às vezes', 'Maioria das vezes', 'Sempre (Data Driven)'] },
            { id: 'x6', text: 'Qual a satisfação com a tecnologia atual?', options: ['Insatisfeito', 'Neutro', 'Satisfeito', 'Muito Satisfeito'] },
        ]
    }
];

const defaultFeedback = {
    initial: 'Nível Inicial: Processos ainda não estruturados.',
    basic: 'Nível Básico: Existem controles, mas manuais e pouco integrados.',
    intermediate: 'Nível Intermediário: Processos definidos e parcialmente automatizados.',
    advanced: 'Nível Avançado: Gestão otimizada com alta automação e uso de dados.'
};

async function seed() {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        console.log('Iniciando população do banco de dados...');

        // 1. Criar indústria padrão 'Geral'
        const industryId = 'default-geral';
        await connection.execute(
            'INSERT IGNORE INTO industries (id, name, active, is_fixed) VALUES (?, ?, ?, ?)',
            [industryId, 'Geral', 1, 1]
        );

        // 2. Criar Pesos Padrão
        await connection.execute(
            'INSERT IGNORE INTO industry_scoring_weights (industry_id, option_a_weight, option_b_weight, option_c_weight, option_d_weight) VALUES (?, ?, ?, ?, ?)',
            [industryId, 0, 33, 66, 100]
        );

        let sectionOrder = 0;
        for (const sectionData of questionsData) {
            const sectionId = sectionData.id;

            // 3. Inserir Seção
            await connection.execute(
                'INSERT IGNORE INTO sections (id, industry_id, title, order_index) VALUES (?, ?, ?, ?)',
                [sectionId, industryId, sectionData.title, sectionOrder++]
            );

            // 4. Inserir Feedback Padrão para a Seção
            await connection.execute(
                'INSERT IGNORE INTO section_feedbacks (id, section_id, initial_text, basic_text, intermediate_text, advanced_text) VALUES (?, ?, ?, ?, ?, ?)',
                [uuidv4(), sectionId, defaultFeedback.initial, defaultFeedback.basic, defaultFeedback.intermediate, defaultFeedback.advanced]
            );

            let questionOrder = 0;
            for (const q of sectionData.questions) {
                const questionId = q.id;

                // 5. Inserir Pergunta
                await connection.execute(
                    'INSERT IGNORE INTO questions (id, section_id, text, order_index) VALUES (?, ?, ?, ?)',
                    [questionId, sectionId, q.text, questionOrder++]
                );

                // 6. Inserir Opções
                let optionOrder = 0;
                for (const optText of q.options) {
                    await connection.execute(
                        'INSERT INTO question_options (question_id, text, order_index) VALUES (?, ?, ?)',
                        [questionId, optText, optionOrder++]
                    );
                }
            }
        }

        // 7. Criar usuário administrador padrão (Senha: admin123)
        await connection.execute(
            'INSERT IGNORE INTO users (username, password_hash, role) VALUES (?, ?, ?)',
            ['admin', 'admin123', 'admin']
        );

        await connection.commit();
        console.log('Banco de dados populado com sucesso!');
    } catch (error) {
        await connection.rollback();
        console.error('Erro ao popular banco de dados:', error);
    } finally {
        connection.release();
        process.exit();
    }
}

seed();
