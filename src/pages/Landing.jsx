import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle } from 'lucide-react';

const Landing = () => {
    const navigate = useNavigate();

    const handleStart = () => {
        navigate('/diagnostico');
    };

    return (
        <div className="flex flex-col gap-12 animate-fadeIn">
            {/* Hero Section */}
            <section className="flex flex-col items-center text-center gap-6 py-12 md:py-20">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold border border-primary/20">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                    </span>
                    Diagnóstico Gratuito
                </div>

                <h1 className="text-4xl md:text-6xl font-bold max-w-4xl leading-tight">
                    Descubra o nível de maturidade da gestão <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent-success">orçamentária</span> da sua empresa
                </h1>

                <p className="text-lg md:text-xl text-text-secondary max-w-2xl">
                    Avalie 6 dimensões estratégicas e receba um plano de ação personalizado para evoluir sua controladoria e processos financeiros.
                </p>

                <button
                    onClick={handleStart}
                    className="group mt-6 px-8 py-4 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg shadow-primary/25 flex items-center gap-3"
                >
                    Iniciar Diagnóstico
                    <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                </button>
            </section>

            {/* Features/Methodology Grid */}
            <section className="grid md:grid-cols-3 gap-6">
                {[
                    { title: 'Gerais', desc: 'Processos básicos e cultura orçamentária.' },
                    { title: 'Controladoria & FP&A', desc: 'Ferramentas, DRE, Fluxo de Caixa e Balanço.' },
                    { title: 'Comercial', desc: 'Projeção de vendas, preços e comissões.' },
                    { title: 'Operações', desc: 'Custos, produção, CAPEX e estoques.' },
                    { title: 'Pessoas (RH)', desc: 'Folha, benefícios e contratações.' },
                    { title: 'Resultados Conectados', desc: 'Integração de sistemas e tomadas de decisão.' },
                ].map((item, idx) => (
                    <div key={idx} className="p-6 rounded-xl bg-bg-secondary border border-border-color hover:border-primary/50 transition-colors">
                        <div className="w-10 h-10 rounded-lg bg-bg-tertiary flex items-center justify-center mb-4 text-primary">
                            <CheckCircle size={20} />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                        <p className="text-text-secondary">{item.desc}</p>
                    </div>
                ))}
            </section>
        </div>
    );
};

export default Landing;
