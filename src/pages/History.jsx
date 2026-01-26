import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useDiagnosis } from '../context/DiagnosisContext';
import { Calendar, Building, ChevronRight, FileText, Trash2, Eye } from 'lucide-react';

const History = () => {
    const { history, deleteFromHistory, deleteManyFromHistory } = useDiagnosis();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [dateStart, setDateStart] = useState('');
    const [dateEnd, setDateEnd] = useState('');

    const [selectedItem, setSelectedItem] = useState(null);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, type: null, data: null });

    const filteredHistory = history.filter(item => {
        if (!item) return false;
        const matchesSearch = (item.company?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (item.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (item.userInfo?.vendedor?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (item.userInfo?.etn?.toLowerCase() || '').includes(searchTerm.toLowerCase());

        let matchesDate = true;
        if (dateStart || dateEnd) {
            const itemDate = new Date(item.date);
            itemDate.setHours(0, 0, 0, 0);
            const itemTime = itemDate.getTime();

            if (dateStart) {
                const [y, m, d] = dateStart.split('-');
                const start = new Date(y, m - 1, d).getTime();
                if (itemTime < start) matchesDate = false;
            }

            if (dateEnd) {
                const [y, m, d] = dateEnd.split('-');
                const end = new Date(y, m - 1, d).getTime();
                if (itemTime > end) matchesDate = false;
            }
        }

        return matchesSearch && matchesDate;
    });

    const clearFilters = () => {
        setSearchTerm('');
        setDateStart('');
        setDateEnd('');
    };

    const handleViewResult = (item) => {
        navigate('/resultados', { state: { historyItem: item } });
    };

    const handleViewETN = (item) => {
        navigate('/relatorio-etn', { state: { historyItem: item } });
    };

    const openModal = (item) => {
        setSelectedItem(item);
    };

    const closeModal = () => {
        setSelectedItem(null);
    };

    const handleDeleteClick = (type, data) => {
        setDeleteModal({ isOpen: true, type, data });
    };

    const closeDeleteModal = () => {
        setDeleteModal({ isOpen: false, type: null, data: null });
    };

    const confirmDelete = () => {
        if (deleteModal.type === 'single') {
            deleteFromHistory(deleteModal.data);
        } else if (deleteModal.type === 'bulk') {
            deleteManyFromHistory(deleteModal.data);
        }
        closeDeleteModal();
    };

    if (history.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 animate-fadeIn">
                <div className="w-20 h-20 bg-bg-tertiary rounded-full flex items-center justify-center mb-6 text-text-secondary">
                    <FileText size={40} />
                </div>
                <h2 className="text-2xl font-bold mb-2">Nenhum diagnóstico encontrado</h2>
                <p className="text-text-secondary mb-8">Você ainda não realizou nenhum diagnóstico de maturidade.</p>
                <Link
                    to="/diagnostico"
                    className="px-6 py-3 bg-primary hover:bg-primary-hover text-text-on-primary font-bold rounded-full transition-colors"
                >
                    Iniciar Novo Diagnóstico
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto animate-fadeIn pb-20">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Histórico de Diagnósticos</h1>
                {filteredHistory.length > 0 && (
                    <button
                        onClick={() => {
                            const idsToDelete = filteredHistory.map(item => item.id).filter(Boolean);
                            if (idsToDelete.length > 0) {
                                handleDeleteClick('bulk', idsToDelete);
                            }
                        }}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-bg-white border border-accent-danger text-accent-danger hover:bg-accent-danger hover:text-white transition-colors font-bold text-sm"
                    >
                        <Trash2 size={18} />
                        Excluir Listados ({filteredHistory.length})
                    </button>
                )}
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="flex-[2]">
                    <label className="block text-sm font-bold text-text-secondary mb-1">Buscar</label>
                    <input
                        type="text"
                        placeholder="Filtrar por empresa, nome, vendedor ou ETN..."
                        className="w-full p-3 rounded-lg border border-border-color focus:ring-2 focus:ring-primary outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 flex-1">
                    <div className="w-full">
                        <label className="block text-sm font-bold text-text-secondary mb-1">Data Inicial</label>
                        <input
                            type="date"
                            className="w-full p-3 rounded-lg border border-border-color focus:ring-2 focus:ring-primary outline-none"
                            value={dateStart}
                            onChange={(e) => setDateStart(e.target.value)}
                        />
                    </div>
                    <div className="w-full">
                        <label className="block text-sm font-bold text-text-secondary mb-1">Data Final</label>
                        <input
                            type="date"
                            className="w-full p-3 rounded-lg border border-border-color focus:ring-2 focus:ring-primary outline-none"
                            value={dateEnd}
                            onChange={(e) => setDateEnd(e.target.value)}
                        />
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={clearFilters}
                            className="h-[50px] px-4 rounded-lg border border-border-color text-text-secondary hover:bg-bg-tertiary hover:text-primary transition-colors font-bold"
                            title="Limpar Filtros"
                        >
                            Limpar
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-4">
                {filteredHistory.length === 0 ? (
                    <p className="text-center text-text-secondary py-10">Nenhum resultado encontrado para os filtros selecionados.</p>
                ) : (
                    filteredHistory.map((item, idx) => (
                        <div key={item.id || idx} className="bg-white p-6 rounded-xl border border-border-color shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div className="flex-1 cursor-pointer" onClick={() => openModal(item)}>
                                <div className="flex items-center gap-2 text-primary font-semibold mb-1">
                                    <Building size={16} />
                                    {item.company}
                                </div>
                                <div className="text-sm text-text-secondary flex items-center gap-2 mb-2">
                                    <Calendar size={14} />
                                    {new Date(item.date).toLocaleDateString('pt-BR')} às {new Date(item.date).toLocaleTimeString('pt-BR')}
                                </div>
                                <div className="text-sm">
                                    <span className="text-text-secondary">Respondido por: </span>
                                    <span className="font-medium">{item.name}</span>
                                    {item.userInfo?.vendedor && (
                                        <span className="text-text-secondary"> | Vend: <span className="font-medium text-text-primary">{item.userInfo.vendedor}</span></span>
                                    )}
                                    {item.userInfo?.etn && (
                                        <span className="text-text-secondary"> | ETN: <span className="font-medium text-text-primary">{item.userInfo.etn}</span></span>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                                <div className="text-right cursor-pointer" onClick={() => openModal(item)}>
                                    <div className="text-xs text-text-secondary uppercase font-bold tracking-wider">Score Geral</div>
                                    <div className={`text-2xl font-bold ${item.score < 50 ? 'text-accent-warning' : 'text-accent-success'
                                        }`}>
                                        {item.score}%
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => openModal(item)}
                                        className="p-2 rounded-full hover:bg-bg-tertiary text-text-secondary hover:text-primary transition-colors"
                                        title="Ver Detalhes"
                                    >
                                        <Eye size={20} />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (item.id) {
                                                handleDeleteClick('single', item.id);
                                            } else {
                                                // Fallback: If for some reason ID is missing, try to reload or warn differently
                                                console.error('Item missing ID', item);
                                            }
                                        }}
                                        className="p-2 rounded-full hover:bg-bg-tertiary text-text-secondary hover:text-accent-danger transition-colors"
                                        title="Excluir"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Details Modal */}
            {selectedItem && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fadeIn" onClick={closeModal}>
                    <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-start mb-6 border-b border-border-color pb-4">
                            <div>
                                <h3 className="text-2xl font-bold text-primary">{selectedItem.company}</h3>
                                <p className="text-sm text-text-secondary">
                                    {new Date(selectedItem.date).toLocaleDateString('pt-BR')} às {new Date(selectedItem.date).toLocaleTimeString('pt-BR')}
                                </p>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-sm font-bold ${selectedItem.score < 50 ? 'bg-accent-warning/10 text-accent-warning' : 'bg-accent-success/10 text-accent-success'}`}>
                                Score: {selectedItem.score}%
                            </div>
                        </div>

                        <div className="space-y-4 mb-8">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-text-secondary uppercase block mb-1">Nome</label>
                                    <p className="font-medium">{selectedItem.name}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-text-secondary uppercase block mb-1">Cargo</label>
                                    <p className="font-medium">{selectedItem.userInfo?.cargo || '-'}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-text-secondary uppercase block mb-1">E-mail</label>
                                    <p className="font-medium truncate" title={selectedItem.userInfo?.email}>{selectedItem.userInfo?.email || '-'}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-text-secondary uppercase block mb-1">Vendedor</label>
                                    <p className="font-medium">{selectedItem.userInfo?.vendedor || '-'}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-text-secondary uppercase block mb-1">ETN</label>
                                    <p className="font-medium">{selectedItem.userInfo?.etn || '-'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <div className="flex gap-3">
                                <button
                                    onClick={() => handleViewResult(selectedItem)}
                                    className="flex-1 py-3 rounded-lg bg-primary hover:bg-primary-hover text-text-on-primary font-bold transition-colors flex justify-center items-center gap-2"
                                >
                                    Relatório Cliente
                                    <ChevronRight size={18} />
                                </button>
                                <button
                                    onClick={() => handleViewETN(selectedItem)}
                                    className="flex-1 py-3 rounded-lg bg-bg-tertiary hover:bg-bg-secondary text-primary font-bold transition-colors flex justify-center items-center gap-2 border border-primary/20"
                                >
                                    Relatório ETN
                                    <FileText size={18} />
                                </button>
                            </div>
                            <button
                                onClick={closeModal}
                                className="w-full py-3 rounded-lg border border-border-color font-bold text-text-secondary hover:bg-bg-tertiary transition-colors"
                            >
                                Fechar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteModal.isOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fadeIn" onClick={closeDeleteModal}>
                    <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="flex flex-col items-center text-center mb-6">
                            <div className="w-16 h-16 bg-accent-danger/10 text-accent-danger rounded-full flex items-center justify-center mb-4">
                                <Trash2 size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-text-primary mb-2">Confirmar Exclusão</h3>
                            <p className="text-text-secondary">
                                {deleteModal.type === 'bulk'
                                    ? `Tem certeza que deseja excluir ${deleteModal.data.length} registros?`
                                    : 'Tem certeza que deseja excluir este registro de histórico?'}
                            </p>
                            <p className="text-xs text-text-secondary mt-2 font-bold uppercase text-accent-danger">Esta ação não pode ser desfeita.</p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={closeDeleteModal}
                                className="flex-1 py-3 rounded-lg border border-border-color font-bold text-text-secondary hover:bg-bg-tertiary transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="flex-1 py-3 rounded-lg bg-accent-danger hover:bg-red-600 text-white font-bold transition-colors"
                            >
                                Excluir Permanentemente
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default History;
