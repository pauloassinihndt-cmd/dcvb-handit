
import { useState, useEffect } from 'react';
import { useBlocker } from 'react-router-dom';
import { useDiagnosis } from '../../context/DiagnosisContext';
import { Save, AlertCircle, CheckCircle, Percent, Hash } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const DEFAULT_WEIGHTS = { option_a_weight: 0, option_b_weight: 33, option_c_weight: 66, option_d_weight: 100, score_mode: 'percent' };

const ScoringMaintenance = () => {
    const { industries } = useDiagnosis();

    const [selectedIndustryId, setSelectedIndustryId] = useState('');
    const [weights, setWeights] = useState(DEFAULT_WEIGHTS);
    const [scoreMode, setScoreMode] = useState('percent'); // 'percent' | 'points'
    const [hasChanges, setHasChanges] = useState(false);
    const [showSaveSuccess, setShowSaveSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Inicializar com o primeiro ramo disponível
    useEffect(() => {
        if (industries.length > 0 && !selectedIndustryId) {
            setSelectedIndustryId(industries[0].id);
        }
    }, [industries, selectedIndustryId]);

    // Carregar pesos ao mudar de ramo
    useEffect(() => {
        if (!selectedIndustryId) return;
        const fetchWeights = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`${API_URL}/industries/${selectedIndustryId}/scoring`);
                if (res.ok) {
                    const data = await res.json();
                    setWeights(data);
                    setScoreMode(data.score_mode || 'percent');
                } else {
                    setWeights(DEFAULT_WEIGHTS);
                    setScoreMode('percent');
                }
            } catch {
                setWeights(DEFAULT_WEIGHTS);
                setScoreMode('percent');
            } finally {
                setLoading(false);
                setHasChanges(false);
            }
        };
        fetchWeights();
    }, [selectedIndustryId]);

    // Warn on unsaved changes
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (hasChanges) { e.preventDefault(); e.returnValue = ''; }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [hasChanges]);

    const blocker = useBlocker(
        ({ currentLocation, nextLocation }) =>
            hasChanges && currentLocation.pathname !== nextLocation.pathname
    );

    const handleWeightChange = (field, value) => {
        const numValue = value === '' ? '' : Math.min(100, Math.max(0, parseInt(value, 10) || 0));
        setWeights(prev => ({ ...prev, [field]: numValue }));
        setHasChanges(true);
    };

    const handleModeChange = (mode) => {
        setScoreMode(mode);
        setHasChanges(true);
    };

    const handleIndustryChange = (e) => {
        const newId = e.target.value;
        if (hasChanges) {
            if (!confirm('Você tem alterações não salvas. Deseja sair sem salvar?')) return;
        }
        setSelectedIndustryId(newId);
    };

    const validate = () => {
        const fields = ['option_a_weight', 'option_b_weight', 'option_c_weight', 'option_d_weight'];
        return fields.every(f => weights[f] !== '' && !isNaN(weights[f]) && weights[f] >= 0 && weights[f] <= 100);
    };

    const handleSave = async () => {
        if (!validate()) {
            setError('Por favor, insira valores válidos entre 0 e 100 para todas as opções.');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_URL}/industries/${selectedIndustryId}/scoring`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...weights, score_mode: scoreMode })
            });
            if (res.ok) {
                setHasChanges(false);
                setShowSaveSuccess(true);
            } else {
                const err = await res.json();
                setError(err.error || 'Erro ao salvar.');
            }
        } catch {
            setError('Erro de conexão com o servidor.');
        } finally {
            setLoading(false);
        }
    };

    const saveAndLeave = async () => {
        await handleSave();
        if (blocker.state === 'blocked') blocker.proceed();
    };

    const optionFields = [
        { key: 'option_a_weight', label: 'Opção A', desc: 'Pior resposta (não realiza)' },
        { key: 'option_b_weight', label: 'Opção B', desc: 'Em nível básico' },
        { key: 'option_c_weight', label: 'Opção C', desc: 'Em nível intermediário' },
        { key: 'option_d_weight', label: 'Opção D', desc: 'Melhor resposta (avançado)' },
    ];

    const selectedIndustry = industries.find(i => i.id === selectedIndustryId);

    return (
        <div className="animate-fadeIn relative">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 sticky top-0 bg-bg-secondary py-4 z-10 backdrop-blur-sm gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Pontuação</h1>
                    <p className="text-text-secondary text-sm mt-1">Configure os pesos por opção de resposta</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={!hasChanges || loading}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all ${hasChanges && !loading
                        ? 'bg-primary hover:bg-primary-hover text-text-on-primary shadow-lg'
                        : 'bg-bg-tertiary text-text-secondary cursor-not-allowed'
                        }`}
                >
                    <Save size={20} />
                    {loading ? 'Salvando...' : 'Salvar'}
                </button>
            </div>

            <div className="bg-white p-6 rounded-xl border border-border-color shadow-sm mt-4">
                {/* Cabeçalho e Seletor de Ramo */}
                <div className="mb-6 border-b border-border-color pb-6">
                    <h2 className="text-lg font-bold mb-1">Configuração de Pesos</h2>
                    <p className="text-text-secondary mb-4">
                        Defina o valor atribuído a cada opção de resposta (A, B, C, D) por ramo de atividade.
                        Escolha o modo <strong>Porcentagem</strong> para valores de 0–100% ou <strong>Pontos</strong>
                        para valores somados diretamente ao total.
                    </p>

                    <div className="max-w-md">
                        <label className="block text-sm font-bold text-text-secondary mb-1">Ramo de Atividade</label>
                        <select
                            value={selectedIndustryId}
                            onChange={handleIndustryChange}
                            className="w-full p-3 rounded-lg border border-border-color focus:ring-2 focus:ring-primary outline-none"
                        >
                            {industries.map(ind => (
                                <option key={ind.id} value={ind.id}>{ind.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Toggle Modo de Pontuação */}
                <div className="mb-8">
                    <label className="block text-sm font-bold text-text-secondary mb-3">Modo de Pontuação</label>
                    <div className="flex gap-3">
                        <button
                            onClick={() => handleModeChange('percent')}
                            className={`flex items-center gap-2 px-5 py-3 rounded-lg font-bold border-2 transition-all ${scoreMode === 'percent'
                                ? 'border-primary bg-primary/10 text-primary'
                                : 'border-border-color text-text-secondary hover:border-primary/40'
                                }`}
                        >
                            <Percent size={18} />
                            Porcentagem (%)
                        </button>
                        <button
                            onClick={() => handleModeChange('points')}
                            className={`flex items-center gap-2 px-5 py-3 rounded-lg font-bold border-2 transition-all ${scoreMode === 'points'
                                ? 'border-primary bg-primary/10 text-primary'
                                : 'border-border-color text-text-secondary hover:border-primary/40'
                                }`}
                        >
                            <Hash size={18} />
                            Pontos (0–100)
                        </button>
                    </div>
                    <p className="text-xs text-text-secondary mt-2">
                        {scoreMode === 'percent'
                            ? '📊 Cada opção representa uma % do score. Ex: A=0%, B=33%, C=66%, D=100%.'
                            : '🔢 Cada opção soma pontos diretamente ao total. Ex: A=0 pts, B=10 pts, C=20 pts, D=30 pts.'}
                    </p>
                </div>

                {/* Inputs */}
                {loading ? (
                    <div className="flex items-center justify-center py-10 text-text-secondary">
                        <span className="animate-spin mr-2">⌛</span> Carregando configuração...
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 gap-6 mb-8">
                        {optionFields.map(({ key, label, desc }) => (
                            <div key={key} className="flex flex-col gap-2">
                                <label className="font-bold text-text-primary">{label}</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={weights[key] ?? ''}
                                        onChange={(e) => handleWeightChange(key, e.target.value)}
                                        className="w-full p-3 pr-12 rounded-lg border border-border-color focus:ring-2 focus:ring-primary outline-none"
                                    />
                                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary font-bold text-sm">
                                        {scoreMode === 'percent' ? '%' : 'pts'}
                                    </span>
                                </div>
                                <p className="text-xs text-text-secondary">{desc}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Preview */}
                {!loading && (
                    <div className="bg-bg-secondary rounded-lg p-4 mb-6">
                        <p className="text-sm font-bold text-text-secondary mb-2">Prévia de Pontuação ({selectedIndustry?.name}):</p>
                        <div className="flex gap-4 flex-wrap">
                            {optionFields.map(({ key, label }) => (
                                <div key={key} className="flex items-center gap-2 bg-white rounded-lg px-4 py-2 border border-border-color">
                                    <span className="font-bold text-primary">{label}</span>
                                    <span className="text-text-secondary">=</span>
                                    <span className="font-bold">{weights[key] ?? 0}{scoreMode === 'percent' ? '%' : ' pts'}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="flex items-center gap-2 text-accent-danger text-sm mb-4 p-3 bg-accent-danger/10 rounded-lg">
                        <AlertCircle size={16} />
                        {error}
                    </div>
                )}

                <div className="flex items-center gap-4 border-t border-border-color pt-6 text-sm text-text-secondary">
                    <AlertCircle size={18} />
                    <span>Alterações afetarão novos diagnósticos registrados para este ramo.</span>
                </div>
            </div>

            {/* Success Modal */}
            {showSaveSuccess && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fadeIn" onClick={() => setShowSaveSuccess(false)}>
                    <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-2xl flex flex-col items-center text-center" onClick={e => e.stopPropagation()}>
                        <div className="w-16 h-16 bg-accent-success/10 text-accent-success rounded-full flex items-center justify-center mb-4">
                            <CheckCircle size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-text-primary mb-2">Sucesso!</h3>
                        <p className="text-text-secondary mb-6">Configuração de pontuação salva com sucesso.</p>
                        <button
                            onClick={() => setShowSaveSuccess(false)}
                            className="w-full py-3 rounded-lg bg-primary hover:bg-primary-hover text-text-on-primary font-bold transition-colors"
                        >
                            Fechar
                        </button>
                    </div>
                </div>
            )}

            {/* Unsaved Changes Modal */}
            {blocker.state === 'blocked' && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fadeIn" onClick={() => blocker.reset()}>
                    <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="flex flex-col items-center text-center mb-6">
                            <div className="w-16 h-16 bg-accent-warning/10 text-accent-warning rounded-full flex items-center justify-center mb-4">
                                <AlertCircle size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-text-primary mb-2">Alterações não Salvas</h3>
                            <p className="text-text-secondary">Você tem alterações pendentes. Deseja salvá-las antes de sair?</p>
                        </div>
                        <div className="flex flex-col gap-3">
                            <button onClick={saveAndLeave} className="w-full py-3 rounded-lg bg-primary hover:bg-primary-hover text-text-on-primary font-bold transition-colors">
                                Salvar e Sair
                            </button>
                            <button onClick={() => blocker.proceed()} className="w-full py-3 rounded-lg border border-border-color font-bold text-accent-danger hover:bg-bg-tertiary transition-colors">
                                Sair sem Salvar
                            </button>
                            <button onClick={() => blocker.reset()} className="w-full py-3 rounded-lg border border-border-color font-bold text-text-secondary hover:bg-bg-tertiary transition-colors">
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ScoringMaintenance;
