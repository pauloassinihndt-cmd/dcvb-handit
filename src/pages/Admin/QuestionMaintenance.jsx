import { useState, useEffect } from 'react';
import { useBlocker } from 'react-router-dom';
import { useDiagnosis } from '../../context/DiagnosisContext';
import { ChevronDown, ChevronUp, Plus, Save, Eraser, Trash2, Copy } from 'lucide-react';

const QuestionMaintenance = () => {
    const { questions, updateQuestions, industries, selectIndustryScope, currentIndustryId, scoringConfig, duplicateQuestions } = useDiagnosis();
    const [expandedSection, setExpandedSection] = useState(null);

    // Deep copy for editing
    const [localQuestions, setLocalQuestions] = useState(() => JSON.parse(JSON.stringify(questions)));
    const [hasChanges, setHasChanges] = useState(false);

    // Sync when industry changes
    useEffect(() => {
        setLocalQuestions(JSON.parse(JSON.stringify(questions)));
        setHasChanges(false);
    }, [currentIndustryId, questions]);

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
        updateQuestions(localQuestions);
        setHasChanges(false);
        alert('Alterações salvas com sucesso!');
        if (blocker.state === "blocked") {
            blocker.proceed();
        }
    };

    const toggleSection = (idx) => {
        setExpandedSection(expandedSection === idx ? null : idx);
    };

    const handleQuestionChange = (sectionIdx, qIdx, field, value) => {
        const newQuestions = [...localQuestions];
        newQuestions[sectionIdx].questions[qIdx][field] = value;
        setLocalQuestions(newQuestions);
        setHasChanges(true);
    };

    const handleOptionChange = (sectionIdx, qIdx, optIdx, value) => {
        const newQuestions = [...localQuestions];
        newQuestions[sectionIdx].questions[qIdx].options[optIdx] = value;
        setLocalQuestions(newQuestions);
        setHasChanges(true);
    };

    const saveChanges = () => {
        updateQuestions(localQuestions);
        setHasChanges(false);
        alert('Alterações salvas com sucesso!');
    };


    const handleAddSection = () => {
        const newSection = {
            id: `section-${Date.now()}`,
            title: 'Nova Área',
            feedback: { low: '', high: '' },
            questions: []
        };
        setLocalQuestions([...localQuestions, newSection]);
        setHasChanges(true);
        setExpandedSection(localQuestions.length); // Auto-expand new section
    };

    const handleAddQuestion = (sectionIdx) => {
        const newQuestions = [...localQuestions];
        const activeCount = newQuestions[sectionIdx].questions.filter(q => !q.disabled).length;

        if (activeCount >= 6) {
            alert('Limite máximo de 6 perguntas ativas atingido. Desative uma pergunta existente para adicionar uma nova.');
            return;
        }

        const newQuestion = {
            id: `q-${Date.now()}`,
            text: 'Nova Pergunta',
            options: ['0', '33', '66', '100'],
            disabled: false
        };
        newQuestions[sectionIdx].questions.push(newQuestion);
        setLocalQuestions(newQuestions);
        setHasChanges(true);
    };

    const handleToggleDisable = (sectionIdx, qIdx) => {
        const newQuestions = [...localQuestions];
        const question = newQuestions[sectionIdx].questions[qIdx];

        // If enabling, check limit
        if (question.disabled) {
            const activeCount = newQuestions[sectionIdx].questions.filter(q => !q.disabled).length;
            if (activeCount >= 6) {
                alert('Limite máximo de 6 perguntas ativas atingido.');
                return;
            }
        }

        question.disabled = !question.disabled;
        setLocalQuestions(newQuestions);
        setHasChanges(true);
    };

    const [questionToDelete, setQuestionToDelete] = useState(null);

    const handleDeleteQuestionClick = (sectionIdx, qIdx) => {
        setQuestionToDelete({ sectionIdx, qIdx });
    };

    const confirmDeleteQuestion = () => {
        if (!questionToDelete) return;
        const { sectionIdx, qIdx } = questionToDelete;
        const newQuestions = [...localQuestions];
        newQuestions[sectionIdx].questions.splice(qIdx, 1);
        setLocalQuestions(newQuestions);
        setHasChanges(true);
        setQuestionToDelete(null);
    };

    const cancelDeleteQuestion = () => {
        setQuestionToDelete(null);
    };

    const [sectionToDelete, setSectionToDelete] = useState(null);

    const deleteSection = (idx) => {
        setSectionToDelete(idx);
    };

    const confirmDeleteSection = () => {
        if (sectionToDelete === null) return;
        const newQuestions = localQuestions.filter((_, i) => i !== sectionToDelete);
        setLocalQuestions(newQuestions);
        setHasChanges(true);
        setExpandedSection(null);
        setSectionToDelete(null);
    };

    const cancelDeleteSection = () => {
        setSectionToDelete(null);
    };

    const handleIndustryChange = (e) => {
        if (hasChanges) {
            if (!confirm('Você tem alterações não salvas. Deseja realmente mudar de ramo? As alterações perdidas.')) {
                return; // Abort switch
            }
        }
        selectIndustryScope(e.target.value);
    };

    const handleClearQuestions = (idx) => {
        if (confirm('Tem certeza que deseja apagar todas as perguntas desta área? A área será mantida, mas ficará vazia.')) {
            const newQuestions = [...localQuestions];
            newQuestions[idx].questions = [];
            setLocalQuestions(newQuestions);
            setHasChanges(true);
        }
    };

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
            sourceInd: currentIndustryId, // Default to current
            sourceArea: 'all',
            targetInd: '',
            targetArea: 'new',
            showConfirm: false
        });
    };

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
        if (targetInd === currentIndustryId) {
            // Logic to trigger refresh?
        }
    };

    // Helper to get areas for a selected industry for the dropdowns
    // Since we only have access to 'questions' (current industry) in the simple hook destructure,
    // we strictly need access to ALL questions to populate dropdowns for other industries.
    // However, the component only gets 'questions' for current.
    // We can rely on 'selectIndustryScope' to peek? No.
    // Ideally we should expose 'allQuestions' or a helper 'getSectionsForIndustry' from context.
    // For now, let's assume the user can only grab areas from the CURRENT industry as Source?
    // User request: "duplicar perguntas entre ramos e areas". 
    // Implies Any Ramo -> Any Ramo.
    // Solution: Modifying QuestionMaintenance to access allQuestions might be too much refactoring.
    // Alternative: The dropdowns only populate for *current* industry? No, that limits the "From" part if I want to copy FROM another.
    // Let's assume the user starts on the SOURCE industry to copy FROM. 
    // And selects a TARGET industry to copy TO.
    // "From" Source Area: List from `localQuestions` (since we are on that industry).
    // "To" Target Area: This is harder if target is different. We don't list target areas if we don't have them.
    // Simplified UX:
    // Source: Current Industry (Fixed)
    // Source Area: Select from Current List ('Todos' or Specific)
    // Target: Select Industry
    // Target Area: 'Nova Area' (Default) OR 'Append to Matching Name' (Smart).
    // Let's stick to 'Nova Area' (New section) or 'Merge/Replace' (if All).
    // UI:
    // Source: [Current Industry Name]
    // Area: [Dropdown of localQuestions]
    // Target: [Dropdown of industries]
    // confirm.

    return (
        <div className="animate-fadeIn pb-20">
            {/* ... Header ... */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 sticky top-0 bg-bg-secondary py-4 z-10 backdrop-blur-sm gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Manutenção de Perguntas</h1>
                    <p className="text-text-secondary">Edite, adicione ou remova perguntas e áreas.</p>
                </div>

                <div className="flex flex-wrap gap-4 items-center">
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
                        onClick={openDuplicateModal}
                        className="flex items-center gap-2 px-4 py-3 rounded-lg bg-white border border-border-color hover:bg-bg-tertiary font-bold text-text-secondary transition-all"
                        title="Duplicar registros"
                    >
                        <Copy size={20} />
                        Duplicar
                    </button>

                    <button
                        onClick={handleAddSection}
                        className="flex items-center gap-2 px-4 py-3 rounded-lg bg-white border border-border-color hover:bg-bg-tertiary font-bold text-text-secondary transition-all"
                    >
                        <Plus size={20} />
                        Nova Área
                    </button>
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

            {/* ... Existing ... */}
            {localQuestions.length === 0 && (
                <div className="text-center py-20 bg-white rounded-xl border border-border-color border-dashed">
                    <p className="text-text-secondary mb-4">Nenhuma área configurada.</p>
                    <button
                        onClick={handleAddSection}
                        className="px-4 py-2 bg-primary text-text-on-primary rounded-lg font-bold"
                    >
                        Criar Primeira Área
                    </button>
                </div>
            )}

            <div className="flex flex-col gap-6">
                {Array.isArray(localQuestions) && localQuestions.map((section, sIdx) => {
                    const activeQuestionsCount = Array.isArray(section.questions) ? section.questions.filter(q => !q.disabled).length : 0;
                    const inactiveQuestionsCount = Array.isArray(section.questions) ? section.questions.length - activeQuestionsCount : 0;

                    return (
                        <div key={section.id} className="bg-white rounded-xl border border-border-color overflow-hidden">
                            <div className="flex justify-between items-center p-6 hover:bg-bg-secondary transition-colors group">
                                <button
                                    onClick={() => toggleSection(sIdx)}
                                    className="flex-1 text-left flex justify-between items-center pr-4"
                                >
                                    <div className="flex items-center gap-4">
                                        <div>
                                            {expandedSection === sIdx ? (
                                                <input
                                                    value={section.title}
                                                    onClick={(e) => e.stopPropagation()}
                                                    onChange={(e) => {
                                                        const newQuestions = [...localQuestions];
                                                        newQuestions[sIdx].title = e.target.value;
                                                        setLocalQuestions(newQuestions);
                                                        setHasChanges(true);
                                                    }}
                                                    className="text-xl font-bold bg-transparent border-b border-dashed border-text-secondary focus:border-primary outline-none"
                                                />
                                            ) : (
                                                <h3 className="text-xl font-bold">{section.title}</h3>
                                            )}
                                        </div>
                                        <div className="flex gap-2 text-xs font-semibold">
                                            <span className="bg-primary/10 text-primary px-2 py-1 rounded">
                                                {activeQuestionsCount} Ativas
                                            </span>
                                            <span className="bg-bg-tertiary text-text-secondary px-2 py-1 rounded">
                                                {inactiveQuestionsCount} Inativas
                                            </span>
                                        </div>
                                    </div>
                                    {expandedSection === sIdx ? <ChevronUp /> : <ChevronDown />}
                                </button>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 relative z-10">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleClearQuestions(sIdx); }}
                                        className="p-2 text-text-secondary hover:text-accent-danger transition-colors"
                                        title="Apagar todas as perguntas desta área"
                                    >
                                        <Eraser size={18} />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); deleteSection(sIdx); }}
                                        className="p-2 text-text-secondary hover:text-accent-danger transition-colors"
                                        title="Excluir Área"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>

                            {expandedSection === sIdx && (
                                <div className="p-6 border-t border-border-color bg-bg-secondary/30">
                                    <div className="flex flex-col gap-8">
                                        {Array.isArray(section.questions) && section.questions.map((q, qIdx) => (
                                            <div key={q.id} className={`bg-white p-6 rounded-lg border transition-all ${q.disabled ? 'border-border-color opacity-60 bg-bg-tertiary' : 'border-border-color'}`}>
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="flex gap-2 items-center mb-1">
                                                        <label className="block text-xs font-bold text-text-secondary uppercase">
                                                            Pergunta {qIdx + 1}
                                                        </label>
                                                        {q.disabled && <span className="text-xs font-bold text-accent-danger bg-accent-danger/10 px-2 py-0.5 rounded">DESATIVADA</span>}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => handleToggleDisable(sIdx, qIdx)}
                                                            className={`text-xs font-bold px-2 py-1 rounded transition-colors ${q.disabled ? 'bg-primary text-text-on-primary' : 'bg-bg-tertiary text-text-secondary hover:bg-accent-danger hover:text-white'}`}
                                                        >
                                                            {q.disabled ? 'Ativar' : 'Desativar'}
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteQuestionClick(sIdx, qIdx)}
                                                            className="p-1 text-text-secondary hover:text-accent-danger transition-colors bg-bg-tertiary rounded hover:bg-accent-danger/10"
                                                            title="Excluir Pergunta"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="mb-4">
                                                    <textarea
                                                        value={q.text}
                                                        onChange={(e) => handleQuestionChange(sIdx, qIdx, 'text', e.target.value)}
                                                        className="w-full p-3 rounded-lg border border-border-color focus:ring-2 focus:ring-primary outline-none"
                                                        rows={2}
                                                        disabled={q.disabled && !q.text.includes("Nova Pergunta")}
                                                    />
                                                </div>

                                                <div className="space-y-3">
                                                    <label className="block text-sm font-bold text-text-secondary uppercase mb-2">
                                                        Opções de Resposta
                                                    </label>
                                                    {Array.isArray(q.options) && q.options.map((opt, optIdx) => {
                                                        const scores = scoringConfig[currentIndustryId] || [0, 33, 66, 100];
                                                        const score = scores[optIdx];
                                                        const label = ['A', 'B', 'C', 'D'][optIdx];

                                                        return (
                                                            <div key={optIdx} className="flex items-center gap-3">
                                                                <div className="flex flex-col items-center justify-center w-12 flex-shrink-0">
                                                                    <span className="font-bold text-lg text-primary">{label}</span>
                                                                    <span className="text-xs text-text-secondary whitespace-nowrap">{score}%</span>
                                                                </div>
                                                                <input
                                                                    type="text"
                                                                    value={opt}
                                                                    onChange={(e) => handleOptionChange(sIdx, qIdx, optIdx, e.target.value)}
                                                                    className="flex-1 p-3 rounded border border-border-color focus:ring-2 focus:ring-primary outline-none"
                                                                    placeholder={`Texto da opção ${label}`}
                                                                />
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))}

                                        <button
                                            onClick={() => handleAddQuestion(sIdx)}
                                            className="w-full py-4 border-2 border-dashed border-border-color rounded-lg text-text-secondary font-bold hover:border-primary hover:text-primary transition-colors flex justify-center items-center gap-2"
                                        >
                                            <Plus size={20} />
                                            Adicionar Pergunta
                                        </button>
                                    </div>
                                </div>
                            )
                            }
                        </div>
                    );
                })}
            </div>

            {/* Existing Modals ... */}
            {questionToDelete && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fadeIn" onClick={cancelDeleteQuestion}>
                    <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="flex flex-col items-center text-center mb-6">
                            <div className="w-16 h-16 bg-accent-danger/10 text-accent-danger rounded-full flex items-center justify-center mb-4">
                                <Trash2 size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-text-primary mb-2">Excluir Pergunta?</h3>
                            <p className="text-text-secondary">
                                Tem certeza que deseja excluir esta pergunta? Esta ação não pode ser desfeita.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={cancelDeleteQuestion} className="flex-1 py-3 rounded-lg border border-border-color font-bold text-text-secondary hover:bg-bg-tertiary transition-colors">Cancelar</button>
                            <button onClick={confirmDeleteQuestion} className="flex-1 py-3 rounded-lg bg-accent-danger hover:bg-red-600 text-white font-bold transition-colors">Sim, Excluir</button>
                        </div>
                    </div>
                </div>
            )}

            {sectionToDelete !== null && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fadeIn" onClick={cancelDeleteSection}>
                    <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="flex flex-col items-center text-center mb-6">
                            <div className="w-16 h-16 bg-accent-danger/10 text-accent-danger rounded-full flex items-center justify-center mb-4">
                                <Trash2 size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-text-primary mb-2">Excluir Área?</h3>
                            <p className="text-text-secondary">
                                Tem certeza que deseja excluir esta área e todas as suas perguntas? Esta ação não pode ser desfeita.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={cancelDeleteSection} className="flex-1 py-3 rounded-lg border border-border-color font-bold text-text-secondary hover:bg-bg-tertiary transition-colors">Cancelar</button>
                            <button onClick={confirmDeleteSection} className="flex-1 py-3 rounded-lg bg-accent-danger hover:bg-red-600 text-white font-bold transition-colors">Sim, Excluir</button>
                        </div>
                    </div>
                </div>
            )}

            {blocker.state === "blocked" && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fadeIn" onClick={cancelLeave}>
                    <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="flex flex-col items-center text-center mb-6">
                            <div className="w-16 h-16 bg-accent-warning/10 text-accent-warning rounded-full flex items-center justify-center mb-4">
                                <Save size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-text-primary mb-2">Alterações não Salvas</h3>
                            <p className="text-text-secondary">
                                Você tem alterações pendentes. Deseja salvá-las antes de sair?
                            </p>
                        </div>
                        <div className="flex flex-col gap-3">
                            <button onClick={saveAndLeave} className="w-full py-3 rounded-lg bg-primary hover:bg-primary-hover text-text-on-primary font-bold transition-colors">Salvar e Sair</button>
                            <button onClick={confirmLeave} className="w-full py-3 rounded-lg border border-border-color font-bold text-accent-danger hover:bg-bg-tertiary transition-colors">Sair sem Salvar</button>
                            <button onClick={cancelLeave} className="w-full py-3 rounded-lg border border-border-color font-bold text-text-secondary hover:bg-bg-tertiary transition-colors">Cancelar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Duplicate Modal */}
            {/* Duplicate Modal */}
            {duplicateModal.isOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fadeIn" onClick={() => setDuplicateModal({ ...duplicateModal, isOpen: false })}>
                    <div className="bg-white rounded-xl max-w-lg w-full p-8 shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>

                        {!duplicateModal.showConfirm ? (
                            <>
                                <h3 className="text-xl font-bold text-text-primary mb-6">Duplicar Registros</h3>

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
                                            <div>
                                                <label className="block text-xs font-medium text-text-secondary mb-1">Área</label>
                                                <select
                                                    value={duplicateModal.sourceArea}
                                                    onChange={(e) => setDuplicateModal({ ...duplicateModal, sourceArea: e.target.value })}
                                                    className="w-full p-2 rounded border border-border-color bg-white"
                                                >
                                                    <option value="all">Todas as Áreas (Ramo Completo)</option>
                                                    {Array.isArray(localQuestions) && localQuestions.map(sec => (
                                                        <option key={sec.id} value={sec.id}>{sec.title}</option>
                                                    ))}
                                                </select>
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

                                            {duplicateModal.sourceArea !== 'all' && (
                                                <div className="text-xs text-text-secondary italic">
                                                    A área selecionada será adicionada como uma NOVA área no ramo de destino.
                                                </div>
                                            )}

                                            {duplicateModal.sourceArea === 'all' && (
                                                <div className="text-xs text-accent-warning font-bold flex items-center gap-1">
                                                    <span className="p-1 bg-accent-warning/20 rounded-full">!</span>
                                                    Atenção: Isso substituirá todas as perguntas do ramo de destino.
                                                </div>
                                            )}
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
                                        Duplicar
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
                                    {duplicateModal.sourceArea === 'all'
                                        ? <span>Você está prestes a substituir <strong>TODO</strong> o conteúdo do ramo selecionado. Isso não poderá ser desfeito.</span>
                                        : <span>Você está prestes a adicionar uma nova área ao ramo selecionado.</span>
                                    }
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
            )}

        </div>
    );
};

export default QuestionMaintenance;
