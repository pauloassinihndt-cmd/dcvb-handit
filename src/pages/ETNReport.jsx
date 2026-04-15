import { useNavigate, useLocation } from 'react-router-dom';
import { useDiagnosis } from '../context/DiagnosisContext';
import ScoreChart from '../components/ScoreChart';
import { RefreshCcw, Download, FileText, FileSpreadsheet } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import logo from '../assets/logo.png';

const ETNReport = () => {
    const {
        answers: contextAnswers,
        userInfo: contextUserInfo,
        resetDiagnosis,
        addToHistory,
        questions: contextQuestions,
        currentScoring,
        selectIndustryScope
    } = useDiagnosis();
    const navigate = useNavigate();
    const location = useLocation();

    const historyItemFromLocation = location.state?.historyItem;
    const [historyDetails, setHistoryDetails] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(!!historyItemFromLocation && !historyItemFromLocation.answers);
    const [showRestartModal, setShowRestartModal] = useState(false);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const [isGeneratingWord, setIsGeneratingWord] = useState(false);
    const resultsRef = useRef(null);

    useEffect(() => {
        const fetchDetails = async () => {
            if (historyItemFromLocation && !historyItemFromLocation.answers) {
                try {
                    const res = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/history/${historyItemFromLocation.id}/details`);
                    const details = await res.json();
                    setHistoryDetails(details);
                } catch (error) {
                    console.error('Erro ao buscar detalhes do histórico:', error);
                } finally {
                    setLoadingDetails(false);
                }
            }
        };
        fetchDetails();
    }, [historyItemFromLocation]);

    const isHistoryView = !!historyItemFromLocation;
    const historyItem = historyDetails ? { ...historyItemFromLocation, ...historyDetails } : historyItemFromLocation;
    const answers = isHistoryView ? (historyItem?.answers || {}) : contextAnswers;
    const userInfo = isHistoryView ? (historyItem?.userInfo || historyItem) : contextUserInfo;
    const questionsSource = contextQuestions;

    useEffect(() => {
        if (!isHistoryView && Object.keys(answers).length === 0) {
            navigate('/diagnostico');
        }
    }, [answers, navigate, isHistoryView]);

    useEffect(() => {
        if (isHistoryView && historyItem?.industry_id) {
            selectIndustryScope(historyItem.industry_id);
        }
    }, [isHistoryView, historyItem?.industry_id, selectIndustryScope]);

    const getPoints = (idx) => {
        if (!currentScoring) {
            if (idx === 0) return 0;
            if (idx === 1) return 33;
            if (idx === 2) return 66;
            if (idx === 3) return 100;
            return 0;
        }

        const weights = [
            currentScoring.option_a_weight,
            currentScoring.option_b_weight,
            currentScoring.option_c_weight,
            currentScoring.option_d_weight
        ];
        return weights[idx] ?? 0;
    };

    const isPointsMode = currentScoring?.score_mode === 'points';
    const scoreSuffix = isPointsMode ? ' pts' : '%';
    const shouldRecalculateScores = !historyItem?.sectionScores || (
        isPointsMode &&
        questionsSource.length > 0 &&
        Object.keys(answers).length > 0
    );

    const sectionScores = shouldRecalculateScores ? questionsSource.map(section => {
        const questions = section.questions || [];
        const sectionTotalMax = Math.max(questions.length * 100, 1);

        const sectionPoints = questions.reduce((acc, q) => {
            const answerIdx = answers[q.id];
            return acc + (answerIdx !== undefined ? getPoints(answerIdx) : 0);
        }, 0);

        const percentage = Math.round((sectionPoints / sectionTotalMax) * 100);
        const score = isPointsMode ? sectionPoints : percentage;

        return {
            id: section.id,
            title: section.title,
            score,
            subject: section.title,
            A: percentage,
            fullMark: 100,
            feedback: section.feedback
        };
    }) : historyItem.sectionScores;

    const getSectionPercent = (section) => section?.A ?? section?.score ?? 0;

    const overallScorePercentage = Math.round(
        sectionScores.reduce((acc, s) => acc + getSectionPercent(s), 0) / Math.max(sectionScores.length, 1)
    );

    const overallScore = shouldRecalculateScores
        ? (isPointsMode
            ? sectionScores.reduce((acc, s) => acc + (s.score || 0), 0)
            : overallScorePercentage)
        : (historyItem?.score ?? overallScorePercentage);

    const getMaturityLevel = (scorePercent) => {
        if (scorePercent < 40) return { label: 'Inicial', color: 'text-accent-danger' };
        if (scorePercent < 70) return { label: 'Em Desenvolvimento', color: 'text-accent-warning' };
        if (scorePercent < 90) return { label: 'Avançado', color: 'text-primary' };
        return { label: 'Best-in-Class', color: 'text-accent-success' };
    };

    const maturity = getMaturityLevel(overallScorePercentage);

    const getSectionFeedback = (section) => {
        if (section?.feedback_calculated) return section.feedback_calculated;

        const levels = section?.feedback?.levels || {};
        const sectionPercent = getSectionPercent(section);
        if (sectionPercent <= 25) return levels.initial || 'Nível Inicial: Processos ainda não estruturados.';
        if (sectionPercent <= 50) return levels.basic || 'Nível Básico: Existem controles, mas manuais e pouco integrados.';
        if (sectionPercent <= 75) return levels.intermediate || 'Nível Intermediário: Processos definidos e parcialmente automatizados.';
        return levels.advanced || 'Nível Avançado: Gestão otimizada com alta automação e uso de dados.';
    };

    useEffect(() => {
        if (!isHistoryView && Object.keys(answers).length > 0) {
            addToHistory({
                date: new Date().toISOString(),
                company: userInfo.empresa,
                name: userInfo.nome,
                score: overallScore,
                maturityLabel: maturity.label,
                sectionScores: sectionScores.map(section => ({
                    ...section,
                    feedback_calculated: getSectionFeedback(section)
                })),
                answers,
                userInfo
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const questionRows = isHistoryView && historyItem?.answersSnapshot?.length > 0
        ? historyItem.answersSnapshot.map((snap, idx) => ({
            key: snap.questionId || idx,
            index: idx + 1,
            questionText: snap.questionText,
            answerText: snap.answerText || 'Não registrada',
            points: getPoints(snap.selectedOptionIndex)
        }))
        : questionsSource.flatMap(section =>
            (section.questions || []).map((q, idx) => {
                const answerIdx = answers[q.id];
                return {
                    key: q.id,
                    sectionTitle: section.title,
                    index: idx + 1,
                    questionText: q.text,
                    answerText: q.options?.[answerIdx] || 'Não respondida',
                    points: getPoints(answerIdx)
                };
            })
        );

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

    const handleDownloadPDF = async () => {
        setIsGeneratingPdf(true);
        try {
            const pdf = new jsPDF('p', 'mm', 'a4');
            const root = resultsRef.current;
            const pageMargin = 12;
            const verticalGap = 4;
            const horizontalGap = 4;
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const contentWidth = pageWidth - (pageMargin * 2);
            let currentY = pageMargin;

            const captureOptions = {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff',
                windowWidth: root.scrollWidth,
                onclone: (document) => {
                    const el = document.querySelector('.animate-fadeIn');
                    if (el) {
                        el.classList.remove('animate-fadeIn');
                        el.style.opacity = '1';
                        el.style.transform = 'none';
                        el.style.animation = 'none';
                    }

                    document.querySelectorAll('[data-pdf-detail-card]').forEach((card) => {
                        card.style.padding = '14px';
                        card.style.borderRadius = '12px';
                    });

                    document.querySelectorAll('[data-pdf-detail-card] h3').forEach((title) => {
                        title.style.fontSize = '16px';
                        title.style.lineHeight = '1.2';
                        title.style.margin = '0';
                    });

                    document.querySelectorAll('[data-pdf-detail-card] span').forEach((score) => {
                        score.style.fontSize = '14px';
                    });

                    document.querySelectorAll('[data-pdf-detail-card] .pdf-detail-bar').forEach((bar) => {
                        bar.style.height = '6px';
                        bar.style.marginBottom = '10px';
                    });

                    document.querySelectorAll('[data-pdf-detail-card] .pdf-detail-feedback').forEach((feedback) => {
                        feedback.style.fontSize = '12px';
                        feedback.style.lineHeight = '1.35';
                        feedback.style.margin = '0';
                    });

                    document.querySelectorAll('[data-pdf-block="details-title"], [data-pdf-block="questions-title"]').forEach((title) => {
                        title.style.paddingTop = '8px';
                        title.style.paddingBottom = '6px';
                        title.style.lineHeight = '1.25';
                        title.style.margin = '0';
                    });
                }
            };

            const addPageIfNeeded = (heightMm, forceNewPage = false) => {
                const usableHeight = pageHeight - pageMargin;
                if (forceNewPage || (currentY + heightMm > usableHeight && currentY > pageMargin)) {
                    pdf.addPage();
                    currentY = pageMargin;
                }
            };

            const renderElementToPdf = async (element, options = {}) => {
                if (!element) return;

                const canvas = await html2canvas(element, captureOptions);
                const imgData = canvas.toDataURL('image/png');
                const renderWidth = options.width || contentWidth;
                const renderHeight = (canvas.height * renderWidth) / canvas.width;

                addPageIfNeeded(renderHeight, options.forceNewPage);
                pdf.addImage(imgData, 'PNG', options.x || pageMargin, currentY, renderWidth, renderHeight);
                currentY += renderHeight + verticalGap;
            };

            await renderElementToPdf(document.querySelector('[data-pdf-block="header"]'));
            await renderElementToPdf(document.querySelector('[data-pdf-block="summary"]'));
            await renderElementToPdf(document.querySelector('[data-pdf-block="details-title"]'));

            const detailCards = Array.from(document.querySelectorAll('[data-pdf-detail-card]'));
            const detailCardWidth = (contentWidth - horizontalGap) / 2;
            for (let index = 0; index < detailCards.length; index += 2) {
                const rowCards = detailCards.slice(index, index + 2);
                const renderedRow = [];

                for (let colIndex = 0; colIndex < rowCards.length; colIndex += 1) {
                    const card = rowCards[colIndex];
                    const canvas = await html2canvas(card, captureOptions);
                    const imgData = canvas.toDataURL('image/png');
                    const renderHeight = (canvas.height * detailCardWidth) / canvas.width;
                    renderedRow.push({
                        imgData,
                        renderHeight,
                        x: pageMargin + (colIndex * (detailCardWidth + horizontalGap))
                    });
                }

                const rowHeight = Math.max(...renderedRow.map(item => item.renderHeight));
                addPageIfNeeded(rowHeight);

                renderedRow.forEach((item) => {
                    pdf.addImage(item.imgData, 'PNG', item.x, currentY, detailCardWidth, item.renderHeight);
                });

                currentY += rowHeight + verticalGap;
            }

            await renderElementToPdf(document.querySelector('[data-pdf-block="questions-title"]'), { forceNewPage: currentY > pageHeight * 0.55 });
            await renderElementToPdf(document.querySelector('[data-pdf-block="questions-header"]'));

            const questionRowsElements = Array.from(document.querySelectorAll('[data-pdf-question-row]'));
            for (const row of questionRowsElements) {
                await renderElementToPdf(row);
            }

            const dateStr = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
            pdf.save(`Relatorio-ETN-${userInfo.empresa || 'Empresa'}-${dateStr}.pdf`);
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Erro ao gerar PDF. Tente novamente.');
        } finally {
            setIsGeneratingPdf(false);
        }
    };

    const handleDownloadWord = async () => {
        setIsGeneratingWord(true);
        try {
            const radarElement = document.getElementById('chart-radar');
            const barsElement = document.getElementById('chart-bars');
            let radarImg = '';
            let barsImg = '';

            if (radarElement) {
                const canvas = await html2canvas(radarElement, { scale: 2, backgroundColor: '#ffffff' });
                radarImg = canvas.toDataURL('image/png');
            }

            if (barsElement) {
                const canvas = await html2canvas(barsElement, { scale: 2, backgroundColor: '#ffffff' });
                barsImg = canvas.toDataURL('image/png');
            }

            const htmlBody = `
                <div style="font-family: Arial, sans-serif; color: #333;">
                    <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #eee; padding-bottom: 20px;">
                        <h1 style="font-size: 24pt; color: #000; margin: 0;">Relatório de Maturidade - ETN</h1>
                        <p style="font-size: 12pt; color: #666; margin-top: 10px;">
                            Diagnosticado para <strong>${userInfo.empresa}</strong><br/>
                            ${userInfo.nome} • ${new Date(historyItem?.date || new Date()).toLocaleDateString('pt-BR')}
                        </p>
                    </div>

                    <div style="margin-bottom: 40px; text-align: center;">
                        <h2 style="font-size: 18pt; color: #333; border-bottom: 1px solid #ccc; padding-bottom: 10px;">Resultado Geral</h2>
                        <div style="margin: 20px 0;">
                            <p style="font-size: 36pt; font-weight: bold; color: #2563eb; margin: 0;">${overallScore}${scoreSuffix}</p>
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

                    <div>
                        <h2 style="font-size: 18pt; color: #333; border-bottom: 1px solid #ccc; padding-bottom: 10px; margin-bottom: 20px;">Detalhamento por Área</h2>
                        ${sectionScores.map(section => `
                            <div style="margin-bottom: 24px; page-break-inside: avoid;">
                                <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; border: 1px solid #e9ecef;">
                                    <h3 style="margin: 0 0 10px 0; font-size: 14pt; color: #000;">
                                        ${section.title}
                                        <span style="float: right; color: ${getSectionPercent(section) < 50 ? '#d97706' : '#16a34a'};">${section.score}${scoreSuffix}</span>
                                    </h3>
                                    <p style="font-size: 11pt; line-height: 1.5; color: #444; margin: 0;">
                                        <strong>Feedback:</strong><br/>
                                        ${getSectionFeedback(section)}
                                    </p>
                                </div>
                            </div>
                        `).join('')}
                    </div>

                    <div style="margin-top: 40px;">
                        <h2 style="font-size: 18pt; color: #333; border-bottom: 1px solid #ccc; padding-bottom: 10px; margin-bottom: 20px;">Resumo das Perguntas e Respostas</h2>
                        ${questionRows.map(row => `
                            <div style="padding: 10px 0; border-bottom: 1px solid #eee; page-break-inside: avoid;">
                                ${row.sectionTitle ? `<p style="margin: 0 0 4px 0; color: #666; font-size: 10pt;"><strong>${row.sectionTitle}</strong></p>` : ''}
                                <p style="margin: 0 0 6px 0; font-size: 11pt;"><strong>${row.index}. ${row.questionText || 'Pergunta registrada'}</strong></p>
                                <p style="margin: 0; font-size: 10.5pt; color: #444;">Resposta: <strong>${row.answerText}</strong> | Score: <strong>${row.points}${scoreSuffix}</strong></p>
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
                <body>${htmlBody}</body>
                </html>
            `;

            const blob = new Blob(['\ufeff', htmlContent], { type: 'application/msword' });
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

    const handleDownloadCSV = () => {
        try {
            const scoreLabel = scoreSuffix.trim();
            const headers = [
                'Empresa',
                'Responsavel',
                'Email',
                'Cargo',
                'ETN',
                'Vendedor',
                'Ramo de Atividade',
                'Tempo Orcamento',
                'Faturamento',
                'Faixa Colaboradores',
                'ERP',
                `Pontuacao Geral (${scoreLabel})`
            ];

            sectionScores.forEach(section => {
                headers.push(`${section.title} (${scoreLabel})`);
            });

            const rowData = [
                `"${userInfo.empresa || ''}"`,
                `"${userInfo.nome || ''}"`,
                `"${userInfo.email || ''}"`,
                `"${userInfo.cargo || ''}"`,
                `"${userInfo.etn || ''}"`,
                `"${userInfo.vendedor || ''}"`,
                `"${userInfo.ramoAtividade || ''}"`,
                `"${userInfo.tempoOrcamento || ''}"`,
                `"${userInfo.faturamento || ''}"`,
                `"${userInfo.faixaColaboradores || ''}"`,
                `"${userInfo.erp || ''}"`,
                overallScore
            ];

            sectionScores.forEach(section => {
                rowData.push(section.score);
            });

            const csvContent = [headers.join(';'), rowData.join(';')].join('\n');
            const blob = new Blob(['\ufeff', csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            const dateStr = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
            link.download = `Dados-ETN-${userInfo.empresa || 'Empresa'}-${dateStr}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error generating CSV:', error);
            alert('Erro ao gerar arquivo CSV.');
        }
    };

    if (loadingDetails) {
        return (
            <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                <div className="w-16 h-16 bg-bg-tertiary rounded-full mb-4"></div>
                <h2 className="text-xl font-bold text-text-secondary">Carregando detalhes do diagnóstico...</h2>
            </div>
        );
    }

    return (
        <div ref={resultsRef} id="report-pdf-root" className="flex flex-col gap-10 pb-20 animate-fadeIn bg-white p-8">
            <div id="report-header" data-pdf-block="header" className="flex flex-col gap-6 border-b border-border-color pb-8" style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-center gap-4">
                        <img src={logo} alt="Handit Logo" className="h-12" />
                        <div>
                            <h1 className="text-3xl font-bold text-text-primary">Relatório de Maturidade - ETN</h1>
                            <p className="text-text-secondary text-sm">Gerado em {new Date(historyItem?.date || new Date()).toLocaleDateString('pt-BR')} às {new Date(historyItem?.date || new Date()).toLocaleTimeString('pt-BR')}</p>
                        </div>
                    </div>

                    <div className="flex gap-3 print:hidden" data-html2canvas-ignore>
                        <button onClick={handleDownloadCSV} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border-color hover:bg-bg-tertiary transition-colors">
                            <FileSpreadsheet size={18} />
                            Baixar CSV (Importar)
                        </button>
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

            <div id="report-summary" data-pdf-block="summary" className="grid md:grid-cols-2 gap-8" style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                <div id="chart-radar" className="bg-bg-secondary p-8 rounded-xl border border-border-color flex flex-col items-center justify-center text-center">
                    <h2 className="text-lg text-text-secondary mb-4">Score Geral</h2>
                    <div className="relative flex items-center justify-center w-48 h-48 mb-6">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-bg-tertiary" />
                            <circle
                                cx="96"
                                cy="96"
                                r="88"
                                stroke="currentColor"
                                strokeWidth="12"
                                fill="transparent"
                                strokeDasharray={552}
                                strokeDashoffset={552 - (552 * overallScorePercentage) / 100}
                                className={`transition-all duration-1000 ease-out ${overallScorePercentage < 50 ? 'text-accent-warning' : 'text-primary'}`}
                            />
                        </svg>
                        <div className="absolute flex flex-col items-center">
                            <span className="text-5xl font-bold">{overallScore}{scoreSuffix}</span>
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

            <div id="report-details" className="flex flex-col gap-6">
                <h2 data-pdf-block="details-title" className="text-2xl font-bold">Detalhamento por Área</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sectionScores.map(section => (
                        <div key={section.id} data-pdf-detail-card className="bg-bg-secondary p-6 rounded-xl border border-border-color" style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-semibold text-lg">{section.title}</h3>
                                <span className={`font-bold ${getSectionPercent(section) < 50 ? 'text-accent-warning' : 'text-accent-success'}`}>
                                    {section.score}{scoreSuffix}
                                </span>
                            </div>
                            <div className="pdf-detail-bar w-full h-2 bg-bg-tertiary rounded-full overflow-hidden mb-4">
                                <div
                                    className={`h-full ${getSectionPercent(section) < 50 ? 'bg-accent-warning' : 'bg-accent-success'}`}
                                    style={{ width: `${getSectionPercent(section)}%` }}
                                />
                            </div>
                            <p className="pdf-detail-feedback text-sm text-text-secondary">{getSectionFeedback(section)}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div id="report-questions" className="flex flex-col gap-6 mt-6">
                <h2 data-pdf-block="questions-title" className="text-2xl font-bold border-t border-border-color pt-8">Resumo das Perguntas e Respostas</h2>
                <div className="bg-white rounded-xl border border-border-color overflow-hidden">
                    <div data-pdf-block="questions-header" className="bg-bg-secondary px-6 py-4 border-b border-border-color">
                        <h3 className="font-bold text-lg">
                            {isHistoryView && historyItem?.answersSnapshot?.length > 0
                                ? 'Respostas registradas no momento do diagnóstico'
                                : 'Respostas do diagnóstico atual'}
                        </h3>
                    </div>
                    <div className="divide-y divide-border-color">
                        {questionRows.map((row) => (
                            <div key={row.key} data-pdf-question-row className="p-6 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center" style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                                <div className="flex-1">
                                    {row.sectionTitle && (
                                        <p className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-2">{row.sectionTitle}</p>
                                    )}
                                    <div className="flex gap-3 mb-2">
                                        <span className="font-bold text-text-secondary w-6 h-6 flex items-center justify-center bg-bg-tertiary rounded-full text-xs flex-shrink-0">{row.index}</span>
                                        <p className="font-medium text-text-primary">{row.questionText || 'Pergunta registrada'}</p>
                                    </div>
                                    <div className="pl-9">
                                        <p className="text-sm text-text-secondary">
                                            Resposta: <span className="font-bold text-primary">{row.answerText}</span>
                                        </p>
                                    </div>
                                </div>
                                <div className="pl-9 md:pl-0 flex-shrink-0">
                                    <span className={`text-xs font-bold px-2 py-1 rounded ${row.points < 50 ? 'bg-accent-warning/10 text-accent-warning' : 'bg-accent-success/10 text-accent-success'}`}>
                                        {row.points}{scoreSuffix}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex justify-center pt-10">
                <button onClick={handleRestart} className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors">
                    <RefreshCcw size={18} />
                    Reiniciar Diagnóstico
                </button>
            </div>

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
                            <button onClick={cancelRestart} className="flex-1 py-3 rounded-lg border border-border-color font-bold text-text-secondary hover:bg-bg-tertiary transition-colors">
                                Cancelar
                            </button>
                            <button onClick={confirmRestart} className="flex-1 py-3 rounded-lg bg-primary hover:bg-primary-hover text-text-on-primary font-bold transition-colors">
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
