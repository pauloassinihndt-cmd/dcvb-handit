# Codebase Context


## File: package.json
```
{
  "name": "workspace_dcvb_handit",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  },
  "dependencies": {
    "html2canvas": "^1.4.1",
    "jspdf": "^4.0.0",
    "lucide-react": "^0.562.0",
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "react-router-dom": "^7.12.0",
    "recharts": "^3.6.0"
  },
  "devDependencies": {
    "@eslint/js": "^9.39.1",
    "@types/react": "^19.2.5",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^5.1.1",
    "autoprefixer": "^10.4.23",
    "eslint": "^9.39.1",
    "eslint-plugin-react-hooks": "^7.0.1",
    "eslint-plugin-react-refresh": "^0.4.24",
    "globals": "^16.5.0",
    "postcss": "^8.5.6",
    "tailwindcss": "^3.4.17",
    "vite": "^7.2.4"
  }
}

```

## File: vite.config.js
```
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
})

```

## File: tailwind.config.js
```
/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'bg-primary': 'var(--bg-primary)',
                'bg-secondary': 'var(--bg-secondary)',
                'bg-tertiary': 'var(--bg-tertiary)',

                'text-primary': 'var(--text-primary)',
                'text-secondary': 'var(--text-secondary)',

                'primary': 'var(--primary)',
                'primary-hover': 'var(--primary-hover)',

                'accent-success': 'var(--accent-success)',
                'accent-warning': 'var(--accent-warning)',
                'accent-danger': 'var(--accent-danger)',

                'border-color': 'var(--border-color)',
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            animation: {
                'fadeIn': 'fadeIn 0.5s ease-out',
                'ping': 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                }
            }
        },
    },
    plugins: [],
}

```

## File: index.html
```
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>workspace_dcvb_handit</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>

```

## File: src/App.jsx
```
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';
import Layout from './components/Layout';
import AdminLayout from './components/AdminLayout';
import { DiagnosisProvider } from './context/DiagnosisContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './pages/Landing';
import Diagnosis from './pages/Diagnosis';
import Results from './pages/Results';
import History from './pages/History';
import Login from './pages/Login';
import QuestionMaintenance from './pages/Admin/QuestionMaintenance';
import FeedbackMaintenance from './pages/Admin/FeedbackMaintenance';
import IndustryMaintenance from './pages/Admin/IndustryMaintenance';

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: "/", element: <Landing /> },
      { path: "/diagnostico", element: <Diagnosis /> },
      { path: "/historico", element: <History /> }, // Public history or redirect? keeping as is
      { path: "/resultados", element: <Results /> },
    ]
  },
  {
    path: "/login",
    element: <Login />
  },
  {
    path: "/admin",
    element: (
      <ProtectedRoute>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="questoes" replace /> },
      { path: "questoes", element: <QuestionMaintenance /> },
      { path: "feedback", element: <FeedbackMaintenance /> },
      { path: "ramos", element: <IndustryMaintenance /> },
      { path: "historico", element: <History /> },
    ]
  }
]);

function App() {
  return (
    <AuthProvider>
      <DiagnosisProvider>
        <RouterProvider router={router} />
      </DiagnosisProvider>
    </AuthProvider>
  );
}

export default App;

```

## File: src/components/AdminLayout.jsx
```
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Settings, History, ArrowLeft, Menu, X, LogOut, MessageSquare, Briefcase } from 'lucide-react';
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

```

## File: src/components/Layout.jsx
```
import { Link, useLocation } from 'react-router-dom';
import { Home, ClipboardList, BarChart, Menu, X, Settings } from 'lucide-react';
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import logo from '../assets/logo.png';

const Layout = () => {
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

                    <button className="bg-primary hover:bg-primary-hover text-text-on-primary px-6 py-3 rounded-full font-bold transition-transform transform hover:scale-105 shadow-lg shadow-primary/30">
                        Fale com Especialista
                    </button>
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
                        <button className="bg-primary text-text-on-primary px-6 py-4 rounded-full font-bold w-full mt-4">
                            Fale com Especialista
                        </button>
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

```

## File: src/components/ProtectedRoute.jsx
```
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const location = useLocation();

    if (!isAuthenticated) {
        // Redirect to login page, but save the current location so we can send them back after they login
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};

export default ProtectedRoute;

```

## File: src/components/ScoreChart.jsx
```
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

const ScoreChart = ({ data }) => {
    return (
        <div className="w-full h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                    <PolarGrid stroke="#334155" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar
                        name="Score"
                        dataKey="A"
                        stroke="#00f2a9"
                        strokeWidth={3}
                        fill="#00f2a9"
                        fillOpacity={0.3}
                    />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default ScoreChart;

```

## File: src/context/AuthContext.jsx
```
import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        return localStorage.getItem('is_authenticated') === 'true';
    });

    const login = (password) => {
        // Simple hardcoded password for now
        if (password === 'admin123') {
            setIsAuthenticated(true);
            localStorage.setItem('is_authenticated', 'true');
            return true;
        }
        return false;
    };

    const logout = () => {
        setIsAuthenticated(false);
        localStorage.removeItem('is_authenticated');
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

```

