import pool from './src/config/db.js';
import { v4 as uuidv4 } from 'uuid';

const questionsData = [
    {
        id: 'gerais',
        title: 'Gerais',
        questions: [
            { text: "Quanto tempo vocês gastam hoje para finalizar a primeira versão do orçamento anual?", options: ["a) Mais de 2 meses", "b) Entre 1 e 2 meses", "c) Menos de 1 mês", "d) Não faz orçamento"] },
            { text: "Hoje, quantas versões diferentes do orçamento (planilhas/documentos em paralelo) circulam simultaneamente na empresa?", options: ["a) Mais de 5", "b) Entre 3 e 5", "c) Até 2", "d) Não faz orçamento"] },
            { text: "Se a diretoria pedir uma revisão de cenário urgente, quanto tempo vocês demoram para entregar?", options: ["a) Mais de 2 semanas", "b) Até 1 semana", "c) Em até 2 dias", "d) Não faz orçamento"] },
            { text: "Quando a diretoria precisa decidir rapidamente, como vocês classificam a qualidade das informações financeiras que conseguem disponibilizar?", options: ["a) Dados frequentemente atrasados ou inconsistentes", "b) Dados parcialmente atualizados, exigindo complementos", "c) Dados atualizados e consistentes para decisão imediata", "d) Não faz orçamento"] },
            { text: "Hoje as áreas trabalham…", options: ["a) Cada uma em suas planilhas isoladas", "b) Parcialmente integradas", "c) Totalmente integradas num único ambiente", "d) Não faz orçamento"] },
            { text: "Quando a diretoria pede cenários alternativos (otimista/pessimista), vocês…", options: ["a) Não conseguem entregar", "b) Entregam após dias", "c) Entregam em horas", "d) Não faz orçamento"] }
        ]
    },
    {
        id: 'controladoria',
        title: 'Controladoria FP&A / Backoffice',
        questions: [
            { text: "Quando as premissas do seu segmento (ex. inflação câmbio ou juros) mudam, quanto tempo leva para simular impacto no orçamento?", options: ["a) Mais de 2 semanas ou não conseguimos simular", "b) Mais de 1 semana", "c) Em poucas horas", "d) Não fazemos simulações"] },
            { text: "O impacto de um investimento (CAPEX) no OPEX, caixa e balanço é…", options: ["a) Inexistente", "b) Estimado manualmente", "c) Automático e visível", "d) Não orçamos investimentos"] },
            { text: "O controle de versões orçamentárias está em…", options: ["a) Planilhas dispersas", "b) Algumas planilhas consolidadas", "c) Sistema com histórico completo", "d) Não fazemos simulações"] },
            { text: "O tempo da equipe de controladoria FP&A é gasto em…", options: ["a) Mais de 60% com tarefas operacionais", "b) 40% a 60% operacionais", "c) Menos de 40% operacionais", "d) Não temos controle"] },
            { text: "Quando a diretoria pede explicação de variações, a resposta vem…", options: ["a) Dias depois", "b) Em até 2 dias", "c) Imediatamente, com detalhamento (drilldown) até lançamentos", "d) Não  temos controle das variações"] },
            { text: "Comparações Orçado x Realizado acontecem…", options: ["a) Quase nunca", "b) Eventualmente", "c) Sempre, com drilldown até lançamentos", "d) Não fazemos acompanhamento orçado  x realizado"] }
        ]
    },
    {
        id: 'comercial',
        title: 'Comercial',
        questions: [
            { text: "O orçamento de receitas/vendas é feito apenas no nível de contas de resultado ou há necessidade de uma abertura gerencial (com QTD, Preço médio, produtos, canais de vendas e etc.)", options: ["a) Aberto apenas por conta", "b) Aberto por canal vendas", "c) No nivel de produto e canal de Vendas", "d) Não orça receita"] },
            { text: "Se as premissas de vendas (câmbio, quantidade, mix de produto) mudar amanhã, vocês conseguem mostrar impacto no EBITDA?", options: ["a) Com muito esforço (mais de uma semana)", "b) Sim (2 a 7 dias)", "c) Sim (no mesmo dia)", "d) Não conseguimos realizar projeções"] },
            { text: "Comparações Orçado x Forecast x Realizado são…", options: ["a) Inexistentes", "b) Eventuais (trimestrais/semestrais)", "c) Sistemáticas (mensal)", "d) Não fazemos acompanhamento orçado  x realizado"] },
            { text: "Quando a diretoria pede simulação de preços/volumes, vocês…", options: ["a) Não conseguem", "b) Entregam manualmente após dias", "c) Entregam no mesmo dia", "d) A diretoria não solicita simulações"] },
            { text: "A visão do impacto comercial nos demonstrativos é…", options: ["a) Manual e demorada (suscetível a erros)", "b) Parcialmente automatizada via planilhas", "c) Conectada e sistematizada", "d) Não acompanhamos os impactos nos demonstrativos"] },
            { text: "A alteração e inclusão da estrutura comercial (Produto, Canal de Venda, Filial...) é possível?", options: ["a) Fazemos manualmente com muito esforço.", "b) Parcialmente automatizada via planilhas", "c) Sim, automaticamente atualizado com integração ao ERP", "d) Não é possível"] }
        ]
    },
    {
        id: 'operacoes',
        title: 'Operações',
        questions: [
            { text: "O orçamento de custos variáveis é feito via premissa percentual ou digitado direto nas contas contábeis, ou são abertos por fichas técnicas?", options: ["a) Digitado direto nas contas", "b) Percentual sobre a receita", "c) Por ficha técnica", "d) Não orça custos variáveis"] },
            { text: "Hoje, se criar um novo cenário orçamentário alterando o volume de produção, o efeito nos custos é…", options: ["a) Manual e demorada (suscetível a erros)", "b) Parcialmente automatizada via planilhas", "c) Conectada e sistematizada", "d) Não fazemos cenários de simulações"] },
            { text: "A rastreabilidade das premissas de custos é…", options: ["a) Totalmente dependente e centralizada em pessoas especialistas", "b) Documentado em arquivos em pastas", "c) Completa com roteiros e documentações no sistema orçamentário", "d) Não existe rastreabilidade"] },
            { text: "Quando mudam as premissas (preço de insumo, inflação, cambio) a revisão dos cenários de custos demora…", options: ["a) mais de uma semana, com muito esforço", "b) De 2 a 7 dias, com esforço manual", "c) No mesmo dia, com automatização", "d) Não fazemos cenários de simulações"] },
            { text: "O alinhamento orçamento de produção x vendas é…", options: ["a) Projetamos apenas valores", "b) Parcialmente alinhado, com necessidades de conferências e ajustes manuais", "c) Totalmente integrado a capacidade operacional", "d) Desconectado da capacidade operacional"] },
            { text: "Para projetar o orçamento de produção e custos, vocês utilizam fichas técnicas de produtos e operações para calcular consumo de insumos, perdas e capacidade produtiva?", options: ["a) Não, fazemos apenas estimativas gerais sem base técnica", "b) Usamos parcialmente, com cálculos manuais em algumas áreas", "c) Usamos fichas técnicas de forma completa, automatizada e integrada ao orçamento", "d) Não projetamos compra de insumos"] }
        ]
    },
    {
        id: 'pessoas',
        title: 'Pessoas (RH)',
        questions: [
            { text: "O RH participa do processo de orçamento…", options: ["a) Apenas fornecendo dados", "b) Parcialmente ativo", "c) Como protagonista com simulações integradas", "d) Não participa"] },
            { text: "Quando ocorre um dissídio, quanto tempo levam para recalcular salários, encargos e benefícios?", options: ["a) Mais de 2 semanas", "b) Até 1 semana", "c) Em horas", "d) Não projetamos dissídio"] },
            { text: "O impacto de contratações ou demissões no orçamento e nos demonstrativos é…", options: ["a) Manual e demorada (suscetível a erros)", "b) Parcialmente automatizada via planilhas", "c) Conectada e sistematizada", "d) Não projetamos contratações ou demissões"] },
            { text: "Comparações Orçado x Realizado de headcount e massa salarial são…", options: ["a) Apenas por valores", "b) Parcialmente feitas", "c) Estruturadas e contínuas", "d) Não realizamos acompanhamento"] },
            { text: "Os gestores de centro de custo ou pacotes são responsáveis por elaborar o orçamento de headcount, promoções, transferências, contratações e demissões?", options: ["a) Não, tudo é centralizado no RH ou financeiro", "b) Sim, mas de forma parcial e pouco estruturada", "c) Sim, de forma estruturada, descentralizada e integrada ao orçamento geral", "d) Não orçamos pessoas de forma detalhada"] }
        ]
    },
    {
        id: 'conectados',
        title: 'Resultados Conectados',
        questions: [
            { text: "A consistência entre os demonstrativos: DRE, Balanço e Fluxo de Caixa hoje é…", options: ["a) Três histórias diferentes", "b) Parcialmente alinhada", "c) Uma visão única e conectada", "d) Não orçamos peças de resultado"] },
            { text: "É possível explicar variações de receita, custo e margem no DRE em tempo hábil?", options: ["a) Não conseguimos explicar de forma estruturada.", "b) Explicamos parcialmente, com grande esforço manual", "c) Explicamos em tempo real, com visão detalhada e drilldown", "d) Não orçamos peças de resultado"] },
            { text: "Conseguem analisar margens de contribuição por Unidade de Negócio, Segmento, Produto ou Canal de Vendas?", options: ["a) Não, temos apenas visão consolidada", "b) Sim, mas de forma manual e limitada", "c) Sim, de forma estruturada, integrada e automatizada", "d) Não orçamos peças de resultado"] },
            { text: "Conseguem automatizar a eliminações intercompany (DRE e BP)?", options: ["a) Não, fazemos manualmente em planilhas", "b) Sim, mas com cálculos manuais e risco de erro", "c) Sim, automaticamente e integrado ao DRE", "e) Não temos transações entre as empresas do grupo"] },
            { text: "O fluxo de caixa projetado é construído a partir dos prazos médios de recebimento e pagamento, refletindo automaticamente o orçamento?", options: ["a) Não, fazemos planilhas manuais desconectadas", "b) Parcial, com alguns vínculos manuais ao orçamento", "c) Sim, totalmente integrado ao orçamento e atualizado com base em prazos médios", "d) Não projetamos fluxo de caixa"] },
            { text: "O balanço patrimonial projetado é atualizado automaticamente com base no orçamento, fluxo de caixa e movimentações previstas?", options: ["a) Não, fazemos apenas planilhas estáticas", "b) Parcial, com alguns ajustes manuais", "c) Sim, totalmente integrado e consistente com DRE e Caixa", "d) Não projetamos balanço patrimonial"] },
            { text: "O fluxo de caixa indireto projetado é derivado de forma automática das movimentações previstas no balanço patrimonial e DRE?", options: ["a) Não, construímos manualmente em planilhas", "b) Parcial, com alguns vínculos manuais", "c) Sim, totalmente automático e conectado aos demonstrativos", "d) Não projetamos fluxo de caixa indireto"] }
        ]
    }
];

