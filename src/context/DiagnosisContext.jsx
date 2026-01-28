import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { questionsData } from '../data/questions';

const DiagnosisContext = createContext();

// Detectar se está rodando localmente ou em produção para ajustar a URL da API
const API_URL = import.meta.env.VITE_API_URL || '/api';

export const DiagnosisProvider = ({ children }) => {
    // Basic States
    const [industries, setIndustries] = useState([]);
    const [history, setHistory] = useState([]);
    const [allQuestions, setAllQuestions] = useState({});
    const [currentIndustryId, setCurrentIndustryId] = useState('default-geral');
    const [loading, setLoading] = useState(true);

    const [answers, setAnswers] = useState({});
    const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
    const [userInfo, setUserInfo] = useState({
        nome: '',
        empresa: '',
        cargo: '',
        email: '',
        ramoAtividade: '',
        etn: '',
        vendedor: ''
    });

    // 1. Carregar Dados Iniciais da API
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setLoading(true);
                // Buscar Indústrias
                const indRes = await fetch(`${API_URL}/industries`);
                const indData = await indRes.json();

                // Garantir mapeamento de is_fixed para isFixed
                const mappedIndustries = Array.isArray(indData) ? indData.map(ind => ({
                    ...ind,
                    isFixed: ind.isFixed !== undefined ? ind.isFixed : (ind.is_fixed === 1 || ind.is_fixed === true)
                })) : [];

                setIndustries(mappedIndustries);

                // Buscar Histórico
                const histRes = await fetch(`${API_URL}/history`);
                const histData = await histRes.json();
                setHistory(histData);

                setLoading(false);
            } catch (error) {
                console.error('Erro ao carregar dados da API:', error);
                setLoading(false);
            }
        };

        fetchInitialData();
    }, []);

    // 2. Carregar Perguntas quando a Indústria mudar
    useEffect(() => {
        const fetchQuestions = async () => {
            if (!currentIndustryId) return;

            try {
                const res = await fetch(`${API_URL}/questions/${currentIndustryId}`);
                const data = await res.json();

                // Garantir que data seja um array antes de setar
                const questionsArray = Array.isArray(data) ? data : [];

                setAllQuestions(prev => ({
                    ...prev,
                    [currentIndustryId]: questionsArray
                }));
            } catch (error) {
                console.error('Erro ao buscar perguntas:', error);
            }
        };

        fetchQuestions();
    }, [currentIndustryId]);

    // Questions derived from current selection
    const questions = allQuestions[currentIndustryId] || [];

    const selectIndustryScope = (industryId) => {
        setCurrentIndustryId(industryId);
    };

    const addToHistory = async (result) => {
        try {
            const response = await fetch(`${API_URL}/diagnoses`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: crypto.randomUUID(),
                    industry_id: currentIndustryId,
                    userInfo: result.userInfo,
                    total_score: result.score,
                    maturity_level: result.maturityLabel || 'Não Definido',
                    answers: result.answers,
                    sectionScores: result.sectionScores.map(s => ({
                        ...s,
                        feedback_calculated: s.feedback_calculated // Pode ser enviado aqui
                    }))
                })
            });

            if (response.ok) {
                // Atualizar lista local de histórico
                const newListRes = await fetch(`${API_URL}/history`);
                const newList = await newListRes.json();
                setHistory(newList);
            }
        } catch (error) {
            console.error('Erro ao salvar diagnóstico:', error);
        }
    };

    // --- Funções de UI (Mantidas) ---
    const saveAnswer = (questionId, value) => {
        setAnswers(prev => ({ ...prev, [questionId]: value }));
    };

    const updateUserInfo = (field, value) => {
        setUserInfo(prev => ({ ...prev, [field]: value }));
    };

    const resetDiagnosis = () => {
        setAnswers({});
        setCurrentSectionIndex(0);
        setUserInfo({ nome: '', empresa: '', cargo: '', email: '', etn: '', vendedor: '', ramoAtividade: '', tempoOrcamento: '', faturamento: '' });
    }

    const nextSection = () => setCurrentSectionIndex(prev => prev + 1);
    const prevSection = () => setCurrentSectionIndex(prev => Math.max(0, prev - 1));

    const addIndustry = async (name) => {
        try {
            const response = await fetch(`${API_URL}/industries`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name })
            });

            if (response.ok) {
                const newIndustryData = await response.json();
                const newIndustry = {
                    ...newIndustryData,
                    isFixed: newIndustryData.isFixed !== undefined ? newIndustryData.isFixed : (newIndustryData.is_fixed === 1 || newIndustryData.is_fixed === true)
                };
                setIndustries(prev => [...prev, newIndustry]);
                return true;
            } else {
                const errorData = await response.json();
                console.error('Erro na API ao adicionar indústria:', errorData);
                alert(`Erro ao adicionar: ${errorData.error || 'Erro desconhecido'}`);
                return false;
            }
        } catch (error) {
            console.error('Erro ao adicionar indústria:', error);
            alert('Erro de conexão ao adicionar indústria.');
            return false;
        }
    };

    const updateIndustry = async (id, name) => {
        try {
            const response = await fetch(`${API_URL}/industries/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name })
            });

            if (response.ok) {
                setIndustries(prev => prev.map(ind => ind.id === id ? { ...ind, name } : ind));
            }
        } catch (error) {
            console.error('Erro ao atualizar indústria:', error);
        }
    };

    const deleteIndustry = async (id) => {
        try {
            const response = await fetch(`${API_URL}/industries/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                setIndustries(prev => prev.filter(ind => ind.id !== id));
            }
        } catch (error) {
            console.error('Erro ao excluir indústria:', error);
        }
    };

    const toggleIndustryStatus = async (id) => {
        try {
            const response = await fetch(`${API_URL}/industries/${id}/toggle`, {
                method: 'PATCH'
            });

            if (response.ok) {
                setIndustries(prev => prev.map(ind => ind.id === id ? { ...ind, active: ind.active ? 0 : 1 } : ind));
            }
        } catch (error) {
            console.error('Erro ao alterar status:', error);
        }
    };

    const updateQuestions = async (updatedSections) => {
        try {
            const response = await fetch(`${API_URL}/questions/${currentIndustryId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedSections)
            });

            if (response.ok) {
                setAllQuestions(prev => ({
                    ...prev,
                    [currentIndustryId]: updatedSections
                }));
                return true;
            } else {
                const errorData = await response.json();
                console.error('Erro ao atualizar perguntas:', errorData);
                alert(`Erro ao salvar: ${errorData.error || 'Erro desconhecido'}`);
                return false;
            }
        } catch (error) {
            console.error('Erro de conexão ao atualizar perguntas:', error);
            alert('Erro de conexão com o servidor.');
            return false;
        }
    };

    // Nota: Funções de Admin restantes precisarão de rotas no backend para persistência total.

    return (
        <DiagnosisContext.Provider value={{
            answers,
            saveAnswer,
            currentSectionIndex,
            setCurrentSectionIndex,
            nextSection,
            prevSection,
            userInfo,
            updateUserInfo,
            resetDiagnosis,
            history,
            addToHistory,
            questions,
            industries,
            selectIndustryScope,
            currentIndustryId,
            loading,
            // Fallbacks para as telas de admin não quebrarem (podem ser implementadas depois no backend)
            updateQuestions,
            addIndustry,
            updateIndustry,
            deleteIndustry,
            toggleIndustryStatus,
            scoringConfig: { 'default-geral': [0, 33, 66, 100] },
            updateScoringConfig: () => { },
            deleteFromHistory: () => { },
            deleteManyFromHistory: () => { }
        }}>
            {children}
        </DiagnosisContext.Provider>
    );
};

export const useDiagnosis = () => {
    const context = useContext(DiagnosisContext);
    if (!context) {
        throw new Error('useDiagnosis must be used within a DiagnosisProvider');
    }
    return context;
};

