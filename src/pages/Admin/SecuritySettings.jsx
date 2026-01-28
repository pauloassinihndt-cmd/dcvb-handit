import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Key, Save, AlertCircle, CheckCircle2 } from 'lucide-react';

const SecuritySettings = () => {
    const { user } = useAuth();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [status, setStatus] = useState({ type: '', message: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ type: '', message: '' });

        if (newPassword !== confirmPassword) {
            setStatus({ type: 'error', message: 'As novas senhas não coincidem.' });
            return;
        }

        if (newPassword.length < 6) {
            setStatus({ type: 'error', message: 'A nova senha deve ter pelo menos 6 caracteres.' });
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('/api/admin/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: user?.username || 'admin',
                    currentPassword,
                    newPassword
                })
            });

            const data = await response.json();

            if (response.ok) {
                setStatus({ type: 'success', message: 'Senha alterada com sucesso!' });
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            } else {
                setStatus({ type: 'error', message: data.message || 'Erro ao alterar senha.' });
            }
        } catch (error) {
            setStatus({ type: 'error', message: 'Erro de conexão com o servidor.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto pb-20">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-text-primary mb-2">Segurança</h1>
                <p className="text-text-secondary">Altere a senha de acesso à área administrativa.</p>
            </header>

            <div className="bg-white p-8 rounded-xl border border-border-color shadow-sm">
                <div className="flex items-center gap-3 mb-6 pb-6 border-b border-border-color">
                    <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                        <Key size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">Alterar Senha</h2>
                        <p className="text-text-secondary text-sm">Atualize suas credenciais periodicamente.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-text-primary mb-2">Senha Atual</label>
                        <input
                            type="password"
                            required
                            className="w-full bg-bg-secondary border border-border-color rounded-lg px-4 py-3 outline-none focus:border-primary transition-colors"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-text-primary mb-2">Nova Senha</label>
                            <input
                                type="password"
                                required
                                className="w-full bg-bg-secondary border border-border-color rounded-lg px-4 py-3 outline-none focus:border-primary transition-colors"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-text-primary mb-2">Confirmar Nova Senha</label>
                            <input
                                type="password"
                                required
                                className="w-full bg-bg-secondary border border-border-color rounded-lg px-4 py-3 outline-none focus:border-primary transition-colors"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    {status.message && (
                        <div className={`p-4 rounded-lg flex items-center gap-3 ${status.type === 'error' ? 'bg-accent-danger/10 text-accent-danger' : 'bg-accent-success/10 text-accent-success'}`}>
                            {status.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
                            <span className="font-medium text-sm">{status.message}</span>
                        </div>
                    )}

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full bg-primary hover:bg-primary-hover text-white py-4 rounded-lg font-bold transition-all shadow-lg flex items-center justify-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {loading ? (
                                <>Aguarde...</>
                            ) : (
                                <>
                                    <Save size={20} />
                                    Salvar Nova Senha
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SecuritySettings;
