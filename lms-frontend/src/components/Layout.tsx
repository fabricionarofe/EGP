import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { api } from '../services/api';

export function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await api.post('/auth/logout').catch(() => {}); // Chama a rota de logout (ignora erro se houver)
    signOut(); // Limpa o estado local
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* BARRA DE NAVEGAÇÃO */}
      <nav className="navbar">
        <Link to="/dashboard" className="navbar-logo" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src="/logo_prefeitura_negativa.png" alt="Logo Prefeitura" style={{ height: '40px' }} />
          <span>EGP - Escola de Gestão Pública</span>
        </Link>
        <ul className="navbar-menu" style={{ alignItems: 'center' }}>
          <li><a href="#" onClick={handleLogout} style={{ color: '#FFFFFF', fontWeight: 'bold' }}>Sair</a></li>
        </ul>
      </nav>

      {/* CONTEÚDO PRINCIPAL */}
      <main style={{ padding: '32px 24px', maxWidth: '1000px', margin: '0 auto', flex: 1, width: '100%' }}>
        {children}
      </main>

      {/* RODAPÉ */}
      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} - Escola de Gestão Pública. Elaborado pela SEGEP e mantido pela Belém Digital.</p>
      </footer>
    </div>
  );
}
