import { Link, useLocation } from 'react-router-dom';
import { Home, ClipboardList, BarChart, Menu, X, Settings } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import logo from '../assets/logo.png';
import { useAuth } from '../context/AuthContext';

const Layout = () => {
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { logout } = useAuth();

    const isActive = (path) => location.pathname === path;

    const NavItem = ({ to, label }) => (
        <Link
            to={to}
            onClick={() => setIsMobileMenuOpen(false)}
            className={`relative px-2 py-1 font-medium transition-colors hover:text-primary ${isActive(to)
                ? 'text-primary'
                : 'text-text-primary'
                }`}
        >
            {label}
            {isActive(to) && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full"></span>
            )}
        </Link>
    );

    return (
        <div className="flex flex-col min-h-screen bg-bg-primary text-text-primary font-sans">
            {/* Header - White, Top Navigation */}
            <header className="fixed top-0 left-0 right-0 h-24 bg-white border-b border-border-color z-50 flex items-center justify-between px-6 md:px-12 shadow-sm">
                <div className="flex items-center gap-2">
                    {/* Logo */}
                    <Link to="/">
                        <img src={logo} alt="Handit Logo" className="h-10 md:h-12 w-auto object-contain" />
                    </Link>
                </div>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-8">
                    <NavItem to="/" label="Início" />
                    <NavItem to="/diagnostico" label="Diagnóstico" />
                    <NavItem to="/admin" label="Manutenção" icon={Settings} />
                    <NavItem to="/resultados" label="Resultados" />


                </nav>

                {/* Mobile Menu Toggle */}
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden p-2 text-text-primary">
                    {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
                </button>
            </header>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 bg-white z-40 pt-28 px-6 md:hidden animate-fadeIn">
                    <nav className="flex flex-col gap-6 text-xl">
                        <NavItem to="/" label="Início" />
                        <Link to="/diagnostico" onClick={() => setIsMobileMenuOpen(false)} className="text-text-secondary hover:text-primary font-medium p-2">Diagnóstico</Link>
                        <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)} className="text-text-secondary hover:text-primary font-medium p-2 flex items-center gap-2">
                            <Settings size={18} />
                            Manutenção
                        </Link>
                        <NavItem to="/resultados" label="Resultados" />

                    </nav>
                </div>
            )}

            {/* Main Content */}
            <main className="flex-1 w-full pt-28 pb-10 px-4 md:px-8 bg-bg-secondary">
                <div className="max-w-6xl mx-auto">
                    <Outlet />
                </div>
            </main>

            <footer className="bg-white border-t border-border-color py-8 px-8 text-center text-text-secondary text-sm">
                <p>© 2025 Handit Planejamento. Todos os direitos reservados.</p>
            </footer>
        </div>
    );
};

export default Layout;
