import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { AuthProvider } from './AuthContext';
import { ProtectedRoute } from './ProtectedRoute';
import { CursoDetalhes } from './pages/CursoDetalhes';
import { Layout } from './components/Layout';
import { SalaAula } from './pages/SalaAula';

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/curso/:id" 
            element={
              <ProtectedRoute>
                <Layout>
                  <CursoDetalhes />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/curso/:id/sala" 
            element={
              <ProtectedRoute>
                <Layout>
                  <SalaAula />
                </Layout>
              </ProtectedRoute>
            } 
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}