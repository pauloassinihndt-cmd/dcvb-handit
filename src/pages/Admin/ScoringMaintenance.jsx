
import { useState, useEffect } from 'react';
import { useBlocker } from 'react-router-dom';
import { useDiagnosis } from '../../context/DiagnosisContext';
import { Save, AlertCircle, CheckCircle } from 'lucide-react';

const ScoringMaintenance = () => {
    const { industries, scoringConfig, updateScoringConfig } = useDiagnosis();

    // We'll manage local state for the form so we can validate before saving
    const [selectedIndustryId, setSelectedIndustryId] = useState('default-geral');
    const [scores, setScores] = useState([0, 33, 66, 100]);
    const [hasChanges, setHasChanges] = useState(false);
    const [showSaveSuccess, setShowSaveSuccess] = useState(false);

    // Sync when industry changes
    useEffect(() => {
        const savedScores = scoringConfig[selectedIndustryId] || scoringConfig['default-geral'] || [0, 33, 66, 100];
        setScores(savedScores);
        setHasChanges(false);
    }, [selectedIndustryId, scoringConfig]);

    // Warn on unsaved changes (Browser Close/Refresh)
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (hasChanges) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [hasChanges]);

    // Block navigation if has changes
    const blocker = useBlocker(
        ({ currentLocation, nextLocation }) =>
            hasChanges && currentLocation.pathname !== nextLocation.pathname
    );

    const confirmLeave = () => {
        if (blocker.state === "blocked") {
            blocker.proceed();
        }
    };

    const cancelLeave = () => {
        if (blocker.state === "blocked") {
            blocker.reset();
        }
    };

    const saveAndLeave = () => {
        // Validation
        if (scores.some(s => s === '' || isNaN(s) || s < 0 || s > 100)) {
            alert('Por favor, insira valores válidos entre 0 e 100.');
            if (blocker.state === "blocked") blocker.reset();
            return;
        }

        updateScoringConfig(selectedIndustryId, scores);
        setHasChanges(false);
        if (blocker.state === "blocked") {
            blocker.proceed();
        }
    };


    const handleScoreChange = (index, value) => {
        const newScores = [...scores];
        // Ensure input is a number
        const numValue = value === '' ? '' : parseInt(value, 10);
        newScores[index] = numValue;
        setScores(newScores);
        setHasChanges(true); // Mark as changed
    };

    const handleSave = () => {
        // Validation
        if (scores.some(s => s === '' || isNaN(s) || s < 0 || s > 100)) {
            alert('Por favor, insira valores válidos entre 0 e 100.');
            return;
        }

        updateScoringConfig(selectedIndustryId, scores);
        setHasChanges(false);
        setShowSaveSuccess(true);
    };

    const optionLabels = ['A', 'B', 'C', 'D'];

    const handleIndustryChange = (e) => {
        const newId = e.target.value;
        if (hasChanges) {
            if (!confirm('Você tem alterações não salvas. Deseja sair sem salvar?')) {
                return;
            }
        }
        setSelectedIndustryId(newId);
    };

    return (
        <div className="animate-fadeIn relative">
            {/* Header / Sticky Bar */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 sticky top-0 bg-bg-secondary py-4 z-10 backdrop-blur-sm gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Pontuação</h1>
                </div>

                <div className="flex flex-wrap gap-4 items-center">
                    <button
                        onClick={handleSave}
                        disabled={!hasChanges}
                        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all ${hasChanges
                            ? 'bg-primary hover:bg-primary-hover text-text-on-primary shadow-lg'
                            : 'bg-bg-tertiary text-text-secondary cursor-not-allowed'
                            } `}
                    >
                        <Save size={20} />
                        Salvar
                    </button>
                </div>
            </div>

            {/* Scoring Inputs */}
            <div className="bg-white p-6 rounded-xl border border-border-color shadow-sm mt-4">
                <div className="mb-6 border-b border-border-color pb-4">
                    <h2 className="text-lg font-bold mb-1">Manutenção de Perguntas</h2>
                    <p className="text-text-secondary">Central de configuração de pesos.</p>
                    <p className="text-text-secondary mb-4">Configure os pesos percentuais para cada opção de resposta (A, B, C, D) por ramo de atividade.</p>

                    {/* Industry Selector */}
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

                <div className="grid md:grid-cols-2 gap-6 mb-8">
                    {scores.map((score, index) => (
                        <div key={index} className="flex flex-col gap-2">
                            <label className="font-bold text-text-primary">Opção {optionLabels[index]}</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={score}
                                    onChange={(e) => handleScoreChange(index, e.target.value)}
                                    className="w-full p-3 pr-10 rounded-lg border border-border-color focus:ring-2 focus:ring-primary outline-none"
                                />
                                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary font-bold">%</span>
                            </div>
                            <p className="text-xs text-text-secondary">
                                Valor percentual atribuído para a {index + 1}ª opção de resposta.
                            </p>
                        </div>
                    ))}
                </div>

                <div className="flex flex-col md:flex-row items-center gap-4 border-t border-border-color pt-6 text-sm text-text-secondary">
                    <AlertCircle size={18} />
                    <span>Alterações afetarão novos diagnósticos para este ramo.</span>
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
                        <p className="text-text-secondary mb-6">
                            Configuração de pontuação salva com sucesso.
                        </p>
                        <button
                            onClick={() => setShowSaveSuccess(false)}
                            className="w-full py-3 rounded-lg bg-primary hover:bg-primary-hover text-text-on-primary font-bold transition-colors"
                        >
                            Fechar
                        </button>
                    </div>
                </div>
            )}

            {/* Unsaved Changes Navigation Modal */}
            {blocker.state === "blocked" && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fadeIn" onClick={cancelLeave}>
                    <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="flex flex-col items-center text-center mb-6">
                            <div className="w-16 h-16 bg-accent-warning/10 text-accent-warning rounded-full flex items-center justify-center mb-4">
                                <AlertCircle size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-text-primary mb-2">Alterações não Salvas</h3>
                            <p className="text-text-secondary">
                                Você tem alterações pendentes. Deseja salvá-las antes de sair?
                            </p>
                        </div>

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={saveAndLeave}
                                className="w-full py-3 rounded-lg bg-primary hover:bg-primary-hover text-text-on-primary font-bold transition-colors"
                            >
                                Salvar e Sair
                            </button>
                            <button
                                onClick={confirmLeave}
                                className="w-full py-3 rounded-lg border border-border-color font-bold text-accent-danger hover:bg-bg-tertiary transition-colors"
                            >
                                Sair sem Salvar
                            </button>
                            <button
                                onClick={cancelLeave}
                                className="w-full py-3 rounded-lg border border-border-color font-bold text-text-secondary hover:bg-bg-tertiary transition-colors"
                            >
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

