import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';

// Um componente genérico de Dashboard apenas como "placeholder" (espaço reservado)
const DashboardAluno = () => (
  <div style={{ padding: '2rem', textAlign: 'center' }}>
    <h1>Área do Aluno</h1>
    <p>Bem-vindo! Você está autenticado de forma segura.</p>
  </div>
);

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<DashboardAluno />} />
      </Routes>
    </Router>
  );
}