## File: src/context/DiagnosisContext.jsx
```
import { createContext, useContext, useState } from 'react';
import { questionsData } from '../data/questions';

const DiagnosisContext = createContext();

export const DiagnosisProvider = ({ children }) => {
    // State for ALL questions map: { [industryId]: [sections] }
    const [allQuestions, setAllQuestions] = useState(() => {
        const saved = localStorage.getItem('questions_map_data');
        if (saved) {
            return JSON.parse(saved);
        }

        // Migration: If no map exists, check for old single 'questions_data' or use default
        const oldSaved = localStorage.getItem('questions_data');
        const initialQuestions = oldSaved ? JSON.parse(oldSaved) : questionsData;

        // Initialize 'default-geral' with these questions
        return {
            'default-geral': initialQuestions
        };
    });

    const [currentIndustryId, setCurrentIndustryId] = useState('default-geral');

    // Questions derived from current selection
    const questions = allQuestions[currentIndustryId] || allQuestions['default-geral'] || [];

    const updateAllQuestionsMap = (newMap) => {
        setAllQuestions(newMap);
        localStorage.setItem('questions_map_data', JSON.stringify(newMap));
    };

    const updateQuestions = (newQuestions) => {
        const newMap = {
            ...allQuestions,
            [currentIndustryId]: newQuestions
        };
        updateAllQuestionsMap(newMap);
    };

    const selectIndustryScope = (industryId) => {
        // If the industry doesn't exist in map yet (shouldn't happen with correct flow, but safe fallback), 
        // copy from default-geral
        if (!allQuestions[industryId]) {
            const defaultQuestions = allQuestions['default-geral'] || questionsData;
            const newMap = {
                ...allQuestions,
                [industryId]: JSON.parse(JSON.stringify(defaultQuestions)) // Deep copy
            };
            updateAllQuestionsMap(newMap);
        }
        setCurrentIndustryId(industryId);
    };

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

    const [history, setHistory] = useState(() => {
        const saved = localStorage.getItem('diagnosis_history');
        let parsed = saved ? JSON.parse(saved) : [];

        // Migration: Ensure all items have IDs
        let migrated = false;
        parsed = parsed.map(item => {
            if (!item.id) {
                migrated = true;
                return { ...item, id: crypto.randomUUID() };
            }
            return item;
        });

        if (migrated) {
            localStorage.setItem('diagnosis_history', JSON.stringify(parsed));
        }

        return parsed;
    });

    const [industries, setIndustries] = useState(() => {
        const saved = localStorage.getItem('dcvb_industries');
        const parsed = saved ? JSON.parse(saved) : [];

        // Ensure "Geral" always exists as the default fixed option
        const hasGeral = parsed.some(i => i.id === 'default-geral' || (i.name === 'Geral' && i.isFixed));
        if (!hasGeral) {
            const existingGeralIndex = parsed.findIndex(i => i.name === 'Geral');
            if (existingGeralIndex >= 0) {
                parsed[existingGeralIndex] = { ...parsed[existingGeralIndex], id: 'default-geral', isFixed: true, active: true };
                return parsed;
            } else {
                const geral = { id: 'default-geral', name: 'Geral', active: true, isFixed: true, createdAt: new Date().toISOString() };
                return [geral, ...parsed];
            }
        }

        return parsed;
    });

    const updateIndustries = (newIndustries) => {
        setIndustries(newIndustries);
        localStorage.setItem('dcvb_industries', JSON.stringify(newIndustries));
    };

    const addIndustry = (name) => {
        const newId = crypto.randomUUID();
        const newIndustry = {
            id: newId,
            name,
            active: true,
            createdAt: new Date().toISOString()
        };
        const updated = [...industries, newIndustry];
        updateIndustries(updated);

        // Copy questions from "Geral" to new industry
        const defaultQuestions = allQuestions['default-geral'] || questionsData;
        const newMap = {
            ...allQuestions,
            [newId]: JSON.parse(JSON.stringify(defaultQuestions)) // Deep copy
        };
        updateAllQuestionsMap(newMap);
    };

    const updateIndustry = (id, name) => {
        const industry = industries.find(i => i.id === id);
        if (industry?.isFixed) return; // Prevent editing fixed items

        const updated = industries.map(ind =>
            ind.id === id ? { ...ind, name } : ind
        );
        updateIndustries(updated);
    };

    const deleteIndustry = (id) => {
        const industry = industries.find(i => i.id === id);
        if (industry?.isFixed) return; // Prevent deleting fixed items

        const updated = industries.filter(ind => ind.id !== id);
        updateIndustries(updated);

        // Optional: Clean up questions map (not strictly necessary but good hygiene)
        const newMap = { ...allQuestions };
        delete newMap[id];
        updateAllQuestionsMap(newMap);
    };

    const toggleIndustryStatus = (id) => {
        const industry = industries.find(i => i.id === id);
        if (industry?.isFixed) return; // Prevent disabling fixed items (always active as fallback)

        const updated = industries.map(ind =>
            ind.id === id ? { ...ind, active: !ind.active } : ind
        );
        updateIndustries(updated);
    };

    const addToHistory = (result) => {
        setHistory(prev => {
            const newHistory = [{ ...result, id: crypto.randomUUID() }, ...prev];
            localStorage.setItem('diagnosis_history', JSON.stringify(newHistory));
            return newHistory;
        });
    };

    const deleteFromHistory = (id) => {
        setHistory(prev => {
            const newHistory = prev.filter((item) => item.id !== id);
            localStorage.setItem('diagnosis_history', JSON.stringify(newHistory));
            return newHistory;
        });
    };

    const deleteManyFromHistory = (ids) => {
        setHistory(prev => {
            const newHistory = prev.filter((item) => !ids.includes(item.id));
            localStorage.setItem('diagnosis_history', JSON.stringify(newHistory));
            return newHistory;
        });
    };

    const saveAnswer = (questionId, value) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: value
        }));
    };

    const updateUserInfo = (field, value) => {
        setUserInfo(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const nextSection = () => {
        setCurrentSectionIndex(prev => prev + 1);
    };

    const prevSection = () => {
        setCurrentSectionIndex(prev => Math.max(0, prev - 1));
    };

    const resetDiagnosis = () => {
        setAnswers({});
        setCurrentSectionIndex(0);
        setUserInfo({ nome: '', empresa: '', cargo: '', email: '', etn: '', vendedor: '' });
    }

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
            deleteFromHistory,
            deleteManyFromHistory,
            questions,
            updateQuestions,
            industries,
            addIndustry,
            updateIndustry,
            deleteIndustry,
            toggleIndustryStatus,
            selectIndustryScope,
            currentIndustryId
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

```

## File: src/main.jsx
```
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

```

