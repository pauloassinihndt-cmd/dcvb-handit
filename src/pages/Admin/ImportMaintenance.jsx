import { useState } from 'react';
import { Upload, FileDown, AlertCircle, CheckCircle, FileSpreadsheet, MessageSquare, HelpCircle, AlertTriangle } from 'lucide-react';
import { useDiagnosis } from '../../context/DiagnosisContext';

const ImportMaintenance = () => {
    const { updateQuestions, industries, importQuestionsBatch, importFeedbacksBatch } = useDiagnosis();
    // State for Questions Import
    const [isDraggingQuestions, setIsDraggingQuestions] = useState(false);
    const [fileQuestions, setFileQuestions] = useState(null);
    const [messageQuestions, setMessageQuestions] = useState(null);
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, existingIndustries: [], importData: null });

    // State for Feedbacks Import
    const [isDraggingFeedbacks, setIsDraggingFeedbacks] = useState(false);
    const [fileFeedbacks, setFileFeedbacks] = useState(null);
    const [messageFeedbacks, setMessageFeedbacks] = useState(null);

    // State for Preview Modal
    const [previewModal, setPreviewModal] = useState({ isOpen: false, data: [], file: null, type: null, totalRows: 0 });

    // --- Helper Functions ---
    const validateFile = (file) => {
        const validTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel',
            'text/csv'
        ];
        return validTypes.includes(file.type) || file.name.endsWith('.xlsx') || file.name.endsWith('.csv');
    };

    const parseCSV = (textInput) => {
        // 1. Remove BOM (Byte Order Mark) if present - CRITICAL for Excel UTF-8
        const text = textInput.replace(/^\uFEFF/, '');

        // Remove CR chars if present to safe split
        const lines = text.split(/\r\n|\n|\r/).filter(line => line.trim());
        if (lines.length === 0) return [];

        // 2. Detect Delimiter
        const firstLine = lines[0];
        const commaCount = (firstLine.match(/,/g) || []).length;
        const semiCount = (firstLine.match(/;/g) || []).length;
        const delimiter = semiCount >= commaCount ? ';' : ',';

        // 3. Parse Headers
        const normalizeHeader = (h) => h.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().replace(/^"|"$/g, '');

        const rawHeaders = firstLine.split(delimiter);
        const headers = rawHeaders.map(normalizeHeader);

        const result = [];

        for (let i = 1; i < lines.length; i++) {
            const line = lines[i];
            if (!line.trim()) continue;

            let values;
            if (delimiter === ';') {
                values = line.split(';');
            } else {
                // Regex for comma split handling quotes
                values = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
                if (!values) values = line.split(',');
            }

            const cleanValues = (values || []).map(v =>
                v ? v.trim().replace(/^"|"$/g, '').replace(/""/g, '"') : ''
            );

            const row = {};
            headers.forEach((header, index) => {
                row[header] = cleanValues[index] || '';
            });
            result.push(row);
        }
        return result;
    };

    // --- Questions Logic ---
    const handleDragOverQuestions = (e) => { e.preventDefault(); setIsDraggingQuestions(true); };
    const handleDragLeaveQuestions = () => setIsDraggingQuestions(false);
    const handleDropQuestions = (e) => {
        e.preventDefault();
        setIsDraggingQuestions(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) processFile(droppedFile, 'questions');
    };
    const handleFileSelectQuestions = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) processFile(selectedFile, 'questions');
    };
    const handleDownloadTemplateQuestions = () => {
        const csvContent = "data:text/csv;charset=utf-8,Ramo de Atividade,Area,Pergunta,Opcao A,Opcao B,Opcao C,Opcao D\nExemplo Ramo,Exemplo Area,Exemplo Pergunta,Texto A,Texto B,Texto C,Texto D";
        downloadCsv(csvContent, "modelo_perguntas.csv");
    };

    const handleImportQuestions = async () => {
        if (!fileQuestions) return;
        setMessageQuestions({ type: 'info', text: 'Lendo arquivo de Perguntas...' });

        try {
            const text = await fileQuestions.text();
            const data = parseCSV(text);

            if (data.length === 0) {
                setMessageQuestions({ type: 'error', text: 'Arquivo vazio ou formato inválido.' });
                return;
            }

            // Identify Industries
            const importIndustryNames = new Set();
            data.forEach(row => {
                const keys = Object.keys(row);
                const industryKey = keys.find(k => k.includes('ramo') || k.includes('atividade'));
                const ramo = industryKey ? row[industryKey] : null;
                if (ramo) importIndustryNames.add(ramo);
            });

            if (importIndustryNames.size === 0) {
            }

            // Check for existing industries
            const existingConflicts = [];
            importIndustryNames.forEach(name => {
                if (industries.some(ind => ind.name.toLowerCase() === name.toLowerCase())) {
                    existingConflicts.push(name);
                }
            });

            if (existingConflicts.length > 0) {
                setConfirmModal({
                    isOpen: true,
                    existingIndustries: existingConflicts,
                    importData: data
                });
                return;
            }

            // No conflicts, proceed import
            executeImportQuestions(data);

        } catch (error) {
            console.error(error);
            setMessageQuestions({ type: 'error', text: 'Erro ao processar arquivo. Verifique o formato CSV.' });
        }
    };

    const executeImportQuestions = (data) => {
        try {
            const industryMap = new Map(); // Name -> { id, questionsMap }
            const newIndustriesToAdd = [];

            data.forEach(row => {
                const keys = Object.keys(row);
                // Robust key finding
                const industryKey = keys.find(k => k.includes('ramo') || k.includes('atividade')) || 'ramo de atividade';
                const areaKey = keys.find(k => k === 'area') || 'area';
                const questionKey = keys.find(k => k.includes('pergunta') || k.includes('questao')) || 'pergunta';

                const ramoName = row[industryKey] || 'Geral';
                const area = row[areaKey];
                const questionText = row[questionKey];

                if (!area || !questionText) return;

                // Resolve Industry ID and Map
                let industryId;
                let industryData = industryMap.get(ramoName);

                if (!industryData) {
                    // Check if exists in DB
                    const existingInd = industries.find(i => i.name.toLowerCase() === ramoName.toLowerCase());
                    if (existingInd) {
                        industryId = existingInd.id;
                    } else {
                        // Create New
                        industryId = crypto.randomUUID();
                        newIndustriesToAdd.push({
                            id: industryId,
                            name: ramoName,
                            active: true,
                            createdAt: new Date().toISOString()
                        });
                    }

                    industryData = {
                        id: industryId,
                        sectionsMap: new Map() // Area Name -> Section Obj
                    };
                    industryMap.set(ramoName, industryData);
                }

                // Process Question into Section
                if (!industryData.sectionsMap.has(area)) {
                    industryData.sectionsMap.set(area, {
                        id: crypto.randomUUID(),
                        title: area,
                        questions: []
                    });
                }

                const options = [
                    row['Opcao A'] || row['Opção A'] || 'Opção A',
                    row['Opcao B'] || row['Opção B'] || 'Opção B',
                    row['Opcao C'] || row['Opção C'] || 'Opção C',
                    row['Opcao D'] || row['Opção D'] || 'Opção D'
                ];

                industryData.sectionsMap.get(area).questions.push({
                    id: crypto.randomUUID(),
                    text: questionText,
                    options: options,
                    disabled: false
                });
            });

            // Prepare Batch Update
            const updates = {}; // industryId -> [sections]
            industryMap.forEach((indData) => {
                updates[indData.id] = Array.from(indData.sectionsMap.values());
            });

            importQuestionsBatch(updates, newIndustriesToAdd);

            setMessageQuestions({ type: 'success', text: `Importação concluída! ${Object.keys(updates).length} ramos processados.` });
            setConfirmModal({ isOpen: false, existingIndustries: [], importData: null });

        } catch (error) {
            console.error(error);
            setMessageQuestions({ type: 'error', text: 'Erro ao executar a importação.' });
        }
    };

    // --- Feedbacks Logic ---
    const handleDragOverFeedbacks = (e) => { e.preventDefault(); setIsDraggingFeedbacks(true); };
    const handleDragLeaveFeedbacks = () => setIsDraggingFeedbacks(false);
    const handleDropFeedbacks = (e) => {
        e.preventDefault();
        setIsDraggingFeedbacks(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) processFile(droppedFile, setFileFeedbacks, setMessageFeedbacks);
    };
    const handleFileSelectFeedbacks = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) processFile(selectedFile, setFileFeedbacks, setMessageFeedbacks);
    };
    const handleDownloadTemplateFeedbacks = () => {
        const csvContent = "data:text/csv;charset=utf-8,Ramo de Atividade,Area,Nivel 1,Nivel 2,Nivel 3,Nivel 4\nExemplo Ramo,Exemplo Area,Texto Nivel 1,Texto Nivel 2,Texto Nivel 3,Texto Nivel 4";
        downloadCsv(csvContent, "modelo_feedbacks.csv");
    };
    const handleImportFeedbacks = async () => {
        if (!fileFeedbacks) return;
        setMessageFeedbacks({ type: 'info', text: 'Lendo arquivo de Feedbacks...' });

        try {
            const text = await fileFeedbacks.text();

            // Debug parsing
            const data = parseCSV(text);

            if (data.length === 0) {
                setMessageFeedbacks({ type: 'error', text: 'Arquivo vazio ou formato inválido.' });
                return;
            }

            // Map keys based on Normalized Headers (from parseCSV)
            // Expected keys: 'ramo de atividade', 'area', 'nivel 1', etc.
            const feedbackDataList = data.map(row => {
                const keys = Object.keys(row);
                // Robust key finding
                const industryKey = keys.find(k => k.includes('ramo') || k.includes('atividade')) || 'ramo de atividade';
                const areaKey = keys.find(k => k === 'area') || 'area';

                const n1Key = keys.find(k => k.includes('nivel 1') || k === 'inicial') || 'nivel 1';
                const n2Key = keys.find(k => k.includes('nivel 2') || k.includes('basico')) || 'nivel 2';
                const n3Key = keys.find(k => k.includes('nivel 3') || k.includes('intermediario')) || 'nivel 3';
                const n4Key = keys.find(k => k.includes('nivel 4') || k.includes('avancado')) || 'nivel 4';

                return {
                    industryName: row[industryKey] || '',
                    areaName: row[areaKey] || '',
                    feedbacks: {
                        initial: row[n1Key] || '',
                        basic: row[n2Key] || '',
                        intermediate: row[n3Key] || '',
                        advanced: row[n4Key] || ''
                    }
                };
            }).filter(item => item.industryName && item.areaName);

            const result = importFeedbacksBatch(feedbackDataList);

            // Handle new return format { updatedCount, notFoundIndustries }
            const count = typeof result === 'object' ? result.updatedCount : result;
            const errors = typeof result === 'object' ? result.notFoundIndustries || [] : [];

            if (count > 0) {
                let msg = `Sucesso! ${count} áreas atualizadas.`;
                if (errors.length > 0) {
                    msg += ` Mas atenção: ${errors.length} Ramos não foram encontrados.`;
                    console.warn('Import Errors (Not Found):', errors);
                }
                setMessageFeedbacks({ type: 'success', text: msg });
                setFileFeedbacks(null);
            } else {
                if (errors.length > 0) {
                    setMessageFeedbacks({
                        type: 'warning',
                        text: `Nenhuma atualização. ${errors.length} Ramos não encontrados (ex: ${errors[0]}). Verifique os nomes.`
                    });
                } else {
                    setMessageFeedbacks({ type: 'warning', text: 'Nenhum dado correspondente encontrado.' });
                }
            }

        } catch (error) {
            console.error('Error importing feedbacks:', error);
            setMessageFeedbacks({ type: 'error', text: 'Erro crítico ao processar importação.' });
        }
    };

    // --- Shared Logic ---
    // --- Shared Logic & Validation ---
    const normalizeString = (str) => {
        if (!str) return '';
        return str.toString()
            .replace(/^\uFEFF/, '')
            .replace(/\u00A0/g, ' ')
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/\s+/g, ' ')
            .trim();
    };

    const processFile = async (file, type) => {
        if (validateFile(file)) {
            try {
                const text = await file.text();
                const rawData = parseCSV(text);

                let processedData = [];
                let stats = { total: rawData.length, valid: 0, invalid: 0 };

                if (type === 'feedbacks') {
                    // Create lookup map for fast validation
                    const industryMap = new Map();
                    industries.forEach(ind => {
                        const normName = normalizeString(ind.name);
                        // Map normalized name to { id, originalName, sections: Set(normTitles) }
                        industryMap.set(normName, {
                            id: ind.id,
                            name: ind.name,
                            sections: new Set(ind.sections?.map(s => normalizeString(s.title)) || [])
                        });
                    });

                    processedData = rawData.map((row, index) => {
                        const keys = Object.keys(row);
                        const industryKey = keys.find(k => k.includes('ramo') || k.includes('atividade')) || 'ramo de atividade';
                        const areaKey = keys.find(k => k === 'area') || 'area';

                        const rawIndustry = row[industryKey] || '';
                        const rawArea = row[areaKey] || '';

                        const normIndustry = normalizeString(rawIndustry);
                        const normArea = normalizeString(rawArea);

                        let status = 'success';
                        let message = 'Válido';

                        const matchedInd = industryMap.get(normIndustry);

                        if (!matchedInd) {
                            status = 'error';
                            message = 'Ramo não encontrado';
                        } else if (!matchedInd.sections.has(normArea)) {
                            status = 'warning';
                            message = 'Área não encontrada (Feedback será ignorado)';
                            // Actually, if area doesn't exist, we can't attach feedback. So it IS an error for that row context.
                            status = 'error';
                        }

                        if (status === 'success') stats.valid++;
                        else stats.invalid++;

                        return {
                            originalRow: row,
                            display: {
                                Ramo: rawIndustry,
                                Area: rawArea,
                                Status: message,
                                _statusType: status
                            }
                        };
                    });
                } else {
                    // Default logic for Questions (just show raw data for now, detailed validation is complex there)
                    processedData = rawData.map(row => ({
                        originalRow: row,
                        display: row
                    }));
                    stats.valid = rawData.length;
                }

                setPreviewModal({
                    isOpen: true,
                    data: processedData,
                    file: file,
                    type: type,
                    stats: stats
                });

            } catch (error) {
                console.error("Error reading file:", error);
                const msg = { type: 'error', text: 'Erro ao analisar arquivo. Verifique se é um CSV válido.' };
                if (type === 'questions') setMessageQuestions(msg);
                else setMessageFeedbacks(msg);
            }
        } else {
            const msg = { type: 'error', text: 'Formato inválido. Use .xlsx ou .csv.' };
            if (type === 'questions') setMessageQuestions(msg);
            else setMessageFeedbacks(msg);
        }
    };

    const handleConfirmPreview = () => {
        const { file, type } = previewModal;
        if (type === 'questions') {
            setFileQuestions(file);
            setMessageQuestions(null);
        } else {
            setFileFeedbacks(file);
            setMessageFeedbacks(null);
        }
        setPreviewModal({ isOpen: false, data: [], file: null, type: null, totalRows: 0 });
    };

    const handleCancelPreview = () => {
        setPreviewModal({ isOpen: false, data: [], file: null, type: null, totalRows: 0 });
        // Clear inputs if needed, though they are hidden file inputs
        if (previewModal.type === 'questions') {
            const input = document.getElementById('fileInputQuestions');
            if (input) input.value = '';
        } else {
            const input = document.getElementById('fileInputFeedbacks');
            if (input) input.value = '';
        }
    };

    const downloadCsv = (content, filename) => {
        const encodedUri = encodeURI(content);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // --- Render Components ---
    const ImportSection = ({
        title,
        icon: Icon,
        description,
        isDragging,
        file,
        message,
        onDownload,
        onDragOver,
        onDragLeave,
        onDrop,
        onFileSelect,
        onImport,
        onRemoveFile,
        inputId,
        templateName
    }) => (
        <div className="bg-white p-6 rounded-xl border border-border-color shadow-sm">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border-color">
                <div className="p-2 bg-primary/10 text-primary rounded-lg">
                    <Icon size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-bold">{title}</h2>
                    <p className="text-sm text-text-secondary">{description}</p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Template Download */}
                <div className="flex flex-col justify-center items-start gap-3 bg-bg-secondary/50 p-4 rounded-lg border border-border-color border-dashed">
                    <h3 className="font-bold text-sm flex items-center gap-2">
                        <FileSpreadsheet size={16} className="text-text-secondary" />
                        Modelo de Dados
                    </h3>
                    <p className="text-xs text-text-secondary">
                        Baixe o modelo para preencher corretamente os dados de {templateName}.
                    </p>
                    <button
                        onClick={onDownload}
                        className="text-sm font-bold text-primary hover:underline flex items-center gap-1"
                    >
                        <FileDown size={16} />
                        Baixar Modelo (.csv)
                    </button>
                </div>

                {/* File Upload Area */}
                <div>
                    <div
                        className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center transition-all cursor-pointer h-full min-h-[160px] ${isDragging ? 'border-primary bg-primary/5' : 'border-border-color hover:border-primary hover:bg-bg-tertiary'
                            }`}
                        onDragOver={onDragOver}
                        onDragLeave={onDragLeave}
                        onDrop={onDrop}
                        onClick={() => document.getElementById(inputId).click()}
                    >
                        <input
                            id={inputId}
                            type="file"
                            className="hidden"
                            accept=".csv,.xlsx,.xls"
                            onChange={onFileSelect}
                        />

                        {file ? (
                            <div className="flex flex-col items-center animate-fadeIn">
                                <FileSpreadsheet size={32} className="text-accent-success mb-2" />
                                <p className="font-bold text-sm text-text-primary truncate max-w-[200px]">{file.name}</p>
                                <p className="text-xs text-text-secondary mb-3">{(file.size / 1024).toFixed(2)} KB</p>
                                <button
                                    onClick={(e) => { e.stopPropagation(); onRemoveFile(); }}
                                    className="text-xs text-accent-danger hover:underline font-bold"
                                >
                                    Remover
                                </button>
                            </div>
                        ) : (
                            <>
                                <Upload size={32} className="text-text-secondary mb-2" />
                                <p className="font-bold text-sm text-text-primary">Carregar Arquivo</p>
                                <p className="text-xs text-text-secondary">.xlsx ou .csv</p>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Action Button & Message */}
            <div className="mt-6 flex flex-col gap-4">
                <button
                    onClick={onImport}
                    disabled={!file}
                    className={`w-full py-3 rounded-lg font-bold transition-all ${file ? 'bg-primary hover:bg-primary-hover text-text-on-primary shadow-md' : 'bg-bg-tertiary text-text-secondary cursor-not-allowed'
                        }`}
                >
                    Iniciar Importação de {title.split(' ').pop()}
                </button>

                {message && (
                    <div className={`p-3 rounded-lg flex items-center gap-2 text-sm animate-fadeIn ${message.type === 'success' ? 'bg-accent-success/10 text-accent-success' :
                        message.type === 'error' ? 'bg-accent-danger/10 text-accent-danger' : 'bg-accent-info/10 text-accent-info'
                        }`}>
                        {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                        <span className="font-medium">{message.text}</span>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="animate-fadeIn pb-20 relative">
            {/* Main Header */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 sticky top-0 bg-bg-secondary py-4 z-10 backdrop-blur-sm gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Importação</h1>
                    <p className="text-text-secondary">Central de carregamento de dados em massa.</p>
                </div>
            </div>

            <div className="flex flex-col gap-8 max-w-4xl mx-auto">
                {/* Questions Import Section */}
                <ImportSection
                    title="Importação de Perguntas"
                    icon={HelpCircle}
                    description="Atualize o banco de perguntas e opções."
                    templateName="perguntas"
                    isDragging={isDraggingQuestions}
                    file={fileQuestions}
                    message={messageQuestions}
                    onDownload={handleDownloadTemplateQuestions}
                    onDragOver={handleDragOverQuestions}
                    onDragLeave={handleDragLeaveQuestions}
                    onDrop={handleDropQuestions}
                    onFileSelect={handleFileSelectQuestions}
                    onImport={handleImportQuestions}
                    onRemoveFile={() => { setFileQuestions(null); setMessageQuestions(null); }}
                    inputId="fileInputQuestions"
                />

                {/* Feedbacks Import Section */}
                <ImportSection
                    title="Importação de Feedbacks"
                    icon={MessageSquare}
                    description="Atualize os textos de feedback por área e nível de maturidade."
                    templateName="feedbacks"
                    isDragging={isDraggingFeedbacks}
                    file={fileFeedbacks}
                    message={messageFeedbacks}
                    onDownload={handleDownloadTemplateFeedbacks}
                    onDragOver={handleDragOverFeedbacks}
                    onDragLeave={handleDragLeaveFeedbacks}
                    onDrop={handleDropFeedbacks}
                    onFileSelect={handleFileSelectFeedbacks}
                    onImport={handleImportFeedbacks}
                    onRemoveFile={() => { setFileFeedbacks(null); setMessageFeedbacks(null); }}
                    inputId="fileInputFeedbacks"
                />
            </div>

            {/* Preview Modal */}
            {/* Preview Modal */}
            {previewModal.isOpen && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fadeIn backdrop-blur-sm" onClick={handleCancelPreview}>
                    <div className="bg-white rounded-xl max-w-5xl w-full p-0 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ring-1 ring-border-color" onClick={e => e.stopPropagation()}>

                        {/* Header */}
                        <div className="p-6 border-b border-border-color flex justify-between items-start bg-bg-secondary/30">
                            <div>
                                <h3 className="text-2xl font-bold text-text-primary flex items-center gap-2">
                                    <FileSpreadsheet className="text-primary" />
                                    Prévia da Importação
                                </h3>
                                <p className="text-text-secondary mt-1">
                                    Revise os dados antes de confirmar. Apenas registros <span className="text-accent-success font-bold">Válidos</span> serão processados.
                                </p>
                            </div>
                            <button onClick={handleCancelPreview} className="p-2 hover:bg-bg-tertiary rounded-full text-text-secondary hover:text-text-primary transition-colors">
                                X
                            </button>
                        </div>

                        {/* Stats Bar */}
                        {previewModal.type === 'feedbacks' && (
                            <div className="grid grid-cols-3 gap-4 p-6 bg-white border-b border-border-color">
                                <div className="p-4 rounded-xl bg-bg-tertiary border border-border-color flex flex-col items-center">
                                    <span className="text-text-secondary text-xs uppercase font-bold tracking-wider">Total</span>
                                    <span className="text-2xl font-bold text-text-primary">{previewModal.stats.total}</span>
                                </div>
                                <div className="p-4 rounded-xl bg-accent-success/10 border border-accent-success/20 flex flex-col items-center">
                                    <span className="text-accent-success text-xs uppercase font-bold tracking-wider">Válidos</span>
                                    <span className="text-2xl font-bold text-accent-success">{previewModal.stats.valid}</span>
                                </div>
                                <div className="p-4 rounded-xl bg-accent-danger/10 border border-accent-danger/20 flex flex-col items-center">
                                    <span className="text-accent-danger text-xs uppercase font-bold tracking-wider">Com Erro</span>
                                    <span className="text-2xl font-bold text-accent-danger">{previewModal.stats.invalid}</span>
                                </div>
                            </div>
                        )}

                        {/* Data Table */}
                        <div className="flex-1 overflow-auto bg-bg-secondary/50 p-6">
                            <div className="bg-white rounded-lg border border-border-color shadow-sm overflow-hidden">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-bg-tertiary text-text-primary font-bold sticky top-0 z-10 shadow-sm">
                                        <tr>
                                            {previewModal.data.length > 0 && Object.keys(previewModal.data[0].display).filter(k => !k.startsWith('_')).map((header) => (
                                                <th key={header} className="px-6 py-4 border-b border-border-color whitespace-nowrap">
                                                    {header}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border-color">
                                        {previewModal.data.map((row, idx) => {
                                            const status = row.display._statusType;
                                            const isError = status === 'error';
                                            return (
                                                <tr key={idx} className={`hover:bg-bg-tertiary/50 transition-colors ${isError ? 'bg-accent-danger/5' : ''}`}>
                                                    {Object.entries(row.display).filter(([k]) => !k.startsWith('_')).map(([key, val], vIdx) => (
                                                        <td key={vIdx} className="px-6 py-3 whitespace-nowrap max-w-[300px] truncate">
                                                            {key === 'Status' ? (
                                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${status === 'success' ? 'bg-accent-success/15 text-accent-success' :
                                                                    status === 'error' ? 'bg-accent-danger/15 text-accent-danger' :
                                                                        'bg-accent-warning/15 text-accent-warning'
                                                                    }`}>
                                                                    {status === 'success' ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                                                                    {val}
                                                                </span>
                                                            ) : val}
                                                        </td>
                                                    ))}
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="p-6 border-t border-border-color bg-white flex justify-between items-center">
                            <span className="text-sm text-text-secondary">
                                {previewModal.stats?.valid === 0 && previewModal.type === 'feedbacks' ?
                                    'Nenhum registro válido para importar.' :
                                    'Confirme para processar os registros válidos.'}
                            </span>
                            <div className="flex gap-3">
                                <button
                                    onClick={handleCancelPreview}
                                    className="px-6 py-2.5 rounded-lg border border-border-color font-bold text-text-secondary hover:bg-bg-tertiary hover:text-text-primary transition-all"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleConfirmPreview}
                                    disabled={previewModal.stats?.valid === 0}
                                    className={`px-6 py-2.5 rounded-lg flex items-center gap-2 font-bold shadow-lg transition-all ${previewModal.stats?.valid > 0
                                        ? 'bg-primary hover:bg-primary-hover text-text-on-primary transform hover:-translate-y-0.5'
                                        : 'bg-bg-tertiary text-text-secondary cursor-not-allowed shadow-none'
                                        }`}
                                >
                                    {previewModal.stats?.valid > 0 && <CheckCircle size={18} />}
                                    Confirmar Importação
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirmation Modal (Existing) */}
            {confirmModal.isOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fadeIn" onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}>
                    <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="flex flex-col items-center text-center mb-6">
                            <div className="w-16 h-16 bg-accent-warning/10 text-accent-warning rounded-full flex items-center justify-center mb-4">
                                <AlertTriangle size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-text-primary mb-2">Ramos Já Existentes</h3>
                            <p className="text-text-secondary mb-4">
                                Os seguintes ramos de atividade já existem e suas perguntas serão substituídas:
                            </p>
                            <ul className="text-sm font-semibold text-text-primary bg-bg-secondary p-4 rounded-lg w-full mb-4">
                                {confirmModal.existingIndustries.map(name => (
                                    <li key={name} className="border-b border-border-color last:border-0 py-1">
                                        {name}
                                    </li>
                                ))}
                            </ul>
                            <p className="text-text-secondary text-sm">
                                Deseja continuar e sobrescrever os dados destes ramos?
                            </p>
                        </div>

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => executeImportQuestions(confirmModal.importData)}
                                className="w-full py-3 rounded-lg bg-primary hover:bg-primary-hover text-text-on-primary font-bold transition-colors"
                            >
                                Confirmar Importação
                            </button>
                            <button
                                onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
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

export default ImportMaintenance;
