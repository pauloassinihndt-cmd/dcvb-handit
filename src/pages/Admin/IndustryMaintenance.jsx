import { useState, useEffect } from 'react';
import { useDiagnosis } from '../../context/DiagnosisContext';
import { Plus, Trash2, Edit2, Eye, EyeOff, CheckCircle } from 'lucide-react';

const IndustryMaintenance = () => {
    const { industries, addIndustry, updateIndustry, deleteIndustry, toggleIndustryStatus, fetchAllIndustries } = useDiagnosis();
    const [newIndustryName, setNewIndustryName] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState('');

    // Ao montar a tela do admin, busca TODOS os ramos (ativos e inativos)
    useEffect(() => {
        fetchAllIndustries();
    }, []);

    const handleAdd = async (e) => {
        e.preventDefault();
        if (newIndustryName.trim()) {
            const success = await addIndustry(newIndustryName.trim());
            if (success) {
                setNewIndustryName('');
                // Recarrega todos para manter inativas visíveis
                await fetchAllIndustries();
            }
        }
    };

    const handleToggle = async (id) => {
        await toggleIndustryStatus(id);
        // Recarrega todos para manter inativas visíveis
        await fetchAllIndustries();
    };

    const startEditing = (industry) => {
        setEditingId(industry.id);
        setEditName(industry.name);
    };

    const handleUpdate = () => {
        if (editName.trim()) {
            updateIndustry(editingId, editName.trim());
            setEditingId(null);
            setEditName('');
        }
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditName('');
    };

    const [deleteModal, setDeleteModal] = useState({ isOpen: false, industryId: null, industryName: '' });

    const handleDeleteClick = (industry) => {
        setDeleteModal({
            isOpen: true,
            industryId: industry.id,
            industryName: industry.name
        });
    };

    const confirmDelete = async () => {
        if (deleteModal.industryId) {
            await deleteIndustry(deleteModal.industryId);
            setDeleteModal({ isOpen: false, industryId: null, industryName: '' });
            await fetchAllIndustries();
        }
    };

    const activeCount = industries.filter(i => i.active).length;
    const hiddenCount = industries.filter(i => !i.active).length;

    return (
        <div className="max-w-4xl mx-auto pb-20">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-text-primary mb-2">Ramos de Atividade</h1>
                <p className="text-text-secondary">
                    Gerencie os ramos disponíveis no formulário. Ramos <strong>ocultos</strong> não aparecem para o usuário, mas continuam associados aos diagnósticos históricos.
                </p>
            </header>

            {/* Resumo */}
            <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-white rounded-xl border border-border-color p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-accent-success/10 flex items-center justify-center">
                        <Eye size={20} className="text-accent-success" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-text-primary">{activeCount}</p>
                        <p className="text-sm text-text-secondary">Visíveis no formulário</p>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-border-color p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-bg-tertiary flex items-center justify-center">
                        <EyeOff size={20} className="text-text-secondary" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-text-primary">{hiddenCount}</p>
                        <p className="text-sm text-text-secondary">Ocultos do formulário</p>
                    </div>
                </div>
            </div>

            {/* Add New Industry */}
            <div className="bg-white p-6 rounded-xl border border-border-color shadow-sm mb-8">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Plus size={20} className="text-primary" />
                    Adicionar Novo Ramo
                </h2>
                <form onSubmit={handleAdd} className="flex gap-4">
                    <input
                        type="text"
                        placeholder="Nome do Ramo de Atividade (ex: Varejo, Indústria...)"
                        className="flex-1 bg-bg-secondary border border-border-color rounded-lg px-4 py-3 outline-none focus:border-primary transition-colors"
                        value={newIndustryName}
                        onChange={(e) => setNewIndustryName(e.target.value)}
                    />
                    <button
                        type="submit"
                        disabled={!newIndustryName.trim()}
                        className="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Adicionar
                    </button>
                </form>
            </div>

            {/* List Industries */}
            <div className="bg-white rounded-xl border border-border-color overflow-hidden shadow-sm">
                <div className="p-6 border-b border-border-color bg-bg-secondary/30">
                    <h2 className="text-lg font-bold">Ramos Cadastrados ({industries.length})</h2>
                </div>

                {!Array.isArray(industries) || industries.length === 0 ? (
                    <div className="p-8 text-center text-text-secondary">
                        Nenhum ramo de atividade cadastrado.
                    </div>
                ) : (
                    <div className="divide-y divide-border-color">
                        {industries.map((industry) => {
                            const isVisible = industry.active === true || industry.active === 1;
                            return (
                                <div
                                    key={industry.id}
                                    className={`p-4 flex items-center justify-between transition-colors ${isVisible ? 'hover:bg-bg-secondary/30' : 'bg-bg-secondary/60 opacity-70'}`}
                                >
                                    {editingId === industry.id ? (
                                        <div className="flex-1 flex gap-3 mr-4">
                                            <input
                                                type="text"
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                className="flex-1 bg-white border border-primary rounded-lg px-3 py-2 outline-none"
                                                autoFocus
                                            />
                                            <button
                                                onClick={handleUpdate}
                                                className="px-4 py-2 bg-primary text-white rounded-lg font-bold text-sm"
                                            >
                                                Salvar
                                            </button>
                                            <button
                                                onClick={cancelEdit}
                                                className="px-4 py-2 bg-bg-tertiary text-text-secondary rounded-lg font-bold text-sm hover:bg-bg-tertiary/80"
                                            >
                                                Cancelar
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-3">
                                            {/* Indicador visual de visibilidade */}
                                            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isVisible ? 'bg-accent-success' : 'bg-text-secondary/40'}`} />
                                            <span className={`font-medium ${!isVisible ? 'text-text-secondary line-through' : 'text-text-primary'}`}>
                                                {industry.name}
                                            </span>
                                            {industry.isFixed && (
                                                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded font-medium border border-primary/20">Padrão</span>
                                            )}
                                            {!isVisible && (
                                                <span className="text-xs bg-bg-tertiary text-text-secondary px-2 py-0.5 rounded flex items-center gap-1">
                                                    <EyeOff size={11} />
                                                    Oculto no formulário
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    {editingId !== industry.id && (
                                        <div className="flex items-center gap-2">
                                            {/* Botão de visibilidade - sempre visível */}
                                            {!industry.isFixed && (
                                                <button
                                                    onClick={() => handleToggle(industry.id)}
                                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all border ${isVisible
                                                            ? 'text-text-secondary border-border-color hover:bg-accent-warning/10 hover:text-accent-warning hover:border-accent-warning/30'
                                                            : 'text-accent-success border-accent-success/30 bg-accent-success/5 hover:bg-accent-success/10'
                                                        }`}
                                                    title={isVisible ? 'Ocultar no formulário' : 'Tornar visível no formulário'}
                                                >
                                                    {isVisible ? (
                                                        <>
                                                            <EyeOff size={15} />
                                                            <span className="hidden sm:inline">Ocultar</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Eye size={15} />
                                                            <span className="hidden sm:inline">Mostrar</span>
                                                        </>
                                                    )}
                                                </button>
                                            )}
                                            {/* Editar */}
                                            {!industry.isFixed && (
                                                <button
                                                    onClick={() => startEditing(industry)}
                                                    className="p-2 text-text-secondary hover:text-primary hover:bg-primary/10 rounded transition-colors"
                                                    title="Editar nome"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                            )}
                                            {/* Excluir */}
                                            {!industry.isFixed && (
                                                <button
                                                    onClick={() => handleDeleteClick(industry)}
                                                    className="p-2 text-text-secondary hover:text-accent-danger hover:bg-accent-danger/10 rounded transition-colors"
                                                    title="Excluir"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                            {industry.isFixed && (
                                                <span className="text-xs text-text-secondary italic px-2">Protegido</span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {deleteModal.isOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fadeIn" onClick={() => setDeleteModal({ ...deleteModal, isOpen: false })}>
                    <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="flex flex-col items-center text-center mb-6">
                            <div className="w-16 h-16 bg-accent-danger/10 text-accent-danger rounded-full flex items-center justify-center mb-4">
                                <Trash2 size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-text-primary mb-2">Excluir Ramo?</h3>
                            <p className="text-text-secondary text-sm">
                                Tem certeza que deseja excluir o ramo <span className="font-bold text-text-primary">"{deleteModal.industryName}"</span>?
                                <br />
                                <span className="text-xs mt-2 block text-accent-danger">Esta ação não pode ser desfeita e removerá todas as perguntas associadas.</span>
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteModal({ ...deleteModal, isOpen: false })}
                                className="flex-1 py-2 rounded-lg border border-border-color font-bold text-text-secondary hover:bg-bg-tertiary transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="flex-1 py-2 rounded-lg bg-accent-danger hover:bg-red-600 text-white font-bold transition-colors shadow-lg shadow-red-200"
                            >
                                Excluir
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default IndustryMaintenance;
