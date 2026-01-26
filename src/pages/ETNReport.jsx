import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDiagnosis } from '../context/DiagnosisContext';
import ScoreChart from '../components/ScoreChart';
import { RefreshCcw, Download, FileText } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import logo from '../assets/logo.png';

const ETNReport = () => {
    // Get questions from context to support dynamic updates/feedback
    const { answers: contextAnswers, userInfo: contextUserInfo, resetDiagnosis, addToHistory, questions: contextQuestions } = useDiagnosis();
    const navigate = useNavigate();
    const location = useLocation();

    // Determine if we are viewing a past result or a fresh one
    const historyItem = location.state?.historyItem;

    // Use data from history if available, otherwise from context
    const isHistoryView = !!historyItem;
    const answers = isHistoryView ? (historyItem.answers || {}) : contextAnswers;
    const userInfo = isHistoryView ? (historyItem.userInfo || historyItem) : contextUserInfo;

    // Use questions from context for current view to get latest feedback,
    // UNLESS it's history view. For history, we might want to use the feedback *at the time*?
    // Actually, history items don't store the full questions structure usually, just answers/scores.
    // But 'sectionScores' in history MIGHT have the feedback if we saved it?
    // Current save logic saves 'sectionScores'. 
    // Let's use the 'questions' from context as the base for the structure if we need to recalculate,
    // or rely on 'sectionScores' if it exists.

    // For fresh results, we MUST use 'contextQuestions' to pick up the new feedback texts.
    // 'questionsData' import is static and won't have the admin edits.
    const questionsSource = contextQuestions;

    // Note: Old history items might not have 'answers' saved. In that case, visual breakdown won't work perfectly.
    // We will handle this gracefully.

    // Redirect if no answers and not viewing history
    useEffect(() => {
        if (!isHistoryView && Object.keys(answers).length === 0) {
            navigate('/diagnostico');
        }
    }, [answers, navigate, isHistoryView]);

    const getPoints = (idx) => {
        if (idx === 0) return 0;
        if (idx === 1) return 33;
        if (idx === 2) return 66;
        if (idx === 3) return 100;
        return 0;
    };

    // Calculate scores
    const sectionScores = historyItem?.sectionScores || questionsSource.map(section => {
        const questions = section.questions;
        const sectionTotalMax = questions.length * 100;

        const sectionPoints = questions.reduce((acc, q) => {
            const answerIdx = answers[q.id];
            return acc + (answerIdx !== undefined ? getPoints(answerIdx) : 0);
        }, 0);

        const percentage = Math.round((sectionPoints / sectionTotalMax) * 100);

        return {
            id: section.id,
            title: section.title,
            score: percentage,
            subject: section.title,
            A: percentage,
            fullMark: 100,
            feedback: section.feedback // Pass feedback to result object
        };
    });

    const overallScore = historyItem?.score ?? Math.round(
        sectionScores.reduce((acc, s) => acc + s.score, 0) / sectionScores.length
    );

    const getMaturityLevel = (score) => {
        if (score < 40) return { label: 'Inicial', color: 'text-accent-danger' };
        if (score < 70) return { label: 'Em Desenvolvimento', color: 'text-accent-warning' };
        if (score < 90) return { label: 'Avançado', color: 'text-primary' };
        return { label: 'Best-in-Class', color: 'text-accent-success' };
    };

    const maturity = getMaturityLevel(overallScore);

    // Save to history ONLY if it's a new diagnosis (not viewing history)
    useEffect(() => {
        if (!isHistoryView && Object.keys(answers).length > 0) {
            addToHistory({
                date: new Date().toISOString(),
                company: userInfo.empresa,
                name: userInfo.nome,
                score: overallScore,
                sectionScores, // Save scores for easier replay
                answers, // Save raw answers if needed later
                userInfo // Save full user info (including ETN/Vendedor)
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Run once on mount

    const [showRestartModal, setShowRestartModal] = useState(false);

    const handleRestart = () => {
        setShowRestartModal(true);
    };

    const confirmRestart = () => {
        resetDiagnosis();
        setShowRestartModal(false);
        navigate('/diagnostico');
    };

    const cancelRestart = () => {
        setShowRestartModal(false);
    };

    const resultsRef = useRef(null);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

    const handleDownloadPDF = async () => {
        setIsGeneratingPdf(true);
        try {
            const element = resultsRef.current;
            const canvas = await html2canvas(element, {
                scale: 3,
                useCORS: true,
                backgroundColor: '#ffffff',
                onclone: (document) => {
                    const el = document.querySelector('.animate-fadeIn');
                    if (el) {
                        el.classList.remove('animate-fadeIn');
                        el.style.opacity = '1';
                        el.style.transform = 'none';
                        el.style.animation = 'none';
                    }
                }
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            const imgProps = pdf.getImageProperties(imgData);
            const pdfHeightCalcd = (imgProps.height * pdfWidth) / imgProps.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeightCalcd);
            const dateStr = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
            pdf.save(`Relatorio-ETN-${userInfo.empresa || 'Empresa'}-${dateStr}.pdf`);

        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Erro ao gerar PDF. Tente novamente.');
        } finally {
            setIsGeneratingPdf(false);
        }
    };

    const [isGeneratingWord, setIsGeneratingWord] = useState(false);

    const handleDownloadWord = async () => {
        setIsGeneratingWord(true);
        try {
            // Capture Charts as Images
            const radarElement = document.getElementById('chart-radar');
            const barsElement = document.getElementById('chart-bars');

            let radarImg = '';
            let barsImg = '';

            if (radarElement) {
                const canvas = await html2canvas(radarElement, { scale: 3, backgroundColor: '#ffffff' });
                radarImg = canvas.toDataURL('image/png');
            }

            if (barsElement) {
                const canvas = await html2canvas(barsElement, { scale: 3, backgroundColor: '#ffffff' });
                barsImg = canvas.toDataURL('image/png');
            }

            // Build HTML Content for Word
            // Using inline styles for better compatibility
            let htmlBody = `
                <div style="font-family: Arial, sans-serif; color: #333;">
                    <!-- Header -->
                    <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #eee; padding-bottom: 20px;">
                        <h1 style="font-size: 24pt; color: #000; margin: 0;">Relatório de Maturidade - ETN</h1>
                        <p style="font-size: 12pt; color: #666; margin-top: 10px;">
                            Diagnosticado para <strong>${userInfo.empresa}</strong><br/>
                            ${userInfo.nome} • ${new Date(historyItem?.date || new Date()).toLocaleDateString('pt-BR')}
                        </p>
                    </div>

                    <!-- Overall Score -->
                    <div style="margin-bottom: 40px; text-align: center;">
                        <h2 style="font-size: 18pt; color: #333; border-bottom: 1px solid #ccc; padding-bottom: 10px;">Resultado Geral</h2>
                        
                        <div style="margin: 20px 0;">
                            <p style="font-size: 36pt; font-weight: bold; color: #2563eb; margin: 0;">${overallScore}%</p>
                            <p style="font-size: 14pt; margin: 5px 0;">Nível: <strong>${maturity.label}</strong></p>
                        </div>

                         <table style="width: 100%; margin-top: 20px;">
                            <tr>
                                <td style="text-align: center; width: 50%; vertical-align: top;">
                                    ${radarImg ? `<img src="${radarImg}" width="300" />` : ''}
                                </td>
                                <td style="text-align: center; width: 50%; vertical-align: top;">
                                    ${barsImg ? `<img src="${barsImg}" width="300" />` : ''}
                                </td>
                            </tr>
                        </table>
                    </div>

                    <!-- Detailed Breakdown -->
                    <div>
                        <h2 style="font-size: 18pt; color: #333; border-bottom: 1px solid #ccc; padding-bottom: 10px; margin-bottom: 20px;">Detalhamento por Área</h2>
                        
                        ${sectionScores.map(section => `
                            <div style="margin-bottom: 30px; page-break-inside: avoid;">
                                <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; border: 1px solid #e9ecef;">
                                    <h3 style="margin: 0 0 10px 0; font-size: 14pt; color: #000;">
                                        ${section.title}
                                        <span style="float: right; color: ${section.score < 50 ? '#d97706' : '#16a34a'};">${section.score}%</span>
                                    </h3>
                                    
                                    <p style="font-size: 11pt; line-height: 1.5; color: #444; margin: 0;">
                                        <strong>Feedback:</strong><br/>
                                        ${(() => {
                    const levels = section.feedback?.levels || {};
                    if (section.score <= 25) return levels.initial || 'Nível Inicial: Processos ainda não estruturados.';
                    if (section.score <= 50) return levels.basic || 'Nível Básico: Existem controles, mas manuais e pouco integrados.';
                    if (section.score <= 75) return levels.intermediate || 'Nível Intermediário: Processos definidos e parcialmente automatizados.';
                    return levels.advanced || 'Nível Avançado: Gestão otimizada com alta automação e uso de dados.';
                })()}
                                    </p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;

            const htmlContent = `
                <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
                <head>
                    <meta charset='utf-8'>
                    <title>Relatório de Maturidade - ETN</title>
                </head>
                <body>
                    ${htmlBody}
                </body>
                </html>
            `;

            const blob = new Blob(['\ufeff', htmlContent], {
                type: 'application/msword'
            });

            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            const dateStr = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
            link.download = `Relatorio-ETN-${userInfo.empresa || 'Empresa'}-${dateStr}.doc`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

        } catch (error) {
            console.error('Error generating Word:', error);
            alert('Erro ao gerar arquivo Word. Tente novamente.');
        } finally {
            setIsGeneratingWord(false);
        }
    };

    return (
        <div ref={resultsRef} className="flex flex-col gap-10 pb-20 animate-fadeIn bg-white p-8">
            {/* Header with Detailed Info */}
            <div id="report-header" className="flex flex-col gap-6 border-b border-border-color pb-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-center gap-4">
                        <img src={logo} alt="Handit Logo" className="h-12" />
                        <div>
                            <h1 className="text-3xl font-bold text-text-primary">Relatório de Maturidade - ETN</h1>
                            <p className="text-text-secondary text-sm">Gerado em {new Date(historyItem?.date || new Date()).toLocaleDateString('pt-BR')} às {new Date(historyItem?.date || new Date()).toLocaleTimeString('pt-BR')}</p>
                        </div>
                    </div>

                    <div className="flex gap-3 print:hidden" data-html2canvas-ignore>
                        <button
                            onClick={handleDownloadWord}
                            disabled={isGeneratingWord}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border-color hover:bg-bg-tertiary transition-colors disabled:opacity-50"
                        >
                            {isGeneratingWord ? <span className="animate-spin">⌛</span> : <FileText size={18} />}
                            {isGeneratingWord ? 'Gerando...' : 'Baixar Word'}
                        </button>
                        <button
                            onClick={handleDownloadPDF}
                            disabled={isGeneratingPdf}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-text-on-primary font-bold transition-colors disabled:opacity-50"
                        >
                            {isGeneratingPdf ? <span className="animate-spin">⌛</span> : <Download size={18} />}
                            {isGeneratingPdf ? 'Gerando...' : 'Baixar PDF'}
                        </button>
                    </div>
                </div>

                <div className="bg-bg-secondary p-6 rounded-xl border border-border-color">
                    <h3 className="text-lg font-bold mb-4 border-b border-border-color pb-2">Identificação e Características</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-y-4 gap-x-8 text-sm">

                        <div>
                            <span className="block text-text-secondary font-medium">Empresa</span>
                            <span className="font-bold text-lg">{userInfo.empresa}</span>
                        </div>
                        <div>
                            <span className="block text-text-secondary font-medium">Responsável</span>
                            <span className="font-bold">{userInfo.nome}</span>
                        </div>
                        <div>
                            <span className="block text-text-secondary font-medium">Cargo</span>
                            <span className="font-bold">{userInfo.cargo}</span>
                        </div>
                        <div>
                            <span className="block text-text-secondary font-medium">Email</span>
                            <span className="font-bold">{userInfo.email}</span>
                        </div>

                        {/* Added ETN Field explicitly if needed, or emphasized */}
                        {userInfo.etn && (
                            <div className="col-span-2 md:col-span-1 bg-primary/10 p-2 rounded">
                                <span className="block text-primary font-bold">ETN</span>
                                <span className="font-bold">{userInfo.etn}</span>
                            </div>
                        )}

                        <div>
                            <span className="block text-text-secondary font-medium">Ramo de Atividade</span>
                            <span className="font-bold">{userInfo.ramoAtividade}</span>
                        </div>
                        {userInfo.tempoOrcamento && (
                            <div>
                                <span className="block text-text-secondary font-medium">Tempo Orçamento</span>
                                <span className="font-bold">{userInfo.tempoOrcamento}</span>
                            </div>
                        )}
                        {userInfo.faturamento && (
                            <div>
                                <span className="block text-text-secondary font-medium">Faturamento</span>
                                <span className="font-bold">{userInfo.faturamento}</span>
                            </div>
                        )}

                    </div>
                </div>
            </div>

            {/* Main Score Card */}
            <div id="report-summary" className="grid md:grid-cols-2 gap-8">
                <div id="chart-radar" className="bg-bg-secondary p-8 rounded-xl border border-border-color flex flex-col items-center justify-center text-center">
                    <h2 className="text-lg text-text-secondary mb-4">Score Geral</h2>
                    <div className="relative flex items-center justify-center w-48 h-48 mb-6">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle
                                cx="96"
                                cy="96"
                                r="88"
                                stroke="currentColor"
                                strokeWidth="12"
                                fill="transparent"
                                className="text-bg-tertiary"
                            />
                            <circle
                                cx="96"
                                cy="96"
                                r="88"
                                stroke="currentColor"
                                strokeWidth="12"
                                fill="transparent"
                                strokeDasharray={552}
                                strokeDashoffset={552 - (552 * overallScore) / 100}
                                className={`transition-all duration-1000 ease-out ${overallScore < 50 ? 'text-accent-warning' : 'text-primary'
                                    }`} // Simplified color logic
                            />
                        </svg>
                        <div className="absolute flex flex-col items-center">
                            <span className="text-5xl font-bold">{overallScore}%</span>
                        </div>
                    </div>
                    <p className="text-xl">
                        Nível: <span className={`font-bold ${maturity.color}`}>{maturity.label}</span>
                    </p>
                </div>

                <div id="chart-bars" className="bg-bg-secondary p-4 rounded-xl border border-border-color">
                    <ScoreChart data={sectionScores} />
                </div>
            </div>

            {/* Detailed Breakdown */}
            <div id="report-details" className="flex flex-col gap-6">
                <h2 className="text-2xl font-bold">Detalhamento por Área</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sectionScores.map(section => (
                        <div key={section.id} className="bg-bg-secondary p-6 rounded-xl border border-border-color">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-semibold text-lg">{section.title}</h3>
                                <span className={`font-bold ${section.score < 50 ? 'text-accent-warning' : 'text-accent-success'
                                    }`}>
                                    {section.score}%
                                </span>
                            </div>
                            <div className="w-full h-2 bg-bg-tertiary rounded-full overflow-hidden mb-4">
                                <div
                                    className={`h-full ${section.score < 50 ? 'bg-accent-warning' : 'bg-accent-success'
                                        }`}
                                    style={{ width: `${section.score}%` }}
                                />
                            </div>
                            <p className="text-sm text-text-secondary">
                                {(() => {
                                    const levels = section.feedback?.levels || {};
                                    if (section.score <= 25) return levels.initial || 'Nível Inicial: Processos ainda não estruturados.';
                                    if (section.score <= 50) return levels.basic || 'Nível Básico: Existem controles, mas manuais e pouco integrados.';
                                    if (section.score <= 75) return levels.intermediate || 'Nível Intermediário: Processos definidos e parcialmente automatizados.';
                                    return levels.advanced || 'Nível Avançado: Gestão otimizada com alta automação e uso de dados.';
                                })()}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Questions Summary */}
            <div id="report-questions" className="flex flex-col gap-6 mt-6">
                <h2 className="text-2xl font-bold border-t border-border-color pt-8">Resumo das Perguntas e Respostas</h2>

                <div className="grid gap-8">
                    {questionsSource.map((section) => (
                        <div key={section.id} className="bg-white rounded-xl border border-border-color overflow-hidden">
                            <div className="bg-bg-secondary px-6 py-4 border-b border-border-color">
                                <h3 className="font-bold text-lg">{section.title}</h3>
                            </div>
                            <div className="divide-y divide-border-color">
                                {section.questions.map((q, idx) => {
                                    const answerIdx = answers[q.id];
                                    const answerText = q.options[answerIdx];
                                    const points = getPoints(answerIdx);

                                    return (
                                        <div key={q.id} className="p-6 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                                            <div className="flex-1">
                                                <div className="flex gap-3 mb-2">
                                                    <span className="font-bold text-text-secondary w-6 h-6 flex items-center justify-center bg-bg-tertiary rounded-full text-xs flex-shrink-0">{idx + 1}</span>
                                                    <p className="font-medium text-text-primary">{q.text}</p>
                                                </div>
                                                <div className="pl-9">
                                                    <p className="text-sm text-text-secondary">
                                                        Resposta: <span className="font-bold text-primary">{answerText || 'Não respondida'}</span>
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="pl-9 md:pl-0 flex-shrink-0">
                                                <span className={`text-xs font-bold px-2 py-1 rounded ${points < 50 ? 'bg-accent-warning/10 text-accent-warning' : 'bg-accent-success/10 text-accent-success'}`}>
                                                    {points}%
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex justify-center pt-10">
                <button
                    onClick={handleRestart}
                    className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors"
                >
                    <RefreshCcw size={18} />
                    Reiniciar Diagnóstico
                </button>
            </div>

            {/* Restart Confirmation Modal */}
            {showRestartModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fadeIn" onClick={cancelRestart}>
                    <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="flex flex-col items-center text-center mb-6">
                            <div className="w-16 h-16 bg-accent-warning/10 text-accent-warning rounded-full flex items-center justify-center mb-4">
                                <RefreshCcw size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-text-primary mb-2">Reiniciar Diagnóstico?</h3>
                            <p className="text-text-secondary">
                                Tem certeza que deseja iniciar um novo diagnóstico? Todos os dados atuais que não foram salvos serão perdidos.
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={cancelRestart}
                                className="flex-1 py-3 rounded-lg border border-border-color font-bold text-text-secondary hover:bg-bg-tertiary transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmRestart}
                                className="flex-1 py-3 rounded-lg bg-primary hover:bg-primary-hover text-text-on-primary font-bold transition-colors"
                            >
                                Sim, Reiniciar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ETNReport;
