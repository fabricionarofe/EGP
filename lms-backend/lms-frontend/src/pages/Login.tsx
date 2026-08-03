import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../AuthContext';

export function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setCarregando(true);

    try {
      // Chama a rota documentada no Swagger
      const response = await api.post('/auth/login', { email, senha });
      
      // Pegamos os dados de forma segura (usando o símbolo '?' para evitar erros de undefined)
      const userData = response.data?.usuario || response.data?.aluno || {
        id: '1',
        nome: 'Usuário Logado',
        email: email
      };

      // Avisa nossa aplicação que o login foi feito com sucesso
      signIn(userData);
      
      // Se deu sucesso, o cookie HttpOnly já foi salvo no navegador automaticamente.
      // Redirecionamos para a área do aluno
      navigate('/dashboard');
    } catch (error: any) {
      // Trata a mensagem de erro que vem do nosso Global Error Handler do Back-end
      setErro(error.response?.data?.mensagem || 'Erro ao realizar login. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f3f4f6' }}>
      <form onSubmit={handleLogin} style={{ backgroundColor: '#fff', padding: '2rem', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#333' }}>Escola de Governo - LMS</h2>
        
        {erro && <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem', textAlign: 'center' }}>{erro}</div>}
        
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#555' }}>E-mail</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            style={{ width: '100%', padding: '0.75rem', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }}
          />
        </div>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#555' }}>Senha</label>
          <input 
            type="password" 
            value={senha} 
            onChange={(e) => setSenha(e.target.value)} 
            required 
            style={{ width: '100%', padding: '0.75rem', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }}
          />
        </div>
        
        <button type="submit" disabled={carregando} style={{ width: '100%', padding: '0.75rem', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', cursor: carregando ? 'not-allowed' : 'pointer', fontSize: '1rem' }}>
          {carregando ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}