const defaultFeedback = {
    initial: 'Nível Inicial: Processos ainda não estruturados.',
    basic: 'Nível Básico: Existem controles, mas manuais e pouco integrados.',
    intermediate: 'Nível Intermediário: Processos definidos e parcialmente automatizados.',
    advanced: 'Nível Avançado: Gestão otimizada com alta automação e uso de dados.'
};

async function updateQuestions() {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        console.log('Iniciando atualização das perguntas para o Ramo Geral...');

        const industryId = 'default-geral';

        // 1. Limpar perguntas antigas para esta indústria
        // Precisamos deletar na ordem correta devido às chaves estrangeiras
        // options -> questions -> sections

        // Buscar todas as seções da indústria Geral
        const [sections] = await connection.execute('SELECT id FROM sections WHERE industry_id = ?', [industryId]);
        const sectionIds = sections.map(s => s.id);

        if (sectionIds.length > 0) {
            const placeholders = sectionIds.map(() => '?').join(',');

            // Deletar feedbacks das seções
            await connection.execute(`DELETE FROM section_feedbacks WHERE section_id IN (${placeholders})`, sectionIds);

            // Buscar questões das seções
            const [questions] = await connection.execute(`SELECT id FROM questions WHERE section_id IN (${placeholders})`, sectionIds);
            const questionIds = questions.map(q => q.id);

            if (questionIds.length > 0) {
                const questionPlaceholders = questionIds.map(() => '?').join(',');
                // Deletar opções das questões
                await connection.execute(`DELETE FROM question_options WHERE question_id IN (${questionPlaceholders})`, questionIds);
                // Deletar questões
                await connection.execute(`DELETE FROM questions WHERE section_id IN (${placeholders})`, sectionIds);
            }

            // Deletar seções
            await connection.execute(`DELETE FROM sections WHERE industry_id = ?`, [industryId]);
        }

        console.log('Perguntas antigas removidas.');

        // 2. Inserir novas seções e perguntas
        let sectionOrder = 0;
        for (const sectionData of questionsData) {
            const sectionId = uuidv4(); // Usar novo ID para evitar conflitos se o script rodar de novo

            // Inserir Seção
            await connection.execute(
                'INSERT INTO sections (id, industry_id, title, order_index) VALUES (?, ?, ?, ?)',
                [sectionId, industryId, sectionData.title, sectionOrder++]
            );

            // Inserir Feedback Padrão para a Seção
            await connection.execute(
                'INSERT INTO section_feedbacks (id, section_id, initial_text, basic_text, intermediate_text, advanced_text) VALUES (?, ?, ?, ?, ?, ?)',
                [uuidv4(), sectionId, defaultFeedback.initial, defaultFeedback.basic, defaultFeedback.intermediate, defaultFeedback.advanced]
            );

            let questionOrder = 0;
            for (const q of sectionData.questions) {
                const questionId = uuidv4();

                // Inserir Pergunta
                await connection.execute(
                    'INSERT INTO questions (id, section_id, text, order_index) VALUES (?, ?, ?, ?)',
                    [questionId, sectionId, q.text, questionOrder++]
                );

                // Inserir Opções
                let optionOrder = 0;
                for (const optText of q.options) {
                    await connection.execute(
                        'INSERT INTO question_options (question_id, text, order_index) VALUES (?, ?, ?)',
                        [questionId, optText, optionOrder++]
                    );
                }
            }
        }

        await connection.commit();
        console.log('Perguntas do Ramo Geral atualizadas com sucesso!');
    } catch (error) {
        await connection.rollback();
        console.error('Erro ao atualizar perguntas:', error);
    } finally {
        connection.release();
        process.exit();
    }
}

updateQuestions();
