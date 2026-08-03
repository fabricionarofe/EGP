import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../AuthContext';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';

export function Dashboard() {
  const { user, signIn } = useAuth();
  const navigate = useNavigate();
  const [abaAtiva, setAbaAtiva] = useState('dashboard');
  const [cursos, setCursos] = useState<any[]>([]);
  const [meusCursos, setMeusCursos] = useState<any[]>([]);
  const [cursosInstrutor, setCursosInstrutor] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [carregandoMeus, setCarregandoMeus] = useState(true);
  const [carregandoInstrutor, setCarregandoInstrutor] = useState(false);
  const [erro, setErro] = useState('');
  const [sincronizandoOracle, setSincronizandoOracle] = useState(false);
  
  // Estado para criar novo curso
  const [mostrandoFormCurso, setMostrandoFormCurso] = useState(false);
  const [novoCurso, setNovoCurso] = useState({ titulo: '', descricao: '', cargaHoraria: '' });
  
  // Ref para o input de arquivo oculto
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    carregarCursos();
    carregarMeusCursos();
    if (user?.perfil === 'INSTRUTOR') {
      carregarCursosInstrutor();
    }
  }, [user]);

  const carregarCursosInstrutor = async () => {
    try {
      setCarregandoInstrutor(true);
      const response = await api.get('/cursos/instrutor/meus-cursos');
      setCursosInstrutor(response.data);
    } catch (err) {
      console.error('Falha ao carregar cursos do instrutor');
    } finally {
      setCarregandoInstrutor(false);
    }
  };

  const criarNovoCurso = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post('/cursos', {
        titulo: novoCurso.titulo,
        descricao: novoCurso.descricao,
        cargaHoraria: novoCurso.cargaHoraria ? parseInt(novoCurso.cargaHoraria) : null
      });
      alert('Curso criado com sucesso!');
      setNovoCurso({ titulo: '', descricao: '', cargaHoraria: '' });
      setMostrandoFormCurso(false);
      carregarCursosInstrutor();
      carregarCursos();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao criar curso');
    }
  };

  const carregarCursos = async () => {
    try {
      setCarregando(true);
      const response = await api.get('/cursos');
      setCursos(response.data);
    } catch (err) {
      setErro('Falha ao carregar cursos.');
    } finally {
      setCarregando(false);
    }
  };

  const carregarMeusCursos = async () => {
    try {
      setCarregandoMeus(true);
      const response = await api.get('/aluno/meus-cursos');
      setMeusCursos(response.data);
    } catch (err) {
      console.error('Falha ao carregar meus cursos');
    } finally {
      setCarregandoMeus(false);
    }
  };

  const handleSyncOracle = async () => {
    if (!window.confirm('Isso iniciará a sincronização em tempo real com o banco de dados Oracle. Pode demorar alguns minutos. Deseja continuar?')) return;
    
    setSincronizandoOracle(true);
    try {
      const response = await api.post('/oracle/sincronizar');
      alert(`Sucesso! ${response.data.message}`);
    } catch (err: any) {
      alert(`Erro na sincronização: ${err.response?.data?.error || err.message}`);
    } finally {
      setSincronizandoOracle(false);
    }
  };

  const handleFotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      try {
        const response = await api.put(`/usuarios/${user?.id}/foto`, { fotoPerfil: base64String });
        // Atualiza o contexto global com a nova foto
        if (response.data.usuario) {
           signIn({ ...user, ...response.data.usuario, fotoPerfil: base64String });
           alert("Foto atualizada com sucesso!");
        }
      } catch (err) {
        alert("Erro ao enviar foto.");
      }
    };
    reader.readAsDataURL(file);
  };

  const tabStyle = (isActive: boolean) => ({
    padding: '8px 16px',
    cursor: 'pointer',
    borderBottom: isActive ? '2px solid var(--cor-destaque)' : '2px solid transparent',
    color: isActive ? 'var(--cor-destaque)' : 'var(--cor-texto)',
    fontWeight: isActive ? '600' : '400',
    fontSize: '0.95rem',
    textDecoration: 'none',
    transition: 'all 0.2s',
    marginBottom: '-1px'
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ margin: 0, fontSize: '2rem' }}>Painel Principal</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '0.9rem', color: '#64748B' }}>Olá, <strong style={{ color: 'var(--cor-primaria)' }}>{user?.nome || 'Usuário'}</strong></span>
          <div style={{ width: '40px', height: '40px', backgroundColor: 'var(--cor-fundo-cinza)', border: '1px solid var(--cor-borda)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', color: 'var(--cor-primaria)', fontSize: '1rem', overflow: 'hidden' }}>
            {user?.fotoPerfil ? (
              <img src={user.fotoPerfil} alt="Perfil" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              user?.nome ? user.nome.charAt(0).toUpperCase() : 'U'
            )}
          </div>
        </div>
      </div>

      {/* Navegação Interna */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--cor-borda)', marginBottom: '32px', gap: '8px', flexWrap: 'wrap' }}>
        <a href="#" onClick={(e) => { e.preventDefault(); setAbaAtiva('dashboard'); }} style={tabStyle(abaAtiva === 'dashboard')}>Cursos Disponíveis</a>
        <a href="#" onClick={(e) => { e.preventDefault(); setAbaAtiva('meus-cursos'); }} style={tabStyle(abaAtiva === 'meus-cursos')}>Meus Cursos</a>
        <a href="#" onClick={(e) => { e.preventDefault(); setAbaAtiva('certificados'); }} style={tabStyle(abaAtiva === 'certificados')}>Certificados</a>
        <a href="#" onClick={(e) => { e.preventDefault(); setAbaAtiva('perfil'); }} style={tabStyle(abaAtiva === 'perfil')}>Meu Perfil</a>
        
        {user?.perfil === 'INSTRUTOR' && (
          <a href="#" onClick={(e) => { e.preventDefault(); setAbaAtiva('gerenciar-cursos'); }} style={tabStyle(abaAtiva === 'gerenciar-cursos')}>Gerenciar Cursos (Instrutor)</a>
        )}
        
        {user?.perfil === 'ADMIN' && (
          <a href="#" onClick={(e) => { e.preventDefault(); setAbaAtiva('admin'); }} style={tabStyle(abaAtiva === 'admin')}>Painel Administrativo</a>
        )}
      </div>

      {/* Conteúdo das Abas */}
      <div>
        {abaAtiva === 'dashboard' && (
          <div>
            <div className="secao-destaque" style={{ backgroundColor: 'var(--cor-secundaria)', color: 'var(--cor-branco)' }}>
              <h2 style={{ color: 'var(--cor-branco)', marginTop: 0 }}>Bem-vindo à Escola de Gestão Pública</h2>
              <p>Este é o seu painel. Abaixo você pode visualizar os cursos disponíveis na plataforma.</p>
            </div>

            <h3 style={{ marginBottom: '20px' }}>Cursos Disponíveis</h3>
            
            {carregando ? (
              <p style={{ color: '#64748B' }}>Carregando cursos...</p>
            ) : erro ? (
              <p style={{ color: '#EF4444' }}>{erro}</p>
            ) : (!cursos || cursos.length === 0) ? (
              <p style={{ color: '#64748B' }}>Nenhum curso cadastrado ainda.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
                {cursos.map(curso => (
                  <div key={curso.id} style={{ backgroundColor: 'var(--cor-branco)', padding: '24px', borderRadius: '12px', border: '1px solid var(--cor-borda)', transition: 'box-shadow 0.2s', display: 'flex', flexDirection: 'column' }}>
                    <h4 style={{ margin: '0 0 12px 0', fontSize: '1.2rem', color: 'var(--cor-primaria)' }}>{curso.titulo}</h4>
                    <p style={{ fontSize: '0.9rem', color: '#64748B', marginBottom: '24px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', flex: 1 }}>{curso.descricao}</p>
                    <button onClick={() => navigate(`/curso/${curso.id}`, { state: { curso } })} className="btn" style={{ width: '100%' }}>
                      Ver Detalhes
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {abaAtiva === 'meus-cursos' && (
          <div>
            <h3 style={{ marginBottom: '20px' }}>Meus Cursos em Andamento</h3>
            {carregandoMeus ? (
              <p style={{ color: '#64748B' }}>Carregando seus cursos...</p>
            ) : (!meusCursos || meusCursos.length === 0) ? (
              <p style={{ color: '#64748B' }}>Você ainda não está matriculado em nenhum curso.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
                {meusCursos.map(curso => (
                  <div key={curso.id} style={{ backgroundColor: 'var(--cor-branco)', padding: '24px', borderRadius: '12px', border: '1px solid var(--cor-borda)', transition: 'box-shadow 0.2s', display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--cor-branco)', backgroundColor: 'var(--cor-secundaria)', padding: '4px 8px', borderRadius: '4px', alignSelf: 'flex-start', marginBottom: '12px' }}>MATRICULADO</span>
                    <h4 style={{ margin: '0 0 12px 0', fontSize: '1.2rem', color: 'var(--cor-primaria)' }}>{curso.titulo}</h4>
                    <p style={{ fontSize: '0.9rem', color: '#64748B', marginBottom: '24px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', flex: 1 }}>{curso.descricao}</p>
                    <button onClick={() => navigate(`/curso/${curso.id}/sala`)} className="btn" style={{ width: '100%', backgroundColor: 'var(--cor-secundaria)' }}>
                      Acessar Sala de Aula
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {abaAtiva === 'certificados' && (
          <div>
            <h3 style={{ marginBottom: '20px' }}>Meus Certificados</h3>
            <p>Você ainda não possui certificados.</p>
          </div>
        )}

        {abaAtiva === 'perfil' && (
          <div>
            <h3 style={{ marginBottom: '24px' }}>Meu Perfil</h3>
            <div style={{ backgroundColor: 'var(--cor-branco)', padding: '32px', borderRadius: '12px', border: '1px solid var(--cor-borda)', display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
              
              {/* Coluna da Foto/Ícone */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '200px' }}>
                <div style={{ width: '120px', height: '120px', backgroundColor: 'var(--cor-fundo-cinza)', border: '2px dashed var(--cor-secundaria)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', color: 'var(--cor-primaria)', fontSize: '3rem', marginBottom: '16px', position: 'relative', overflow: 'hidden' }}>
                  {user?.fotoPerfil ? (
                    <img src={user.fotoPerfil} alt="Perfil" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    user?.nome ? user.nome.charAt(0).toUpperCase() : 'U'
                  )}
                </div>
                
                <input type="file" ref={fileInputRef} onChange={handleFotoChange} style={{ display: 'none' }} accept="image/png, image/jpeg" />
                <button className="btn" onClick={() => fileInputRef.current?.click()} style={{ padding: '8px 16px', fontSize: '0.85rem', backgroundColor: 'var(--cor-secundaria)' }}>Alterar Foto / Ícone</button>
                <p style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '8px', textAlign: 'center' }}>Formatos aceitos: JPG, PNG.</p>
              </div>

              {/* Coluna de Estatísticas e Info */}
              <div style={{ flex: 1 }}>
                <h4 style={{ color: 'var(--cor-primaria)', fontSize: '1.4rem', marginBottom: '8px' }}>{user?.nome || 'Nome do Usuário'}</h4>
                <p style={{ color: '#64748B', marginBottom: '24px' }}>{user?.email || 'email@exemplo.com'} • {user?.perfil || 'ALUNO'}</p>

                <h5 style={{ marginBottom: '16px', color: 'var(--cor-texto)', borderBottom: '1px solid var(--cor-borda)', paddingBottom: '8px' }}>Estatísticas de Aprendizagem</h5>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px' }}>
                  <div style={{ backgroundColor: 'var(--cor-fundo-cinza)', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                    <span style={{ display: 'block', fontSize: '2rem', fontWeight: 'bold', color: 'var(--cor-primaria)' }}>{meusCursos.length}</span>
                    <span style={{ fontSize: '0.85rem', color: '#64748B' }}>Cursos em andamento</span>
                  </div>
                  <div style={{ backgroundColor: 'var(--cor-fundo-cinza)', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                    <span style={{ display: 'block', fontSize: '2rem', fontWeight: 'bold', color: 'var(--cor-destaque)' }}>0</span>
                    <span style={{ fontSize: '0.85rem', color: '#64748B' }}>Cursos realizados</span>
                  </div>
                  <div style={{ backgroundColor: 'var(--cor-fundo-cinza)', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                    <span style={{ display: 'block', fontSize: '2rem', fontWeight: 'bold', color: '#EAB308' }}>0</span>
                    <span style={{ fontSize: '0.85rem', color: '#64748B' }}>Certificados ganhos</span>
                  </div>
                  <div style={{ backgroundColor: 'var(--cor-fundo-cinza)', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                    <span style={{ display: 'block', fontSize: '2rem', fontWeight: 'bold', color: '#8B5CF6' }}>0</span>
                    <span style={{ fontSize: '0.85rem', color: '#64748B' }}>Missões concluídas</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {abaAtiva === 'gerenciar-cursos' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0 }}>Meus Cursos (Painel do Instrutor)</h3>
              <button className="btn" onClick={() => setMostrandoFormCurso(!mostrandoFormCurso)}>
                {mostrandoFormCurso ? 'Cancelar' : 'Criar Novo Curso'}
              </button>
            </div>

            {mostrandoFormCurso && (
              <div style={{ backgroundColor: 'var(--cor-fundo-cinza)', padding: '24px', borderRadius: '12px', border: '1px solid var(--cor-borda)', marginBottom: '24px' }}>
                <h4 style={{ marginTop: 0, marginBottom: '16px', color: 'var(--cor-primaria)' }}>Dados do Novo Curso</h4>
                <form onSubmit={criarNovoCurso} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Título do Curso</label>
                    <input 
                      type="text" 
                      required 
                      value={novoCurso.titulo} 
                      onChange={e => setNovoCurso({...novoCurso, titulo: e.target.value})}
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--cor-borda)' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Carga Horária (horas)</label>
                    <input 
                      type="number" 
                      value={novoCurso.cargaHoraria} 
                      onChange={e => setNovoCurso({...novoCurso, cargaHoraria: e.target.value})}
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--cor-borda)' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Descrição</label>
                    <textarea 
                      required 
                      rows={4}
                      value={novoCurso.descricao} 
                      onChange={e => setNovoCurso({...novoCurso, descricao: e.target.value})}
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--cor-borda)', resize: 'vertical' }}
                    ></textarea>
                  </div>
                  <button type="submit" className="btn" style={{ alignSelf: 'flex-start' }}>Salvar e Criar Curso</button>
                </form>
              </div>
            )}

            {carregandoInstrutor ? (
              <p style={{ color: '#64748B' }}>Carregando seus cursos...</p>
            ) : cursosInstrutor.length === 0 ? (
              <p style={{ color: '#64748B' }}>Você ainda não criou nenhum curso.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
                {cursosInstrutor.map(curso => (
                  <div key={curso.id} style={{ backgroundColor: 'var(--cor-branco)', padding: '24px', borderRadius: '12px', border: '1px solid var(--cor-borda)', transition: 'box-shadow 0.2s', display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--cor-primaria)', backgroundColor: 'var(--cor-fundo-cinza)', padding: '4px 8px', borderRadius: '4px', alignSelf: 'flex-start', marginBottom: '12px' }}>CRIADO POR VOCÊ</span>
                    <h4 style={{ margin: '0 0 12px 0', fontSize: '1.2rem', color: 'var(--cor-primaria)' }}>{curso.titulo}</h4>
                    <p style={{ fontSize: '0.9rem', color: '#64748B', marginBottom: '24px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', flex: 1 }}>{curso.descricao}</p>
                    <button onClick={() => navigate(`/curso/${curso.id}/sala`)} className="btn" style={{ width: '100%', backgroundColor: 'var(--cor-destaque)' }}>
                      Gerenciar Hub
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {abaAtiva === 'admin' && (
          <div>
            <h3 style={{ marginBottom: '20px' }}>Visão Geral Administrativa</h3>
            <p>Lista de alunos matriculados, aprovação de cursos, estatísticas da plataforma.</p>
            
            <div style={{ marginTop: '30px', padding: '24px', backgroundColor: 'var(--cor-branco)', borderRadius: '12px', border: '1px solid var(--cor-borda)' }}>
              <h4 style={{ margin: '0 0 10px 0', color: 'var(--cor-primaria)' }}>Integração Oficial (Prefeitura)</h4>
              <p style={{ fontSize: '0.9rem', color: '#64748B', marginBottom: '20px' }}>
                Importe os servidores públicos diretamente do banco de dados Oracle oficial (Tabela de Recursos Humanos) para o sistema da Escola de Governo.
              </p>
              <button 
                className="btn" 
                onClick={handleSyncOracle}
                disabled={sincronizandoOracle}
                style={{ backgroundColor: sincronizandoOracle ? '#94A3B8' : '#0F172A' }}
              >
                {sincronizandoOracle ? 'Sincronizando (Aguarde...)' : 'Sincronizar Dados com Oracle'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}