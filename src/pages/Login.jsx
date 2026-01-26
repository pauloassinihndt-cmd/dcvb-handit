import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, ArrowRight } from 'lucide-react';
import logo from '../assets/logo.png';

const Login = () => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Get the page the user was trying to access
    const from = location.state?.from?.pathname || '/admin/questoes';

    const handleSubmit = (e) => {
        e.preventDefault();
        if (login(password)) {
            navigate(from, { replace: true });
        } else {
            setError('Senha incorreta. Tente novamente.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-bg-secondary p-4">
            <div className="bg-white p-8 rounded-xl border border-border-color shadow-lg max-w-md w-full animate-fadeIn">
                <div className="flex justify-center mb-8">
                    <img src={logo} alt="Handit Logo" className="h-10 object-contain" />
                </div>

                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold mb-2">Área Restrita</h1>
                    <p className="text-text-secondary">Digite a senha de administrador para acessar.</p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="relative">
                        <Lock className="absolute left-3 top-3.5 text-text-secondary" size={20} />
                        <input
                            type="password"
                            placeholder="Senha"
                            className="w-full pl-10 pr-4 py-3 rounded-lg border border-border-color focus:ring-2 focus:ring-primary outline-none transition-all"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                setError('');
                            }}
                        />
                    </div>

                    {error && (
                        <p className="text-sm text-accent-danger text-center font-medium animate-pulse">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        className="flex items-center justify-center gap-2 w-full bg-primary hover:bg-primary-hover text-text-on-primary py-3 rounded-lg font-bold transition-colors"
                    >
                        Entrar <ArrowRight size={20} />
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate('/')}
                        className="text-sm text-text-secondary hover:text-primary transition-colors text-center mt-2"
                    >
                        Voltar para o início
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
