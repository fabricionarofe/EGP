import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../AuthContext';

export function Login() {
  const [modo, setModo] = useState<'login' | 'cadastro_aluno' | 'cadastro_instrutor'>('login');
  
  // Estados de formulário
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  
  // Novos campos Aluno
  const [matricula, setMatricula] = useState('');
  const [cpf, setCpf] = useState('');
  const [lotacao, setLotacao] = useState('');
  
  // Novos campos Instrutor
  const [especialidade, setEspecialidade] = useState('');
  const [areaFormacao, setAreaFormacao] = useState('');

  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [carregando, setCarregando] = useState(false);
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setSucesso('');
    setCarregando(true);

    try {
      if (modo === 'login') {
        const response = await api.post('/auth/login', { email, senha });
        const { token, usuario } = response.data;

        if (token) {
          localStorage.setItem('@LMS:token', token);
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }

        const userData = usuario || { id: '1', nome: 'Usuário Logado', email: email };
        signIn(userData);

        navigate('/dashboard');
      } else {
        const perfil = modo === 'cadastro_aluno' ? 'ALUNO' : 'INSTRUTOR';
        await api.post('/auth/register', { 
          nome, 
          email, 
          senha, 
          perfil,
          matricula: modo === 'cadastro_aluno' ? matricula : undefined,
          cpf, // CPF agora é enviado para ambos (Aluno e Instrutor)
          lotacao: modo === 'cadastro_aluno' ? lotacao : undefined,
          especialidade: modo === 'cadastro_instrutor' ? especialidade : undefined,
          areaFormacao: modo === 'cadastro_instrutor' ? areaFormacao : undefined
        });
        
        setSucesso('Cadastro realizado com sucesso! Faça login para entrar.');
        setModo('login');
        setNome(''); setSenha(''); setMatricula(''); setCpf(''); setLotacao(''); setEspecialidade(''); setAreaFormacao('');
      }
    } catch (error: any) {
      setErro(error.response?.data?.error || 'Erro na operação. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  const handleRecuperarSenha = () => {
    alert("Função de recuperar senha será enviada para o seu e-mail.");
  };

  const tabStyle = (isActive: boolean) => ({
    flex: 1, padding: '0.6rem 0.4rem', border: 'none', background: 'transparent',
    borderBottom: isActive ? '2px solid var(--cor-primaria)' : '2px solid var(--cor-borda)',
    color: isActive ? 'var(--cor-primaria)' : 'var(--cor-texto)', fontWeight: isActive ? '600' : '400',
    cursor: 'pointer', fontSize: '0.85rem', transition: 'all 0.2s'
  });

  const inputStyle = {
    width: '100%', padding: '0.6rem', border: '1px solid var(--cor-borda)', 
    borderRadius: '6px', boxSizing: 'border-box' as const, fontFamily: 'var(--fonte-principal)', fontSize: '0.9rem'
  };

  const labelStyle = {
    display: 'block', marginBottom: '0.3rem', color: 'var(--cor-texto)', fontWeight: '500', fontSize: '0.85rem'
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: 'var(--cor-fundo-cinza)', padding: '20px' }}>
      <form onSubmit={handleSubmit} style={{ backgroundColor: 'var(--cor-branco)', padding: '2.5rem', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', width: '100%', maxWidth: '450px', border: '1px solid var(--cor-borda)' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ margin: 0, color: 'var(--cor-primaria)', fontSize: '1.8rem', fontFamily: 'var(--fonte-titulos)' }}>
            EGP
          </h2>
          <span style={{ color: 'var(--cor-accent)', fontFamily: 'var(--fonte-principal)', fontWeight: '600', fontSize: '1.1rem', display: 'block', marginTop: '4px' }}>Escola de Gestão Pública</span>
        </div>
        
        <div style={{ display: 'flex', marginBottom: '1.5rem' }}>
          <button type="button" onClick={() => { setModo('login'); setErro(''); setSucesso(''); }} style={tabStyle(modo === 'login')}>Entrar</button>
          <button type="button" onClick={() => { setModo('cadastro_aluno'); setErro(''); setSucesso(''); }} style={tabStyle(modo === 'cadastro_aluno')}>Novo Aluno</button>
          <button type="button" onClick={() => { setModo('cadastro_instrutor'); setErro(''); setSucesso(''); }} style={tabStyle(modo === 'cadastro_instrutor')}>Novo Instrutor</button>
        </div>

        {erro && <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '0.6rem', borderRadius: '4px', marginBottom: '1rem', textAlign: 'center', fontSize: '0.85rem' }}>{erro}</div>}
        {sucesso && <div style={{ backgroundColor: '#dcfce7', color: '#15803d', padding: '0.6rem', borderRadius: '4px', marginBottom: '1rem', textAlign: 'center', fontSize: '0.85rem' }}>{sucesso}</div>}
        
        {modo !== 'login' && (
          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Nome Completo</label>
            <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} required style={inputStyle} />
          </div>
        )}

        {/* Campos Específicos para Aluno */}
        {modo === 'cadastro_aluno' && (
          <>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Matrícula</label>
                <input type="text" value={matricula} onChange={(e) => setMatricula(e.target.value)} required style={inputStyle} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>CPF</label>
                <input type="text" value={cpf} onChange={(e) => setCpf(e.target.value)} required style={inputStyle} />
              </div>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={labelStyle}>Lotação</label>
              <input type="text" value={lotacao} onChange={(e) => setLotacao(e.target.value)} required style={inputStyle} />
            </div>
          </>
        )}

        {/* Campos Específicos para Instrutor */}
        {modo === 'cadastro_instrutor' && (
          <>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>CPF</label>
                <input type="text" value={cpf} onChange={(e) => setCpf(e.target.value)} required style={inputStyle} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Área de Formação</label>
                <input type="text" value={areaFormacao} onChange={(e) => setAreaFormacao(e.target.value)} required placeholder="Ex: Direito..." style={inputStyle} />
              </div>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={labelStyle}>Especialidade Temática</label>
              <select value={especialidade} onChange={(e) => setEspecialidade(e.target.value)} required style={{...inputStyle, backgroundColor: '#fff'}}>
                <option value="" disabled>Selecione uma especialidade</option>
                <option value="Direito Público">Direito Público</option>
                <option value="Gestão Pública">Gestão Pública</option>
                <option value="Licitações e Contratos">Licitações e Contratos</option>
                <option value="Recursos Humanos">Recursos Humanos</option>
                <option value="Tecnologia da Informação">Tecnologia da Informação</option>
                <option value="Orçamento e Finanças">Orçamento e Finanças</option>
                <option value="Outro">Outro</option>
              </select>
            </div>
          </>
        )}

        <div style={{ marginBottom: '1rem' }}>
          <label style={labelStyle}>E-mail</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} />
        </div>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={labelStyle}>Senha</label>
          <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} required style={inputStyle} />
        </div>
        
        <button type="submit" disabled={carregando} className="btn" style={{ width: '100%', padding: '12px', cursor: carregando ? 'not-allowed' : 'pointer', fontSize: '1rem', backgroundColor: 'var(--cor-primaria)' }}>
          {carregando ? 'Aguarde...' : modo === 'login' ? 'ENTRAR NO SISTEMA' : 'REALIZAR CADASTRO'}
        </button>

        {modo === 'login' && (
          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <button type="button" onClick={handleRecuperarSenha} style={{ background: 'none', border: 'none', color: 'var(--cor-accent)', fontSize: '0.85rem', cursor: 'pointer', textDecoration: 'underline' }}>
              Esqueceu a senha? Recuperar senha
            </button>
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--cor-borda)' }}>
          <div style={{ display: 'inline-block', backgroundColor: 'var(--cor-primaria)', padding: '12px 24px', borderRadius: '8px' }}>
            <img src="/logo_prefeitura_negativa.png" alt="Logo Prefeitura" style={{ maxWidth: '120px', display: 'block' }} />
          </div>
        </div>

      </form>
    </div>
  );
}