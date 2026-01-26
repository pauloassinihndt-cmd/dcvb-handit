import { Link, Outlet, useLocation } from 'react-router-dom';
import { Settings, History, ArrowLeft, Menu, X, LogOut, MessageSquare, Briefcase, Upload } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';

const AdminLayout = () => {
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { logout } = useAuth();

    const isActive = (path) => location.pathname === path;

    const NavItem = ({ to, label, icon: Icon }) => (
        <Link
            to={to}
            onClick={() => setIsMobileMenuOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${isActive(to)
                ? 'bg-primary/10 text-primary'
                : 'text-text-secondary hover:bg-bg-secondary hover:text-text-primary'
                }`}
        >
            <Icon size={20} />
            {label}
        </Link>
    );

    return (
        <div className="flex h-screen bg-bg-secondary">
            {/* Sidebar Desktop */}
            <aside className="hidden md:flex flex-col w-64 bg-white border-r border-border-color">
                <div className="p-6 border-b border-border-color">
                    <img src={logo} alt="Handit Logo" className="h-8 mb-4 object-contain" />
                    <div className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full w-fit">
                        Área Administrativa
                    </div>
                </div>

                <nav className="flex flex-col gap-2">
                    <NavItem to="/" label="Voltar ao Site" icon={ArrowLeft} />
                    <NavItem to="/admin/ramos" label="Ramos de Atividade" icon={Briefcase} />
                    <NavItem to="/admin/questoes" label="Manutenção Perguntas" icon={Settings} />
                    <NavItem to="/admin/feedback" label="Feedback das Áreas" icon={MessageSquare} />
                    <NavItem to="/admin/pontuacao" label="Pontuação" icon={Settings} />
                    <NavItem to="/admin/importacao" label="Importação" icon={Upload} />
                    <NavItem to="/admin/historico" label="Histórico" icon={History} />

                    <button
                        onClick={logout}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-accent-danger hover:bg-bg-secondary transition-colors text-left mt-4"
                    >
                        <LogOut size={20} />
                        Sair
                    </button>
                </nav>


            </aside>

            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-border-color flex items-center justify-between px-4 z-50">
                <img src={logo} alt="Handit Logo" className="h-8 object-contain" />
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-text-primary">
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 bg-white z-40 pt-20 px-4 md:hidden animate-fadeIn">
                    <div className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full w-fit mb-6">
                        Área Administrativa
                    </div>
                    <nav className="flex flex-col gap-2">
                        <NavItem to="/admin/ramos" label="Ramos de Atividade" icon={Briefcase} />
                        <NavItem to="/admin/questoes" label="Manutenção de Perguntas" icon={Settings} />
                        <NavItem to="/admin/pontuacao" label="Pontuação" icon={Settings} />
                        <NavItem to="/admin/importacao" label="Importação" icon={Upload} />
                        <NavItem to="/admin/historico" label="Histórico de Diagnósticos" icon={History} />
                        <div className="h-px bg-border-color my-4"></div>
                        <Link to="/" className="flex items-center gap-3 px-4 py-3 text-text-secondary hover:text-accent-danger transition-colors">
                            <LogOut size={20} />
                            Sair
                        </Link>
                    </nav>
                </div>
            )}

            {/* Main Content */}
            <main className="flex-1 overflow-auto pt-16 md:pt-0">
                <div className="p-6 md:p-10 max-w-6xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
