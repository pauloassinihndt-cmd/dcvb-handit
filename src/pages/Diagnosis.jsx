import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDiagnosis } from '../context/DiagnosisContext';
import { questionsData } from '../data/questions';
import { ChevronRight, ChevronLeft, Send, User } from 'lucide-react';

const Diagnosis = () => {
    const {
        currentSectionIndex,
        setCurrentSectionIndex,
        userInfo,
        updateUserInfo,
        answers,
        saveAnswer,
        nextSection,
        prevSection,
        questions,
        industries,
        selectIndustryScope
    } = useDiagnosis();

    const navigate = useNavigate();
    const [localStep, setLocalStep] = useState(0); // 0 = User Info, 1 = Questions

    // Refs for auto-scroll
    const questionRefs = useRef([]);
    const footerRef = useRef(null);

    // We need to derive active questions from the DYNAMIC questions logic
    // Let's filter here first.
    const activeQuestionsData = questions.map(section => ({
        ...section,
        questions: section.questions.filter(q => !q.disabled)
    })).filter(section => section.questions.length > 0);

    const currentSection = activeQuestionsData[currentSectionIndex];

    // Progress calculation
    const totalSections = activeQuestionsData.length;
    // If we are in "User Info" (localStep 0), progress is 0%.
    // If we are answering questions, progress is based on sections completed.
    const progress = localStep === 0 ? 0 : ((currentSectionIndex / totalSections) * 100);

    const handleAnswer = (questionId, optionIndex, index) => {
        saveAnswer(questionId, optionIndex);

        // Auto-scroll to next question
        setTimeout(() => {
            if (index < currentSection.questions.length - 1) {
                questionRefs.current[index + 1]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
                footerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 300);
    };

    const handleUserSubmit = (e) => {
        e.preventDefault();
        if (userInfo.nome && userInfo.email && userInfo.empresa && userInfo.cargo && userInfo.ramoAtividade) {
            // Find the selected industry ID
            const selectedIndustry = industries.find(i => i.name === userInfo.ramoAtividade);
            if (selectedIndustry) {
                selectIndustryScope(selectedIndustry.id);
            }
            setLocalStep(1); // Move to questions
        }
    };

    const isSectionComplete = () => {
        if (!currentSection) return false;
        return currentSection.questions.every(q => answers[q.id] !== undefined);
    };

    const handleNext = () => {
        if (currentSectionIndex < totalSections - 1) {
            nextSection();
            window.scrollTo(0, 0);
        } else {
            navigate('/resultados');
        }
    };

    // Calculate total steps for display if needed
    const allQuestions = activeQuestionsData.flatMap(section =>
        section.questions.map(q => ({ ...q, section: section.title, sectionId: section.id }))
    );
    const totalSteps = allQuestions.length + 1;

    if (localStep === 0) {
        return (

            <div className="max-w-6xl mx-auto mt-10 px-4">
                <form onSubmit={handleUserSubmit}>
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Left Column: Identificação Card */}
                        <div className="bg-bg-secondary p-8 rounded-xl border border-border-color shadow-lg">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-primary/20 rounded-lg text-primary">
                                    <User size={24} />
                                </div>
                                <h2 className="text-2xl font-bold">Identificação</h2>
                            </div>
                            <p className="text-text-secondary mb-8">
                                Dados do responsável e da empresa.
                            </p>

                            <div className="flex flex-col gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Nome Completo <span className="text-accent-danger ml-1">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-bg-primary border border-border-color rounded-lg p-3 focus:ring-2 focus:ring-primary outline-none transition-all"
                                        value={userInfo.nome}
                                        onChange={e => updateUserInfo('nome', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        E-mail Corporativo <span className="text-accent-danger ml-1">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        className="w-full bg-bg-primary border border-border-color rounded-lg p-3 focus:ring-2 focus:ring-primary outline-none transition-all"
                                        value={userInfo.email}
                                        onChange={e => updateUserInfo('email', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Empresa <span className="text-accent-danger ml-1">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-bg-primary border border-border-color rounded-lg p-3 focus:ring-2 focus:ring-primary outline-none transition-all"
                                        value={userInfo.empresa}
                                        onChange={e => updateUserInfo('empresa', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Cargo <span className="text-accent-danger ml-1">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-bg-primary border border-border-color rounded-lg p-3 focus:ring-2 focus:ring-primary outline-none transition-all"
                                        value={userInfo.cargo}
                                        onChange={e => updateUserInfo('cargo', e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Ramo de Atividade <span className="text-accent-danger ml-1">*</span>
                                    </label>
                                    <select
                                        required
                                        className="w-full bg-bg-primary border border-border-color rounded-lg p-3 focus:ring-2 focus:ring-primary outline-none transition-all text-text-primary"
                                        value={userInfo.ramoAtividade || ''}
                                        onChange={e => updateUserInfo('ramoAtividade', e.target.value)}
                                    >
                                        <option value="">Selecione</option>
                                        {industries.filter(i => i.active).map(industry => (
                                            <option key={industry.id} value={industry.name}>
                                                {industry.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">ETN</label>
                                    <input
                                        type="text"
                                        className="w-full bg-bg-primary border border-border-color rounded-lg p-3 focus:ring-2 focus:ring-primary outline-none transition-all"
                                        value={userInfo.etn || ''}
                                        onChange={e => updateUserInfo('etn', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Vendedor</label>
                                    <input
                                        type="text"
                                        className="w-full bg-bg-primary border border-border-color rounded-lg p-3 focus:ring-2 focus:ring-primary outline-none transition-all"
                                        value={userInfo.vendedor || ''}
                                        onChange={e => updateUserInfo('vendedor', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Características Card */}
                        <div className="bg-bg-secondary p-8 rounded-xl border border-border-color shadow-lg">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-accent-info/20 rounded-lg text-accent-info">
                                    <ChevronRight size={24} />
                                </div>
                                <h2 className="text-2xl font-bold">Características</h2>
                            </div>
                            <p className="text-text-secondary mb-8">
                                Informações adicionais para segmentação.
                            </p>

                            <div className="flex flex-col gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Quanto tempo faz orçamento?</label>
                                    <select
                                        className="w-full bg-bg-primary border border-border-color rounded-lg p-3 focus:ring-2 focus:ring-primary outline-none transition-all text-text-primary"
                                        value={userInfo.tempoOrcamento || ''}
                                        onChange={e => updateUserInfo('tempoOrcamento', e.target.value)}
                                    >
                                        <option value="">Selecione</option>
                                        <option value="Não faz orçamento">Não faz orçamento</option>
                                        <option value="1 Ano">1 Ano</option>
                                        <option value="2 Anos">2 Anos</option>
                                        <option value="3 Anos">3 Anos</option>
                                        <option value="4 Anos ou mais">4 Anos ou mais</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Quantas pessoas participam do processo?</label>
                                    <select
                                        className="w-full bg-bg-primary border border-border-color rounded-lg p-3 focus:ring-2 focus:ring-primary outline-none transition-all text-text-primary"
                                        value={userInfo.pessoasProcesso || ''}
                                        onChange={e => updateUserInfo('pessoasProcesso', e.target.value)}
                                    >
                                        <option value="">Selecione</option>
                                        <option value="Não + 3">Não + 3</option>
                                        <option value="Entre 4 e 9">Entre 4 e 9</option>
                                        <option value="Entre 10 e 19">Entre 10 e 19</option>
                                        <option value="Entre 20 e 29">Entre 20 e 29</option>
                                        <option value="Entre 30 e 49">Entre 30 e 49</option>
                                        <option value="Entre 50 e 99">Entre 50 e 99</option>
                                        <option value="+ 100">+ 100</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Faturamento</label>
                                    <select
                                        className="w-full bg-bg-primary border border-border-color rounded-lg p-3 focus:ring-2 focus:ring-primary outline-none transition-all text-text-primary"
                                        value={userInfo.faturamento || ''}
                                        onChange={e => updateUserInfo('faturamento', e.target.value)}
                                    >
                                        <option value="">Selecione</option>
                                        <option value="ate 100">ate 100</option>
                                        <option value="100 - 299">100 - 299</option>
                                        <option value="300 - 599">300 - 599</option>
                                        <option value="600 - 3Bi">600 - 3Bi</option>
                                        <option value="4Bi +">4Bi +</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Faixa Colaboradores</label>
                                    <select
                                        className="w-full bg-bg-primary border border-border-color rounded-lg p-3 focus:ring-2 focus:ring-primary outline-none transition-all text-text-primary"
                                        value={userInfo.faixaColaboradores || ''}
                                        onChange={e => updateUserInfo('faixaColaboradores', e.target.value)}
                                    >
                                        <option value="">Selecione</option>
                                        <option value="Até 49">Até 49</option>
                                        <option value="50 - 99">50 - 99</option>
                                        <option value="100 - 249">100 - 249</option>
                                        <option value="250 - 499">250 - 499</option>
                                        <option value="500 - 999">500 - 999</option>
                                        <option value="1000 - 1999">1000 - 1999</option>
                                        <option value="2000 - 4999">2000 - 4999</option>
                                        <option value="5000 - 9999">5000 - 9999</option>
                                        <option value="10000 - 29999">10000 - 29999</option>
                                        <option value="30000+">30000+</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">ERP</label>
                                    <select
                                        className="w-full bg-bg-primary border border-border-color rounded-lg p-3 focus:ring-2 focus:ring-primary outline-none transition-all text-text-primary"
                                        value={userInfo.erp || ''}
                                        onChange={e => updateUserInfo('erp', e.target.value)}
                                    >
                                        <option value="">Selecione</option>
                                        <option value="Todos">Todos</option>
                                        <option value="SAP S4Hanna">SAP S4Hanna</option>
                                        <option value="Oracle">Oracle</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex justify-center">
                        <button
                            type="submit"
                            className="bg-primary hover:bg-primary-hover text-white py-4 px-12 rounded-lg font-bold text-lg transition-colors shadow-lg shadow-primary/20 w-full md:w-auto min-w-[300px]"
                        >
                            Começar Diagnóstico
                        </button>
                    </div>
                </form>
            </div>
        );
    }




    return (
        <div className="max-w-3xl mx-auto flex flex-col gap-8">
            {/* Header / Progress */}
            <div>
                <div className="flex justify-between items-end mb-2">
                    <h2 className="text-2xl font-bold">Seção {currentSectionIndex + 1}: {currentSection?.title}</h2>
                    <span className="text-sm text-text-secondary">
                        {Math.round(((currentSectionIndex) / totalSections) * 100)}% concluído
                    </span>
                </div>
                <div className="w-full h-2 bg-bg-tertiary rounded-full overflow-hidden">
                    <div
                        className="h-full bg-primary transition-all duration-500 ease-out"
                        style={{ width: `${((currentSectionIndex) / totalSections) * 100}%` }}
                    />
                </div>
            </div>

            {/* Questions List */}
            <div className="flex flex-col gap-8">
                {currentSection?.questions.map((q, idx) => (
                    <div
                        key={q.id}
                        ref={el => questionRefs.current[idx] = el}
                        className="bg-bg-secondary p-6 rounded-xl border border-border-color animate-fadeIn"
                        style={{ animationDelay: `${idx * 100}ms` }}
                    >
                        <h3 className="text-lg font-semibold mb-4 flex gap-3">
                            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-bg-tertiary flex items-center justify-center text-sm font-bold text-text-secondary">
                                {idx + 1}
                            </span>
                            {q.text}
                        </h3>

                        <div className="grid md:grid-cols-2 gap-3 pl-11">
                            {q.options.map((option, optIdx) => {
                                const isSelected = answers[q.id] === optIdx;

                                return (
                                    <button
                                        key={optIdx}
                                        onClick={() => handleAnswer(q.id, optIdx, idx)}
                                        className={`text-left p-4 rounded-lg border transition-all ${isSelected
                                            ? 'border-primary bg-primary/10 text-primary'
                                            : 'border-border-color hover:border-text-secondary hover:bg-bg-tertiary'
                                            }`}
                                    >
                                        {option}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* Navigation Footer */}
            <div ref={footerRef} className="flex justify-between pt-8 border-t border-border-color">
                <button
                    onClick={prevSection}
                    disabled={currentSectionIndex === 0}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${currentSectionIndex === 0
                        ? 'text-text-secondary opacity-50 cursor-not-allowed'
                        : 'text-text-primary hover:bg-bg-secondary'
                        }`}
                >
                    <ChevronLeft size={20} />
                    Anterior
                </button>

                <button
                    onClick={handleNext}
                    disabled={!isSectionComplete()}
                    className={`flex items-center gap-2 px-8 py-3 rounded-lg font-bold transition-all ${isSectionComplete()
                        ? 'bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary/25'
                        : 'bg-bg-tertiary text-text-secondary cursor-not-allowed'
                        }`}
                >
                    {currentSectionIndex === totalSections - 1 ? 'Finalizar e Ver Resultados' : 'Próxima Seção'}
                    {currentSectionIndex === totalSections - 1 ? <Send size={20} /> : <ChevronRight size={20} />}
                </button>
            </div>
        </div>
    );
};

export default Diagnosis;