## File: src/pages/Admin/FeedbackMaintenance.jsx
```
import { useState } from 'react';
import { useDiagnosis } from '../../context/DiagnosisContext';
import { Save, MessageSquare } from 'lucide-react';

const FeedbackMaintenance = () => {
    const { questions, updateQuestions } = useDiagnosis();
    const [localQuestions, setLocalQuestions] = useState(JSON.parse(JSON.stringify(questions)));
    const [hasChanges, setHasChanges] = useState(false);

    const handleFeedbackChange = (sectionIdx, level, value) => {
        const newQuestions = [...localQuestions];
        if (!newQuestions[sectionIdx].feedback) {
            newQuestions[sectionIdx].feedback = {};
        }
        if (!newQuestions[sectionIdx].feedback.levels) {
            newQuestions[sectionIdx].feedback.levels = {};
        }
        newQuestions[sectionIdx].feedback.levels[level] = value;
        setLocalQuestions(newQuestions);
        setHasChanges(true);
    };

    const saveChanges = () => {
        updateQuestions(localQuestions);
        setHasChanges(false);
        alert('Configurações de feedback salvas com sucesso!');
    };

    const levels = [
        { key: 'initial', label: 'Nível Inicial (0% - 25%)', color: 'text-accent-danger border-accent-danger/20' },
        { key: 'basic', label: 'Nível Básico (26% - 50%)', color: 'text-accent-warning border-accent-warning/20' },
        { key: 'intermediate', label: 'Nível Intermediário (51% - 75%)', color: 'text-primary border-primary/20' },
        { key: 'advanced', label: 'Nível Avançado (76% - 100%)', color: 'text-accent-success border-accent-success/20' }
    ];

    return (
        <div className="animate-fadeIn pb-20">
            <div className="flex justify-between items-center mb-8 sticky top-0 bg-bg-secondary py-4 z-10 backdrop-blur-sm">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <MessageSquare className="text-primary" />
                        Feedback das Áreas
                    </h1>
                    <p className="text-text-secondary">Configure as mensagens de sugestão para cada nível de maturidade.</p>
                </div>
                <button
                    onClick={saveChanges}
                    disabled={!hasChanges}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all ${hasChanges
                        ? 'bg-primary hover:bg-primary-hover text-text-on-primary shadow-lg'
                        : 'bg-bg-tertiary text-text-secondary cursor-not-allowed'
                        }`}
                >
                    <Save size={20} />
                    Salvar
                </button>
            </div>

            <div className="grid gap-8">
                {localQuestions.map((section, sIdx) => (
                    <div key={section.id} className="bg-white rounded-xl border border-border-color overflow-hidden">
                        <div className="p-6 border-b border-border-color bg-bg-secondary/30">
                            <h3 className="text-xl font-bold">{section.title}</h3>
                        </div>
                        <div className="p-6 grid gap-6 md:grid-cols-2">
                            {levels.map((level) => (
                                <div key={level.key} className={`p-4 rounded-lg border bg-bg-primary/50 ${level.color}`}>
                                    <label className="block text-sm font-bold mb-2 uppercase opacity-80">
                                        {level.label}
                                    </label>
                                    <textarea
                                        value={section.feedback?.levels?.[level.key] || ''}
                                        onChange={(e) => handleFeedbackChange(sIdx, level.key, e.target.value)}
                                        className="w-full p-3 rounded-lg border border-border-color bg-white focus:ring-2 focus:ring-primary outline-none text-text-primary"
                                        rows={3}
                                        placeholder={`Feedback para ${level.label.toLowerCase()}...`}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FeedbackMaintenance;

```

## File: src/pages/Admin/IndustryMaintenance.jsx
```
import { useState } from 'react';
import { useDiagnosis } from '../../context/DiagnosisContext';
import { Plus, Trash2, Edit2, Archive, CheckCircle } from 'lucide-react';

const IndustryMaintenance = () => {
    const { industries, addIndustry, updateIndustry, deleteIndustry, toggleIndustryStatus } = useDiagnosis();
    const [newIndustryName, setNewIndustryName] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState('');

    const handleAdd = (e) => {
        e.preventDefault();
        if (newIndustryName.trim()) {
            addIndustry(newIndustryName.trim());
            setNewIndustryName('');
        }
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

    return (
        <div className="max-w-4xl mx-auto">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-text-primary mb-2">Ramos de Atividade</h1>
                <p className="text-text-secondary">Gerencie os ramos de atividade disponíveis para seleção.</p>
            </header>

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

                {industries.length === 0 ? (
                    <div className="p-8 text-center text-text-secondary">
                        Nenhum ramo de atividade cadastrado.
                    </div>
                ) : (
                    <div className="divide-y divide-border-color">
                        {industries.map((industry) => (
                            <div key={industry.id} className="p-4 flex items-center justify-between hover:bg-bg-secondary/50 transition-colors group">
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
                                        <span className={`font-medium ${!industry.active ? 'text-text-secondary line-through opacity-60' : 'text-text-primary'}`}>
                                            {industry.name}
                                        </span>
                                        {!industry.active && (
                                            <span className="text-xs bg-bg-tertiary text-text-secondary px-2 py-1 rounded">Inativo</span>
                                        )}
                                    </div>
                                )}

                                {editingId !== industry.id && !industry.isFixed && (
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => toggleIndustryStatus(industry.id)}
                                            className={`p-2 rounded hover:bg-bg-tertiary transition-colors ${industry.active ? 'text-text-secondary hover:text-accent-warning' : 'text-accent-success hover:bg-accent-success/10'}`}
                                            title={industry.active ? "Desativar" : "Ativar"}
                                        >
                                            {industry.active ? <Archive size={18} /> : <CheckCircle size={18} />}
                                        </button>
                                        <button
                                            onClick={() => startEditing(industry)}
                                            className="p-2 text-text-secondary hover:text-primary hover:bg-primary/10 rounded transition-colors"
                                            title="Editar"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (window.confirm('Tem certeza que deseja excluir este ramo?')) {
                                                    deleteIndustry(industry.id);
                                                }
                                            }}
                                            className="p-2 text-text-secondary hover:text-accent-danger hover:bg-accent-danger/10 rounded transition-colors"
                                            title="Excluir"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                )}
                                {editingId !== industry.id && industry.isFixed && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded font-medium border border-primary/20">Padrão</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default IndustryMaintenance;

```

## File: src/pages/Admin/QuestionMaintenance.jsx
```
import { useState, useEffect } from 'react';
import { useBlocker } from 'react-router-dom';
import { useDiagnosis } from '../../context/DiagnosisContext';
import { ChevronDown, ChevronUp, Plus, Save, Eraser, Trash2 } from 'lucide-react';

const QuestionMaintenance = () => {
    const { questions, updateQuestions, industries, selectIndustryScope, currentIndustryId } = useDiagnosis();
    const [expandedSection, setExpandedSection] = useState(null);

    // Deep copy for editing
    const [localQuestions, setLocalQuestions] = useState(() => JSON.parse(JSON.stringify(questions)));
    const [hasChanges, setHasChanges] = useState(false);

    // Sync when industry changes
    useEffect(() => {
        setLocalQuestions(JSON.parse(JSON.stringify(questions)));
        setHasChanges(false);
    }, [currentIndustryId, questions]);

    // Warn on unsaved changes (Browser Close/Refresh)
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (hasChanges) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [hasChanges]);

    // Block navigation if has changes
    const blocker = useBlocker(
        ({ currentLocation, nextLocation }) =>
            hasChanges && currentLocation.pathname !== nextLocation.pathname
    );

    const confirmLeave = () => {
        if (blocker.state === "blocked") {
            blocker.proceed();
        }
    };

    const cancelLeave = () => {
        if (blocker.state === "blocked") {
            blocker.reset();
        }
    };

    const saveAndLeave = () => {
        updateQuestions(localQuestions);
        setHasChanges(false);
        alert('Alterações salvas com sucesso!');
        if (blocker.state === "blocked") {
            blocker.proceed();
        }
    };

    const toggleSection = (idx) => {
        setExpandedSection(expandedSection === idx ? null : idx);
    };

    const handleQuestionChange = (sectionIdx, qIdx, field, value) => {
        const newQuestions = [...localQuestions];
        newQuestions[sectionIdx].questions[qIdx][field] = value;
        setLocalQuestions(newQuestions);
        setHasChanges(true);
    };

    const handleOptionChange = (sectionIdx, qIdx, optIdx, value) => {
        const newQuestions = [...localQuestions];
        newQuestions[sectionIdx].questions[qIdx].options[optIdx] = value;
        setLocalQuestions(newQuestions);
        setHasChanges(true);
    };

    const saveChanges = () => {
        updateQuestions(localQuestions);
        setHasChanges(false);
        alert('Alterações salvas com sucesso!');
    };


    const handleAddSection = () => {
        const newSection = {
            id: `section-${Date.now()}`,
            title: 'Nova Área',
            feedback: { low: '', high: '' },
            questions: []
        };
        setLocalQuestions([...localQuestions, newSection]);
        setHasChanges(true);
        setExpandedSection(localQuestions.length); // Auto-expand new section
    };

    const handleAddQuestion = (sectionIdx) => {
        const newQuestions = [...localQuestions];
        const activeCount = newQuestions[sectionIdx].questions.filter(q => !q.disabled).length;

        if (activeCount >= 6) {
            alert('Limite máximo de 6 perguntas ativas atingido. Desative uma pergunta existente para adicionar uma nova.');
            return;
        }

        const newQuestion = {
            id: `q-${Date.now()}`,
            text: 'Nova Pergunta',
            options: ['0', '33', '66', '100'],
            disabled: false
        };
        newQuestions[sectionIdx].questions.push(newQuestion);
        setLocalQuestions(newQuestions);
        setHasChanges(true);
    };

    const handleToggleDisable = (sectionIdx, qIdx) => {
        const newQuestions = [...localQuestions];
        const question = newQuestions[sectionIdx].questions[qIdx];

        // If enabling, check limit
        if (question.disabled) {
            const activeCount = newQuestions[sectionIdx].questions.filter(q => !q.disabled).length;
            if (activeCount >= 6) {
                alert('Limite máximo de 6 perguntas ativas atingido.');
                return;
            }
        }

        question.disabled = !question.disabled;
        setLocalQuestions(newQuestions);
        setHasChanges(true);
    };

    const [questionToDelete, setQuestionToDelete] = useState(null);

    const handleDeleteQuestionClick = (sectionIdx, qIdx) => {
        setQuestionToDelete({ sectionIdx, qIdx });
    };

    const confirmDeleteQuestion = () => {
        if (!questionToDelete) return;
        const { sectionIdx, qIdx } = questionToDelete;
        const newQuestions = [...localQuestions];
        newQuestions[sectionIdx].questions.splice(qIdx, 1);
        setLocalQuestions(newQuestions);
        setHasChanges(true);
        setQuestionToDelete(null);
    };

    const cancelDeleteQuestion = () => {
        setQuestionToDelete(null);
    };

    const [sectionToDelete, setSectionToDelete] = useState(null);

    const deleteSection = (idx) => {
        setSectionToDelete(idx);
    };

    const confirmDeleteSection = () => {
        if (sectionToDelete === null) return;
        const newQuestions = localQuestions.filter((_, i) => i !== sectionToDelete);
        setLocalQuestions(newQuestions);
        setHasChanges(true);
        setExpandedSection(null);
        setSectionToDelete(null);
    };

    const cancelDeleteSection = () => {
        setSectionToDelete(null);
    };

    const handleIndustryChange = (e) => {
        if (hasChanges) {
            if (!confirm('Você tem alterações não salvas. Deseja realmente mudar de ramo? As alterações perdidas.')) {
                return; // Abort switch
            }
        }
        selectIndustryScope(e.target.value);
    };

    const handleClearQuestions = (idx) => {
        if (confirm('Tem certeza que deseja apagar todas as perguntas desta área? A área será mantida, mas ficará vazia.')) {
            const newQuestions = [...localQuestions];
            newQuestions[idx].questions = [];
            setLocalQuestions(newQuestions);
            setHasChanges(true);
        }
    };

    return (
        <div className="animate-fadeIn pb-20">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 sticky top-0 bg-bg-secondary py-4 z-10 backdrop-blur-sm gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Manutenção de Perguntas</h1>
                    <p className="text-text-secondary">Edite, adicione ou remova perguntas e áreas.</p>
                </div>


                <div className="flex flex-wrap gap-4 items-center">
                    {/* Industry Selector */}
                    <div className="relative">
                        <select
                            value={currentIndustryId}
                            onChange={handleIndustryChange}
                            className="appearance-none bg-white border border-border-color rounded-lg pl-4 pr-10 py-3 font-medium text-text-primary outline-none focus:border-primary cursor-pointer hover:border-primary transition-colors shadow-sm"
                        >
                            {industries.map(industry => (
                                <option key={industry.id} value={industry.id}>
                                    {industry.name} {industry.isFixed ? '(Padrão)' : ''}
                                </option>
                            ))}
                        </select>
                        <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
                    </div>

                    <button
                        onClick={handleAddSection}
                        className="flex items-center gap-2 px-4 py-3 rounded-lg bg-white border border-border-color hover:bg-bg-tertiary font-bold text-text-secondary transition-all"
                    >
                        <Plus size={20} />
                        Nova Área
                    </button>
                    <button
                        onClick={saveChanges}
                        disabled={!hasChanges}
                        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all ${hasChanges
                            ? 'bg-primary hover:bg-primary-hover text-text-on-primary shadow-lg'
                            : 'bg-bg-tertiary text-text-secondary cursor-not-allowed'
                            }`}
                    >
                        <Save size={20} />
                        Salvar
                    </button>
                </div>
            </div>

            {/* Empty State */}
            {localQuestions.length === 0 && (
                <div className="text-center py-20 bg-white rounded-xl border border-border-color border-dashed">
                    <p className="text-text-secondary mb-4">Nenhuma área configurada.</p>
                    <button
                        onClick={handleAddSection}
                        className="px-4 py-2 bg-primary text-text-on-primary rounded-lg font-bold"
                    >
                        Criar Primeira Área
                    </button>
                </div>
            )}

            <div className="flex flex-col gap-6">
                {localQuestions.map((section, sIdx) => {
                    const activeQuestionsCount = section.questions.filter(q => !q.disabled).length;
                    const inactiveQuestionsCount = section.questions.length - activeQuestionsCount;

                    return (
                        <div key={section.id} className="bg-white rounded-xl border border-border-color overflow-hidden">
                            <div className="flex justify-between items-center p-6 hover:bg-bg-secondary transition-colors group">
                                <button
                                    onClick={() => toggleSection(sIdx)}
                                    className="flex-1 text-left flex justify-between items-center pr-4"
                                >
                                    <div className="flex items-center gap-4">
                                        <div>
                                            {expandedSection === sIdx ? (
                                                <input
                                                    value={section.title}
                                                    onClick={(e) => e.stopPropagation()}
                                                    onChange={(e) => {
                                                        const newQuestions = [...localQuestions];
                                                        newQuestions[sIdx].title = e.target.value;
                                                        setLocalQuestions(newQuestions);
                                                        setHasChanges(true);
                                                    }}
                                                    className="text-xl font-bold bg-transparent border-b border-dashed border-text-secondary focus:border-primary outline-none"
                                                />
                                            ) : (
                                                <h3 className="text-xl font-bold">{section.title}</h3>
                                            )}
                                        </div>
                                        <div className="flex gap-2 text-xs font-semibold">
                                            <span className="bg-primary/10 text-primary px-2 py-1 rounded">
                                                {activeQuestionsCount} Ativas
                                            </span>
                                            <span className="bg-bg-tertiary text-text-secondary px-2 py-1 rounded">
                                                {inactiveQuestionsCount} Inativas
                                            </span>
                                        </div>
                                    </div>
                                    {expandedSection === sIdx ? <ChevronUp /> : <ChevronDown />}
                                </button>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 relative z-10">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleClearQuestions(sIdx); }}
                                        className="p-2 text-text-secondary hover:text-accent-danger transition-colors"
                                        title="Apagar todas as perguntas desta área"
                                    >
                                        <Eraser size={18} />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); deleteSection(sIdx); }}
                                        className="p-2 text-text-secondary hover:text-accent-danger transition-colors"
                                        title="Excluir Área"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>

                            {expandedSection === sIdx && (
                                <div className="p-6 border-t border-border-color bg-bg-secondary/30">


                                    <div className="flex flex-col gap-8">
                                        {section.questions.map((q, qIdx) => (
                                            <div key={q.id} className={`bg-white p-6 rounded-lg border transition-all ${q.disabled ? 'border-border-color opacity-60 bg-bg-tertiary' : 'border-border-color'}`}>
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="flex gap-2 items-center mb-1">
                                                        <label className="block text-xs font-bold text-text-secondary uppercase">
                                                            Pergunta {qIdx + 1}
                                                        </label>
                                                        {q.disabled && <span className="text-xs font-bold text-accent-danger bg-accent-danger/10 px-2 py-0.5 rounded">DESATIVADA</span>}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => handleToggleDisable(sIdx, qIdx)}
                                                            className={`text-xs font-bold px-2 py-1 rounded transition-colors ${q.disabled ? 'bg-primary text-text-on-primary' : 'bg-bg-tertiary text-text-secondary hover:bg-accent-danger hover:text-white'}`}
                                                        >
                                                            {q.disabled ? 'Ativar' : 'Desativar'}
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteQuestionClick(sIdx, qIdx)}
                                                            className="p-1 text-text-secondary hover:text-accent-danger transition-colors bg-bg-tertiary rounded hover:bg-accent-danger/10"
                                                            title="Excluir Pergunta"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="mb-4">
                                                    <textarea
                                                        value={q.text}
                                                        onChange={(e) => handleQuestionChange(sIdx, qIdx, 'text', e.target.value)}
                                                        className="w-full p-3 rounded-lg border border-border-color focus:ring-2 focus:ring-primary outline-none"
                                                        rows={2}
                                                        disabled={q.disabled && !q.text.includes("Nova Pergunta")} // Allow editing if it's new, otherwise prevent? Actually allow editing always, just visual dimming.
                                                    />
                                                </div>

                                                <div className="space-y-3">
                                                    <label className="block text-xs font-bold text-text-secondary uppercase">
                                                        Opções (Crescente: 0 a 100 pontos)
                                                    </label>
                                                    {q.options.map((opt, optIdx) => (
                                                        <div key={optIdx} className="flex items-center gap-3">
                                                            <span className="text-sm font-mono text-text-secondary w-6">
                                                                {optIdx === 0 ? '0%' : optIdx === 1 ? '33%' : optIdx === 2 ? '66%' : '100%'}
                                                            </span>
                                                            <input
                                                                type="text"
                                                                value={opt}
                                                                onChange={(e) => handleOptionChange(sIdx, qIdx, optIdx, e.target.value)}
                                                                className="flex-1 p-2 rounded border border-border-color focus:ring-2 focus:ring-primary outline-none text-sm"
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}

                                        <button
                                            onClick={() => handleAddQuestion(sIdx)}
                                            className="w-full py-4 border-2 border-dashed border-border-color rounded-lg text-text-secondary font-bold hover:border-primary hover:text-primary transition-colors flex justify-center items-center gap-2"
                                        >
                                            <Plus size={20} />
                                            Adicionar Pergunta
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Delete Confirmation Modal */}
            {questionToDelete && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fadeIn" onClick={cancelDeleteQuestion}>
                    <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="flex flex-col items-center text-center mb-6">
                            <div className="w-16 h-16 bg-accent-danger/10 text-accent-danger rounded-full flex items-center justify-center mb-4">
                                <Trash2 size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-text-primary mb-2">Excluir Pergunta?</h3>
                            <p className="text-text-secondary">
                                Tem certeza que deseja excluir esta pergunta? Esta ação não pode ser desfeita.
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={cancelDeleteQuestion}
                                className="flex-1 py-3 rounded-lg border border-border-color font-bold text-text-secondary hover:bg-bg-tertiary transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmDeleteQuestion}
                                className="flex-1 py-3 rounded-lg bg-accent-danger hover:bg-red-600 text-white font-bold transition-colors"
                            >
                                Sim, Excluir
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Section Confirmation Modal */}
            {sectionToDelete !== null && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fadeIn" onClick={cancelDeleteSection}>
                    <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="flex flex-col items-center text-center mb-6">
                            <div className="w-16 h-16 bg-accent-danger/10 text-accent-danger rounded-full flex items-center justify-center mb-4">
                                <Trash2 size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-text-primary mb-2">Excluir Área?</h3>
                            <p className="text-text-secondary">
                                Tem certeza que deseja excluir esta área e todas as suas perguntas? Esta ação não pode ser desfeita.
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={cancelDeleteSection}
                                className="flex-1 py-3 rounded-lg border border-border-color font-bold text-text-secondary hover:bg-bg-tertiary transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmDeleteSection}
                                className="flex-1 py-3 rounded-lg bg-accent-danger hover:bg-red-600 text-white font-bold transition-colors"
                            >
                                Sim, Excluir
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Unsaved Changes Navigation Modal */}
            {blocker.state === "blocked" && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fadeIn" onClick={cancelLeave}>
                    <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="flex flex-col items-center text-center mb-6">
                            <div className="w-16 h-16 bg-accent-warning/10 text-accent-warning rounded-full flex items-center justify-center mb-4">
                                <Save size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-text-primary mb-2">Alterações não Salvas</h3>
                            <p className="text-text-secondary">
                                Você tem alterações pendentes. Deseja salvá-las antes de sair?
                            </p>
                        </div>

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={saveAndLeave}
                                className="w-full py-3 rounded-lg bg-primary hover:bg-primary-hover text-text-on-primary font-bold transition-colors"
                            >
                                Salvar e Sair
                            </button>
                            <button
                                onClick={confirmLeave}
                                className="w-full py-3 rounded-lg border border-border-color font-bold text-accent-danger hover:bg-bg-tertiary transition-colors"
                            >
                                Sair sem Salvar
                            </button>
                            <button
                                onClick={cancelLeave}
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

export default QuestionMaintenance;

```

## File: src/pages/Diagnosis.jsx
```
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDiagnosis } from '../context/DiagnosisContext';
import { questionsData } from '../data/questions';
import { ChevronRight, ChevronLeft, Send, User } from 'lucide-react';

const Diagnosis = () => {
    const {
        currentSectionIndex,
        setCurrentSectionIndex,
        userInfo,
        updateUserInfo,
        answers,
        saveAnswer,
        nextSection,
        prevSection,
        questions,
        industries,
        selectIndustryScope
    } = useDiagnosis();

    const navigate = useNavigate();
    const [localStep, setLocalStep] = useState(0); // 0 = User Info, 1 = Questions

    // Refs for auto-scroll
    const questionRefs = useRef([]);
    const footerRef = useRef(null);

    // We need to derive active questions from the DYNAMIC questions logic
    // Let's filter here first.
    const activeQuestionsData = questions.map(section => ({
        ...section,
        questions: section.questions.filter(q => !q.disabled)
    })).filter(section => section.questions.length > 0);

    const currentSection = activeQuestionsData[currentSectionIndex];

    // Progress calculation
    const totalSections = activeQuestionsData.length;
    // If we are in "User Info" (localStep 0), progress is 0%.
    // If we are answering questions, progress is based on sections completed.
    const progress = localStep === 0 ? 0 : ((currentSectionIndex / totalSections) * 100);

    const handleAnswer = (questionId, optionIndex, index) => {
        saveAnswer(questionId, optionIndex);

        // Auto-scroll to next question
        setTimeout(() => {
            if (index < currentSection.questions.length - 1) {
                questionRefs.current[index + 1]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
                footerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 300);
    };

    const handleUserSubmit = (e) => {
        e.preventDefault();
        if (userInfo.nome && userInfo.email && userInfo.empresa && userInfo.cargo && userInfo.ramoAtividade) {
            // Find the selected industry ID
            const selectedIndustry = industries.find(i => i.name === userInfo.ramoAtividade);
            if (selectedIndustry) {
                selectIndustryScope(selectedIndustry.id);
            }
            setLocalStep(1); // Move to questions
        }
    };

    const isSectionComplete = () => {
        if (!currentSection) return false;
        return currentSection.questions.every(q => answers[q.id] !== undefined);
    };

    const handleNext = () => {
        if (currentSectionIndex < totalSections - 1) {
            nextSection();
            window.scrollTo(0, 0);
        } else {
            navigate('/resultados');
        }
    };

    // Calculate total steps for display if needed
    const allQuestions = activeQuestionsData.flatMap(section =>
        section.questions.map(q => ({ ...q, section: section.title, sectionId: section.id }))
    );
    const totalSteps = allQuestions.length + 1;

    if (localStep === 0) {
        return (

            <div className="max-w-6xl mx-auto mt-10 px-4">
                <form onSubmit={handleUserSubmit}>
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Left Column: Identificação Card */}
                        <div className="bg-bg-secondary p-8 rounded-xl border border-border-color shadow-lg">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-primary/20 rounded-lg text-primary">
                                    <User size={24} />
                                </div>
                                <h2 className="text-2xl font-bold">Identificação</h2>
                            </div>
                            <p className="text-text-secondary mb-8">
                                Dados do responsável e da empresa.
                            </p>

                            <div className="flex flex-col gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Nome Completo <span className="text-accent-danger ml-1">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-bg-primary border border-border-color rounded-lg p-3 focus:ring-2 focus:ring-primary outline-none transition-all"
                                        value={userInfo.nome}
                                        onChange={e => updateUserInfo('nome', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        E-mail Corporativo <span className="text-accent-danger ml-1">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        className="w-full bg-bg-primary border border-border-color rounded-lg p-3 focus:ring-2 focus:ring-primary outline-none transition-all"
                                        value={userInfo.email}
                                        onChange={e => updateUserInfo('email', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Empresa <span className="text-accent-danger ml-1">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-bg-primary border border-border-color rounded-lg p-3 focus:ring-2 focus:ring-primary outline-none transition-all"
                                        value={userInfo.empresa}
                                        onChange={e => updateUserInfo('empresa', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Cargo <span className="text-accent-danger ml-1">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-bg-primary border border-border-color rounded-lg p-3 focus:ring-2 focus:ring-primary outline-none transition-all"
                                        value={userInfo.cargo}
                                        onChange={e => updateUserInfo('cargo', e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Ramo de Atividade <span className="text-accent-danger ml-1">*</span>
                                    </label>
                                    <select
                                        required
                                        className="w-full bg-bg-primary border border-border-color rounded-lg p-3 focus:ring-2 focus:ring-primary outline-none transition-all text-text-primary"
                                        value={userInfo.ramoAtividade || ''}
                                        onChange={e => updateUserInfo('ramoAtividade', e.target.value)}
                                    >
                                        <option value="">Selecione</option>
                                        {industries.filter(i => i.active).map(industry => (
                                            <option key={industry.id} value={industry.name}>
                                                {industry.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">ETN</label>
                                    <input
                                        type="text"
                                        className="w-full bg-bg-primary border border-border-color rounded-lg p-3 focus:ring-2 focus:ring-primary outline-none transition-all"
                                        value={userInfo.etn || ''}
                                        onChange={e => updateUserInfo('etn', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Vendedor</label>
                                    <input
                                        type="text"
                                        className="w-full bg-bg-primary border border-border-color rounded-lg p-3 focus:ring-2 focus:ring-primary outline-none transition-all"
                                        value={userInfo.vendedor || ''}
                                        onChange={e => updateUserInfo('vendedor', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Características Card */}
                        <div className="bg-bg-secondary p-8 rounded-xl border border-border-color shadow-lg">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-accent-info/20 rounded-lg text-accent-info">
                                    <ChevronRight size={24} />
                                </div>
                                <h2 className="text-2xl font-bold">Características</h2>
                            </div>
                            <p className="text-text-secondary mb-8">
                                Informações adicionais para segmentação.
                            </p>

                            <div className="flex flex-col gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Quanto tempo faz orçamento?</label>
                                    <select
                                        className="w-full bg-bg-primary border border-border-color rounded-lg p-3 focus:ring-2 focus:ring-primary outline-none transition-all text-text-primary"
                                        value={userInfo.tempoOrcamento || ''}
                                        onChange={e => updateUserInfo('tempoOrcamento', e.target.value)}
                                    >
                                        <option value="">Selecione</option>
                                        <option value="Não faz orçamento">Não faz orçamento</option>
                                        <option value="1 Ano">1 Ano</option>
                                        <option value="2 Anos">2 Anos</option>
                                        <option value="3 Anos">3 Anos</option>
                                        <option value="4 Anos ou mais">4 Anos ou mais</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Quantas pessoas participam do processo?</label>
                                    <select
                                        className="w-full bg-bg-primary border border-border-color rounded-lg p-3 focus:ring-2 focus:ring-primary outline-none transition-all text-text-primary"
                                        value={userInfo.pessoasProcesso || ''}
                                        onChange={e => updateUserInfo('pessoasProcesso', e.target.value)}
                                    >
                                        <option value="">Selecione</option>
                                        <option value="Não + 3">Não + 3</option>
                                        <option value="Entre 4 e 9">Entre 4 e 9</option>
                                        <option value="Entre 10 e 19">Entre 10 e 19</option>
                                        <option value="Entre 20 e 29">Entre 20 e 29</option>
                                        <option value="Entre 30 e 49">Entre 30 e 49</option>
                                        <option value="Entre 50 e 99">Entre 50 e 99</option>
                                        <option value="+ 100">+ 100</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Faturamento</label>
                                    <select
                                        className="w-full bg-bg-primary border border-border-color rounded-lg p-3 focus:ring-2 focus:ring-primary outline-none transition-all text-text-primary"
                                        value={userInfo.faturamento || ''}
                                        onChange={e => updateUserInfo('faturamento', e.target.value)}
                                    >
                                        <option value="">Selecione</option>
                                        <option value="ate 100">ate 100</option>
                                        <option value="100 - 299">100 - 299</option>
                                        <option value="300 - 599">300 - 599</option>
                                        <option value="600 - 3Bi">600 - 3Bi</option>
                                        <option value="4Bi +">4Bi +</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Faixa Colaboradores</label>
                                    <select
                                        className="w-full bg-bg-primary border border-border-color rounded-lg p-3 focus:ring-2 focus:ring-primary outline-none transition-all text-text-primary"
                                        value={userInfo.faixaColaboradores || ''}
                                        onChange={e => updateUserInfo('faixaColaboradores', e.target.value)}
                                    >
                                        <option value="">Selecione</option>
                                        <option value="Até 49">Até 49</option>
                                        <option value="50 - 99">50 - 99</option>
                                        <option value="100 - 249">100 - 249</option>
                                        <option value="250 - 499">250 - 499</option>
                                        <option value="500 - 999">500 - 999</option>
                                        <option value="1000 - 1999">1000 - 1999</option>
                                        <option value="2000 - 4999">2000 - 4999</option>
                                        <option value="5000 - 9999">5000 - 9999</option>
                                        <option value="10000 - 29999">10000 - 29999</option>
                                        <option value="30000+">30000+</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">ERP</label>
                                    <select
                                        className="w-full bg-bg-primary border border-border-color rounded-lg p-3 focus:ring-2 focus:ring-primary outline-none transition-all text-text-primary"
                                        value={userInfo.erp || ''}
                                        onChange={e => updateUserInfo('erp', e.target.value)}
                                    >
                                        <option value="">Selecione</option>
                                        <option value="Todos">Todos</option>
                                        <option value="SAP S4Hanna">SAP S4Hanna</option>
                                        <option value="Oracle">Oracle</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex justify-center">
                        <button
                            type="submit"
                            className="bg-primary hover:bg-primary-hover text-white py-4 px-12 rounded-lg font-bold text-lg transition-colors shadow-lg shadow-primary/20 w-full md:w-auto min-w-[300px]"
                        >
                            Começar Diagnóstico
                        </button>
                    </div>
                </form>
            </div>
        );
    }




    return (
        <div className="max-w-3xl mx-auto flex flex-col gap-8">
            {/* Header / Progress */}
            <div>
                <div className="flex justify-between items-end mb-2">
                    <h2 className="text-2xl font-bold">Seção {currentSectionIndex + 1}: {currentSection?.title}</h2>
                    <span className="text-sm text-text-secondary">
                        {Math.round(((currentSectionIndex) / totalSections) * 100)}% concluído
                    </span>
                </div>
                <div className="w-full h-2 bg-bg-tertiary rounded-full overflow-hidden">
                    <div
                        className="h-full bg-primary transition-all duration-500 ease-out"
                        style={{ width: `${((currentSectionIndex) / totalSections) * 100}%` }}
                    />
                </div>
            </div>

            {/* Questions List */}
            <div className="flex flex-col gap-8">
                {currentSection?.questions.map((q, idx) => (
                    <div
                        key={q.id}
                        ref={el => questionRefs.current[idx] = el}
                        className="bg-bg-secondary p-6 rounded-xl border border-border-color animate-fadeIn"
                        style={{ animationDelay: `${idx * 100}ms` }}
                    >
                        <h3 className="text-lg font-semibold mb-4 flex gap-3">
                            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-bg-tertiary flex items-center justify-center text-sm font-bold text-text-secondary">
                                {idx + 1}
                            </span>
                            {q.text}
                        </h3>

                        <div className="grid md:grid-cols-2 gap-3 pl-11">
                            {q.options.map((option, optIdx) => {
                                const isSelected = answers[q.id] === optIdx;

                                return (
                                    <button
                                        key={optIdx}
                                        onClick={() => handleAnswer(q.id, optIdx, idx)}
                                        className={`text-left p-4 rounded-lg border transition-all ${isSelected
                                            ? 'border-primary bg-primary/10 text-primary'
                                            : 'border-border-color hover:border-text-secondary hover:bg-bg-tertiary'
                                            }`}
                                    >
                                        {option}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* Navigation Footer */}
            <div ref={footerRef} className="flex justify-between pt-8 border-t border-border-color">
                <button
                    onClick={prevSection}
                    disabled={currentSectionIndex === 0}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${currentSectionIndex === 0
                        ? 'text-text-secondary opacity-50 cursor-not-allowed'
                        : 'text-text-primary hover:bg-bg-secondary'
                        }`}
                >
                    <ChevronLeft size={20} />
                    Anterior
                </button>

                <button
                    onClick={handleNext}
                    disabled={!isSectionComplete()}
                    className={`flex items-center gap-2 px-8 py-3 rounded-lg font-bold transition-all ${isSectionComplete()
                        ? 'bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary/25'
                        : 'bg-bg-tertiary text-text-secondary cursor-not-allowed'
                        }`}
                >
                    {currentSectionIndex === totalSections - 1 ? 'Finalizar e Ver Resultados' : 'Próxima Seção'}
                    {currentSectionIndex === totalSections - 1 ? <Send size={20} /> : <ChevronRight size={20} />}
                </button>
            </div>
        </div>
    );
};

export default Diagnosis;

```

## File: src/pages/History.jsx
```
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

                        <div className="flex gap-4">
                            <button
                                onClick={closeModal}
                                className="flex-1 py-3 rounded-lg border border-border-color font-bold text-text-secondary hover:bg-bg-tertiary transition-colors"
                            >
                                Fechar
                            </button>
                            <button
                                onClick={() => handleViewResult(selectedItem)}
                                className="flex-[2] py-3 rounded-lg bg-primary hover:bg-primary-hover text-text-on-primary font-bold transition-colors flex justify-center items-center gap-2"
                            >
                                Ver Relatório Completo
                                <ChevronRight size={20} />
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

```

## File: src/pages/Landing.jsx
```
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle } from 'lucide-react';

const Landing = () => {
    const navigate = useNavigate();

    const handleStart = () => {
        navigate('/diagnostico');
    };

    return (
        <div className="flex flex-col gap-12 animate-fadeIn">
            {/* Hero Section */}
            <section className="flex flex-col items-center text-center gap-6 py-12 md:py-20">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold border border-primary/20">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                    </span>
                    Diagnóstico Gratuito
                </div>

                <h1 className="text-4xl md:text-6xl font-bold max-w-4xl leading-tight">
                    Descubra o nível de maturidade da gestão <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent-success">orçamentária</span> da sua empresa
                </h1>

                <p className="text-lg md:text-xl text-text-secondary max-w-2xl">
                    Avalie 6 dimensões estratégicas e receba um plano de ação personalizado para evoluir sua controladoria e processos financeiros.
                </p>

                <button
                    onClick={handleStart}
                    className="group mt-6 px-8 py-4 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg shadow-primary/25 flex items-center gap-3"
                >
                    Iniciar Diagnóstico
                    <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                </button>
            </section>

            {/* Features/Methodology Grid */}
            <section className="grid md:grid-cols-3 gap-6">
                {[
                    { title: 'Gerais', desc: 'Processos básicos e cultura orçamentária.' },
                    { title: 'Controladoria & FP&A', desc: 'Ferramentas, DRE, Fluxo de Caixa e Balanço.' },
                    { title: 'Comercial', desc: 'Projeção de vendas, preços e comissões.' },
                    { title: 'Operações', desc: 'Custos, produção, CAPEX e estoques.' },
                    { title: 'Pessoas (RH)', desc: 'Folha, benefícios e contratações.' },
                    { title: 'Resultados Conectados', desc: 'Integração de sistemas e tomadas de decisão.' },
                ].map((item, idx) => (
                    <div key={idx} className="p-6 rounded-xl bg-bg-secondary border border-border-color hover:border-primary/50 transition-colors">
                        <div className="w-10 h-10 rounded-lg bg-bg-tertiary flex items-center justify-center mb-4 text-primary">
                            <CheckCircle size={20} />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                        <p className="text-text-secondary">{item.desc}</p>
                    </div>
                ))}
            </section>
        </div>
    );
};

export default Landing;

```

## File: src/pages/Login.jsx
```
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

```

## File: src/pages/Results.jsx
```
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDiagnosis } from '../context/DiagnosisContext';
import ScoreChart from '../components/ScoreChart';
import { RefreshCcw, Download, FileText } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import logo from '../assets/logo.png';

const Results = () => {
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
            pdf.save(`Diagnostico-Handit-${userInfo.empresa || 'Empresa'}-${dateStr}.pdf`);

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
                        <h1 style="font-size: 24pt; color: #000; margin: 0;">Relatório de Maturidade</h1>
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
                    <title>Relatório de Maturidade</title>
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
            link.download = `Diagnostico-Handit-${userInfo.empresa || 'Empresa'}-${dateStr}.doc`;
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
                            <h1 className="text-3xl font-bold text-text-primary">Relatório de Maturidade</h1>
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
                        {userInfo.faixaColaboradores && (
                            <div>
                                <span className="block text-text-secondary font-medium">Colaboradores</span>
                                <span className="font-bold">{userInfo.faixaColaboradores}</span>
                            </div>
                        )}
                        {userInfo.erp && (
                            <div>
                                <span className="block text-text-secondary font-medium">ERP</span>
                                <span className="font-bold">{userInfo.erp}</span>
                            </div>
                        )}
                        {userInfo.etn && (
                            <div>
                                <span className="block text-text-secondary font-medium">ETN</span>
                                <span className="font-bold">{userInfo.etn}</span>
                            </div>
                        )}
                        {userInfo.vendedor && (
                            <div>
                                <span className="block text-text-secondary font-medium">Vendedor</span>
                                <span className="font-bold">{userInfo.vendedor}</span>
                            </div>
                        )}
                        {userInfo.pessoasProcesso && (
                            <div>
                                <span className="block text-text-secondary font-medium">Pessoas no Processo</span>
                                <span className="font-bold">{userInfo.pessoasProcesso}</span>
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

export default Results;

```

## File: src/data/questions.js
```
export const questionsData = [
    {
        id: 'gerais',
        title: 'Gerais',
        questions: [
            { id: 'q1', text: 'Qual é a percepção geral sobre o processo orçamentário na empresa?', options: ['Caótico e manual', 'Organizado mas desconectado', 'Integrado e fluido', 'Altamente estratégico e automatizado'] },
            { id: 'q2', text: 'Quanto tempo a empresa leva para fechar o ciclo orçamentário?', options: ['Mais de 4 meses', '2 a 4 meses', '1 a 2 meses', 'Menos de 1 mês'] },
            { id: 'q3', text: 'Qual o nível de confiança nos dados orçados?', options: ['Baixo', 'Médio', 'Alto', 'Total'] },
            { id: 'q4', text: 'Com que frequência o orçamento é revisado?', options: ['Nunca', 'Anualmente', 'Semestralmente', 'Mensalmente/Trimestralmente'] },
            { id: 'q5', text: 'Qual a principal ferramenta utilizada?', options: ['Papel/Planilhas manuais', 'Planilhas complexas com macros', 'ERP básico', 'Sistema de gestão orçamentária dedicado (EPM/CPM)'] },
            { id: 'q6', text: 'Como é o envolvimento dos gestores no processo?', options: ['Nenhum', 'Baixo/Forçado', 'Médio/Colaborativo', 'Alto/Donos do número'] },
        ]
    },
    {
        id: 'controladoria',
        title: 'Controladoria FP&A',
        questions: [
            { id: 'c1', text: 'A controladoria atua mais como?', options: ['Compiladora de dados', 'Auditora de números', 'Parceira de negócios', 'Estratega do negócio'] },
            { id: 'c2', text: 'Como é feito o DRE Orçado?', options: ['Não é feito', 'Manual em Excel', 'Parcialmente automatizado', 'Totalmente integrado ao realizado'] },
            { id: 'c3', text: 'Existe projeção de Fluxo de Caixa indireto?', options: ['Não', 'Sim, manual', 'Sim, automatizado', 'Sim, com cenários em tempo real'] },
            { id: 'c4', text: 'O Balanço Patrimonial é projetado?', options: ['Não', 'Raramente', 'Sim, mas desconectado', 'Sim, integrado ao DRE e Caixa'] },
            { id: 'c5', text: 'Qual o nível de detalhe das despesas?', options: ['Conta contábil apenas', 'Centro de Custo', 'Centro de Custo + Projeto/Atividade', 'Multidimensional (CC, Projeto, Produto, etc)'] },
            { id: 'c6', text: 'Como são tratados os rateios de despesas?', options: ['Não existem', 'Base fixa/manual', 'Drivers simples', 'Drivers dinâmicos e múltiplos estágios'] },
        ]
    },
    {
        id: 'comercial',
        title: 'Comercial',
        questions: [
            { id: 'v1', text: 'Como é feita a projeção de vendas?', options: ['Meta Top-Down apenas', 'Baseada em histórico', 'Colaborativa (Bottom-up)', 'Preditiva com drivers de mercado'] },
            { id: 'v2', text: 'Existe orçamento de volume x preço?', options: ['Não, apenas valor total', 'Em alguns produtos', 'Sim, para principais linhas', 'Sim, para todo o mix'] },
            { id: 'v3', text: 'O orçamento de deduções de vendas é detalhado?', options: ['Percentual fixo sobre Venda Bruta', 'Por canal/produto (médio)', 'Cálculo imposto a imposto', 'Detalhado por cliente/SKU e tributo'] },
            { id: 'v4', text: 'Existe simulação de cenários de vendas?', options: ['Não', 'Apenas otimista/pessimista', 'Simulações manuais', 'Simulações dinâmicas (what-if)'] },
            { id: 'v5', text: 'A equipe comercial tem acesso fácil às suas metas e real?', options: ['Não', 'Recebem relatórios estáticos', 'Acesso limitado', 'Dashboard online em tempo real'] },
            { id: 'v6', text: 'Existe cálculo de comissões no orçamento?', options: ['Não', 'Estimativa global', 'Por vendedor', 'Regra detalhada por SKU/Canal'] },
        ]
    },
    {
        id: 'operacoes',
        title: 'Operações',
        questions: [
            { id: 'o1', text: 'Como é o orçamento de produção/serviços?', options: ['Baseado em histórico financeiro', 'Baseado em volume de vendas', 'BOM (Ficha Técnica) explodida', 'BOM + Capacidade instalada (MRP)'] },
            { id: 'o2', text: 'Os custos variáveis são calculados como?', options: ['% da Receita', 'Custo médio histórico', 'Custo padrão', 'Custo padrão com revisão periódica'] },
            { id: 'o3', text: 'Existe orçamento de investimentos (CAPEX)?', options: ['Não', 'Lista de desejos', 'Projetos aprovados', 'Gestão de portfólio de projetos com ROI'] },
            { id: 'o4', text: 'Como é projetado o headcount operacional?', options: ['Manual/Global', 'Por setor', 'Baseado em drivers de volume', 'Otimizado por turno/capacidade'] },
            { id: 'o5', text: 'Existe controle de estoques projetado?', options: ['Não', 'Giro médio global', 'Giro por categoria', 'Giro por SKU e política de cobertura'] },
            { id: 'o6', text: 'A manutenção é orçada?', options: ['Não', 'Valor fixo mensal', 'Base zero', 'Preventiva/Corretiva baseada em ativos'] },
        ]
    },
    {
        id: 'pessoas',
        title: 'Pessoas (RH)',
        questions: [
            { id: 'r1', text: 'Como é feito o orçamento de folha?', options: ['Linha única de custo', 'Por centro de custo', 'Por cargo/salário médio', 'Matricial (colaborador a colaborador)'] },
            { id: 'r2', text: 'Os encargos e benefícios são calculados como?', options: ['Flat (% sobre salário)', 'Por sindicato', 'Regra detalhada por verba', 'Cálculo exato por benefício/perfil'] },
            { id: 'r3', text: 'Existe planejamento de contratações?', options: ['Não', 'Valor global', 'Vagas aprovadas', 'Cronograma físico-financeiro de vagas'] },
            { id: 'r4', text: 'Como são projetados os aumentos/dissídios?', options: ['Não são', 'Percentual global', 'Por sindicato/mês base', 'Por mérito individual + dissídio'] },
            { id: 'r5', text: 'O orçamento de treinamento é detalhado?', options: ['Não', 'Verba global', 'Por área', 'Por colaborador/curso'] },
            { id: 'r6', text: 'O RH participa ativamente da validação?', options: ['Não', 'Apenas recebe os números', 'Valida headcount', 'Valida toda a despesa de pessoal'] },
        ]
    },
    {
        id: 'conectados',
        title: 'Resultados Conectados',
        questions: [
            { id: 'x1', text: 'Os sistemas (Vendas, RH, Produção) conversam com o Orçamento?', options: ['Não, tudo manual', 'Algumas importações', 'Integração via banco de dados', 'Integração nativa/API em tempo real'] },
            { id: 'x2', text: 'Quanto tempo leva para gerar um relatório de realizado x orçado?', options: ['Dias/Semanas', '1 a 2 dias', 'Algumas horas', 'Imediato (Real-time)'] },
            { id: 'x3', text: 'A empresa utiliza Dashboards de gestão?', options: ['Não, apenas planilhas', 'Sim, estáticos (PPT)', 'Sim, BI (PowerBI/Tableau)', 'Sim, integrados à ferramenta de planejamento'] },
            { id: 'x4', text: 'É fácil fazer análises de "root-cause" (clicar e detalhar)?', options: ['Não é possível', 'Difícil (precisa abrir várias fontes)', 'Razoável', 'Sim, Drill-down completo'] },
            { id: 'x5', text: 'A tomada de decisão é baseada em dados?', options: ['Não, feeling', 'Às vezes', 'Maioria das vezes', 'Sempre (Data Driven)'] },
            { id: 'x6', text: 'Qual a satisfação com a tecnologia atual?', options: ['Insatisfeito', 'Neutro', 'Satisfeito', 'Muito Satisfeito'] },
        ]
    }
];

```

## File: src/index.css
```
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  /* Color Palette - Handit Rebrand (Light Mode Base) */
  --bg-primary: #ffffff;
  /* White */
  --bg-secondary: #f8fafc;
  /* Slate 50 (Very light gray for cards) */
  --bg-tertiary: #e2e8f0;
  /* Slate 200 (Borders/Dividers) */

  --text-primary: #0f172a;
  /* Slate 900 (Black-ish) */
  --text-secondary: #64748b;
  /* Slate 500 */

  --primary: #00F2A9;
  /* Handit Teal */
  --primary-hover: #00d695;
  /* Slightly darker teal */

  /* Text on primary color should be dark */
  --text-on-primary: #0f172a;

  --accent-success: #10b981;
  --accent-warning: #f59e0b;
  --accent-danger: #ef4444;

  --border-color: #e2e8f0;

  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;

  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
  /* Muli fallback */
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: var(--font-sans);
  background-color: var(--bg-primary);
  color: var(--text-primary);
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}

h1,
h2,
h3,
h4,
h5,
h6 {
  color: var(--text-primary);
  font-weight: 700;
  /* Bolder headings like Handit */
}

a {
  color: var(--text-primary);
  /* Links are usually dark unless buttons */
  text-decoration: none;
}

button {
  cursor: pointer;
  font-family: inherit;
}

/* Scrollbar styling */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: var(--bg-primary);
}

::-webkit-scrollbar-thumb {
  background: var(--bg-tertiary);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
```

## File: README.md
```
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

```
