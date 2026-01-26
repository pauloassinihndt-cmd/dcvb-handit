import { useState, useEffect } from 'react';
import { useDiagnosis } from '../../context/DiagnosisContext';
import { Save, MessageSquare, ChevronDown, Copy } from 'lucide-react';

const FeedbackMaintenance = () => {
    const { questions, updateQuestions, industries, selectIndustryScope, currentIndustryId } = useDiagnosis();
    const [localQuestions, setLocalQuestions] = useState(JSON.parse(JSON.stringify(questions)));
    const [hasChanges, setHasChanges] = useState(false);

    // Sync when industry changes
    useEffect(() => {
        setLocalQuestions(JSON.parse(JSON.stringify(questions)));
        setHasChanges(false);
    }, [currentIndustryId, questions]);

    const handleFeedbackChange = (sectionIdx, level, value) => {
        const newQuestions = [...localQuestions];
        if (!newQuestions[sectionIdx].feedback) {
            newQuestions[sectionIdx].feedback = {};
        }
        if (!newQuestions[sectionIdx].feedback.levels) {
            newQuestions[sectionIdx].feedback.levels = {};
        }
        newQuestions[sectionIdx].feedback.levels[level] = value;
        setLocalQuestions(newQuestions);
        setHasChanges(true);
    };

    const handleIndustryChange = (e) => {
        if (hasChanges) {
            if (!confirm('Você tem alterações não salvas. Deseja realmente mudar de ramo? As alterações serão perdidas.')) {
                return;
            }
        }
        selectIndustryScope(e.target.value);
    };

    const saveChanges = () => {
        updateQuestions(localQuestions);
        setHasChanges(false);
        alert('Configurações de feedback salvas com sucesso!');
    };

    const levels = [
        { key: 'initial', label: 'Nível Inicial (0% - 25%)', color: 'text-accent-danger border-accent-danger/20' },
        { key: 'basic', label: 'Nível Básico (26% - 50%)', color: 'text-accent-warning border-accent-warning/20' },
        { key: 'intermediate', label: 'Nível Intermediário (51% - 75%)', color: 'text-primary border-primary/20' },
        { key: 'advanced', label: 'Nível Avançado (76% - 100%)', color: 'text-accent-success border-accent-success/20' }
    ];


    const [duplicateModal, setDuplicateModal] = useState({
        isOpen: false,
        sourceInd: '',
        sourceArea: 'all',
        targetInd: '',
        targetArea: 'new',
        showConfirm: false
    });

    const openDuplicateModal = () => {
        setDuplicateModal({
            isOpen: true,
            sourceInd: currentIndustryId,
            sourceArea: 'all',
            targetInd: '',
            targetArea: 'new',
            showConfirm: false
        });
    };

    const { duplicateQuestions } = useDiagnosis();

    const handleDuplicateSubmit = () => {
        const { sourceInd, sourceArea, targetInd, targetArea, showConfirm } = duplicateModal;
        if (!sourceInd || !targetInd) return;

        if (!showConfirm) {
            setDuplicateModal({ ...duplicateModal, showConfirm: true });
            return;
        }

        duplicateQuestions(
            { industryId: sourceInd, sectionId: sourceArea === 'all' ? null : sourceArea },
            {
                industryId: targetInd,
                sectionId: targetArea === 'new' ? null : targetArea,
            }
        );

        setDuplicateModal({ ...duplicateModal, isOpen: false });
        alert('Duplicação realizada com sucesso!');
        // Ideally we might refresh if target is current, but effect handles it via questions context update
    };

    return (
        <div className="animate-fadeIn pb-20">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 sticky top-0 bg-bg-secondary py-4 z-10 backdrop-blur-sm gap-4">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <MessageSquare className="text-primary" />
                        Feedback das Áreas
                    </h1>
                    <p className="text-text-secondary">Configure as mensagens de sugestão para cada nível de maturidade.</p>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={openDuplicateModal}
                        className="flex items-center gap-2 px-4 py-3 rounded-lg border border-border-color font-bold text-text-secondary hover:bg-bg-tertiary transition-colors"
                        title="Duplicar Feedbacks e Estrutura"
                    >
                        <Copy size={20} />
                        <span className="hidden sm:inline">Duplicar</span>
                    </button>

                    <div className="relative">
                        <select
                            value={currentIndustryId}
                            onChange={handleIndustryChange}
                            className="appearance-none bg-white border border-border-color rounded-lg pl-4 pr-10 py-3 font-medium text-text-primary outline-none focus:border-primary cursor-pointer hover:border-primary transition-colors shadow-sm"
                        >
                            {Array.isArray(industries) && industries.map(industry => (
                                <option key={industry.id} value={industry.id}>
                                    {industry.name} {industry.isFixed ? '(Padrão)' : ''}
                                </option>
                            ))}
                        </select>
                        <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
                    </div>

                    <button
                        onClick={saveChanges}
                        disabled={!hasChanges}
                        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all ${hasChanges
                            ? 'bg-primary hover:bg-primary-hover text-text-on-primary shadow-lg'
                            : 'bg-bg-tertiary text-text-secondary cursor-not-allowed'
                            }`}
                    >
                        <Save size={20} />
                        Salvar
                    </button>
                </div>
            </div>

            <div className="grid gap-8">
                {Array.isArray(localQuestions) && localQuestions.map((section, sIdx) => (
                    <div key={section.id} className="bg-white rounded-xl border border-border-color overflow-hidden">
                        <div className="p-6 border-b border-border-color bg-bg-secondary/30">
                            <h3 className="text-xl font-bold">{section.title}</h3>
                        </div>
                        <div className="p-6 grid gap-6 md:grid-cols-2">
                            {levels.map((level) => (
                                <div key={level.key} className={`p-4 rounded-lg border bg-bg-primary/50 ${level.color}`}>
                                    <label className="block text-sm font-bold mb-2 uppercase opacity-80">
                                        {level.label}
                                    </label>
                                    <textarea
                                        value={section.feedback?.levels?.[level.key] || ''}
                                        onChange={(e) => handleFeedbackChange(sIdx, level.key, e.target.value)}
                                        className="w-full p-3 rounded-lg border border-border-color bg-white focus:ring-2 focus:ring-primary outline-none text-text-primary"
                                        rows={3}
                                        placeholder={`Feedback para ${level.label.toLowerCase()}...`}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                {localQuestions.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-xl border border-border-color border-dashed">
                        <p className="text-text-secondary">Nenhuma área configurada para este ramo.</p>
                    </div>
                )}
            </div>

            {/* Duplicate Modal */}
            {duplicateModal.isOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fadeIn" onClick={() => setDuplicateModal({ ...duplicateModal, isOpen: false })}>
                    <div className="bg-white rounded-xl max-w-lg w-full p-8 shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>

                        {!duplicateModal.showConfirm ? (
                            <>
                                <h3 className="text-xl font-bold text-text-primary mb-6">Duplicar Apenas Feedback</h3>
                                <p className="text-sm text-text-secondary mb-4">
                                    Esta ação copiará os textos de feedback do ramo de origem para o ramo de destino,
                                    <strong>apenas onde houver correspondência exata dos nomes das áreas</strong>.
                                    A estrutura de perguntas (áreas) não será alterada.
                                </p>

                                <div className="space-y-6">
                                    {/* Source Section */}
                                    <div className="p-4 bg-bg-secondary rounded-lg border border-border-color">
                                        <h4 className="text-sm font-bold text-text-secondary uppercase mb-3 border-b border-border-color pb-2">Origem (De)</h4>
                                        <div className="space-y-3">
                                            <div>
                                                <label className="block text-xs font-medium text-text-secondary mb-1">Ramo de Atividade</label>
                                                <input
                                                    type="text"
                                                    value={industries.find(i => i.id === duplicateModal.sourceInd)?.name || ''}
                                                    disabled
                                                    className="w-full p-2 rounded border border-border-color bg-bg-tertiary text-text-secondary"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-center -my-3 z-10 relative text-text-secondary">
                                        <ChevronDown size={24} className="bg-white rounded-full p-1 border border-border-color" />
                                    </div>

                                    {/* Target Section */}
                                    <div className="p-4 bg-bg-secondary rounded-lg border border-border-color">
                                        <h4 className="text-sm font-bold text-text-secondary uppercase mb-3 border-b border-border-color pb-2">Destino (Para)</h4>
                                        <div className="space-y-3">
                                            <div>
                                                <label className="block text-xs font-medium text-text-secondary mb-1">Ramo de Atividade</label>
                                                <select
                                                    value={duplicateModal.targetInd}
                                                    onChange={(e) => setDuplicateModal({ ...duplicateModal, targetInd: e.target.value })}
                                                    className="w-full p-2 rounded border border-border-color bg-white"
                                                >
                                                    <option value="">Selecione o Ramo...</option>
                                                    {Array.isArray(industries) && industries.map(ind => (
                                                        <option key={ind.id} value={ind.id}>{ind.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3 mt-8">
                                    <button onClick={() => setDuplicateModal({ ...duplicateModal, isOpen: false })} className="flex-1 py-3 rounded-lg border border-border-color font-bold text-text-secondary hover:bg-bg-tertiary transition-colors">Cancelar</button>
                                    <button
                                        onClick={handleDuplicateSubmit}
                                        disabled={!duplicateModal.targetInd}
                                        className="flex-1 py-3 rounded-lg bg-primary hover:bg-primary-hover text-text-on-primary font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Duplicar Feedbacks
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center text-center">
                                <div className="w-16 h-16 bg-accent-warning/10 text-accent-warning rounded-full flex items-center justify-center mb-6">
                                    <Copy size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-text-primary mb-2">Confirmar Duplicação?</h3>

                                <p className="text-text-secondary text-sm mb-6 max-w-xs">
                                    Você está prestes a substituir os textos de feedback nas áreas correspondentes do ramo de destino.
                                </p>

                                <div className="flex gap-3 w-full">
                                    <button
                                        onClick={() => setDuplicateModal({ ...duplicateModal, showConfirm: false })}
                                        className="flex-1 py-3 rounded-lg border border-border-color font-bold text-text-secondary hover:bg-bg-tertiary transition-colors"
                                    >
                                        Voltar
                                    </button>
                                    <button
                                        onClick={handleDuplicateSubmit}
                                        className="flex-1 py-3 rounded-lg bg-primary hover:bg-primary-hover text-text-on-primary font-bold transition-colors"
                                    >
                                        Confirmar
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )
            }
        </div >
    );
};

export default FeedbackMaintenance;
