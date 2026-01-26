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
import ScoringMaintenance from './pages/Admin/ScoringMaintenance';
import ImportMaintenance from './pages/Admin/ImportMaintenance';
import ETNReport from './pages/ETNReport';

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: "/", element: <Landing /> },
      { path: "/diagnostico", element: <Diagnosis /> },
      { path: "/historico", element: <History /> }, // Public history or redirect? keeping as is
      { path: "/resultados", element: <Results /> },
      { path: "/relatorio-etn", element: <ETNReport /> },
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
      { path: "pontuacao", element: <ScoringMaintenance /> },
      { path: "importacao", element: <ImportMaintenance /> },
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
