import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../AuthContext';

export function SalaAula() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [curso, setCurso] = useState<any>(null);
  const [carregando, setCarregando] = useState(true);
  const [abaAtiva, setAbaAtiva] = useState<'avisos' | 'materiais' | 'alunos'>('avisos');
  const [alunosInscritos, setAlunosInscritos] = useState<any[]>([]);
  
  // Estados para o formulário do Instrutor
  const [novoAviso, setNovoAviso] = useState('');
  const [novoMaterial, setNovoMaterial] = useState({ titulo: '', tipo: 'PDF', url: '' });

  useEffect(() => {
    carregarCurso();
  }, [id]);

  const carregarCurso = async () => {
    try {
      const response = await api.get(`/cursos/${id}`);
      setCurso(response.data);
      
      // Se for instrutor, carrega a lista detalhada de alunos
      if (user?.id === response.data.instrutorId) {
        carregarAlunos();
      }
    } catch (error) {
      console.error('Erro ao carregar curso', error);
      alert('Erro ao carregar os dados da sala.');
      navigate('/dashboard');
    } finally {
      setCarregando(false);
    }
  };

  const carregarAlunos = async () => {
    try {
      const res = await api.get(`/cursos/${id}/alunos`);
      setAlunosInscritos(res.data);
    } catch (error) {
      console.error('Erro ao carregar alunos');
    }
  };

  const enviarAviso = async () => {
    if (!novoAviso.trim()) return;
    try {
      await api.post(`/cursos/${id}/avisos`, { conteudo: novoAviso });
      setNovoAviso('');
      carregarCurso(); // Recarrega para exibir o novo aviso
    } catch (err) {
      alert('Erro ao postar aviso');
    }
  };

  const enviarMaterial = async () => {
    if (!novoMaterial.titulo.trim() || !novoMaterial.url.trim()) return alert('Preencha título e URL');
    try {
      await api.post(`/cursos/${id}/materiais`, novoMaterial);
      setNovoMaterial({ titulo: '', tipo: 'PDF', url: '' });
      carregarCurso();
    } catch (err) {
      alert('Erro ao adicionar material');
    }
  };

  const salvarAvaliacao = async (inscricao: any) => {
    try {
      await api.put(`/cursos/${id}/alunos/${inscricao.alunoId}/avaliar`, {
        nota1: inscricao.nota1,
        nota2: inscricao.nota2,
        notaFinal: inscricao.notaFinal,
        presencas: inscricao.presencas,
        faltas: inscricao.faltas
      });
      alert('Avaliação salva com sucesso!');
      carregarAlunos();
    } catch (err) {
      alert('Erro ao salvar avaliação');
    }
  };

  const atualizarInscricaoLocal = (alunoId: string, campo: string, valor: any) => {
    setAlunosInscritos(prev => prev.map(insc => 
      insc.alunoId === alunoId ? { ...insc, [campo]: valor } : insc
    ));
  };

  if (carregando) return <p style={{ padding: '40px', textAlign: 'center' }}>Carregando sala de apoio...</p>;
  if (!curso) return null;

  const isInstrutor = user?.id === curso.instrutorId;
  const minhaInscricao = curso.alunos?.find((a: any) => a.alunoId === user?.id);
  const totalAulasComputadas = (minhaInscricao?.presencas || 0) + (minhaInscricao?.faltas || 0);
  const frequenciaPercent = totalAulasComputadas === 0 ? 0 : Math.round(((minhaInscricao?.presencas || 0) / totalAulasComputadas) * 100);

  // ----------------------------------------------------
  // DADOS FALSOS (MOCK) PARA VISUALIZAÇÃO - EXEMPLO
  // ----------------------------------------------------
  const mockAvisos = [
    {
      id: 1,
      data: "10 Jul 2026",
      texto: "Lembrete: Tragam o material impresso para a nossa próxima aula prática na quarta-feira."
    },
    {
      id: 2,
      data: "05 Jul 2026",
      texto: "As notas da primeira avaliação já foram lançadas no sistema. Qualquer dúvida me procurem no final da aula."
    }
  ];

  const mockMateriais = [
    { id: 1, tipo: 'pdf', nome: 'Apostila 01 - Introdução à Gestão.pdf', tamanho: '2.4 MB' },
    { id: 2, tipo: 'word', nome: 'Formulário de Requerimento Padrão.docx', tamanho: '150 KB' },
    { id: 3, tipo: 'video', nome: 'Vídeo Complementar - Legislação 2026', tamanho: 'Link Externo' },
  ];

  const tabStyle = (isActive: boolean) => ({
    padding: '16px 32px',
    cursor: 'pointer',
    borderBottom: isActive ? '3px solid var(--cor-destaque)' : '3px solid transparent',
    color: isActive ? 'var(--cor-destaque)' : 'var(--cor-texto)',
    fontWeight: isActive ? '600' : '500',
    fontSize: '1.05rem',
    background: 'none',
    borderTop: 'none',
    borderLeft: 'none',
    borderRight: 'none',
    transition: 'all 0.2s',
    outline: 'none'
  });

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '40px' }}>
      
      {/* Botão Voltar */}
      <button 
        onClick={() => navigate('/dashboard')} 
        style={{ background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer', marginBottom: '20px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}
      >
        ← Voltar para o Dashboard
      </button>

      {/* HEADER DO CURSO (HUB PRESENCIAL) */}
      <div style={{ backgroundColor: 'var(--cor-branco)', borderRadius: '12px', border: '1px solid var(--cor-borda)', padding: '32px', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        <div>
          <h1 style={{ color: 'var(--cor-primaria)', fontSize: '2.2rem', margin: '0 0 8px 0' }}>{curso.titulo}</h1>
          <p style={{ color: '#64748B', fontSize: '1rem', margin: 0, maxWidth: '800px' }}>{curso.descricao}</p>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '48px', borderTop: '1px solid var(--cor-borda)', paddingTop: '24px' }}>
          
          {/* Card do Instrutor */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', border: '2px solid var(--cor-secundaria)', backgroundColor: '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#475569', fontSize: '1.2rem' }}>
              {curso.instrutor?.nome?.charAt(0) || 'I'}
            </div>
            <div>
              <p style={{ margin: '0 0 4px 0', fontSize: '0.85rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 'bold' }}>Instrutor Responsável</p>
              <h4 style={{ margin: 0, color: 'var(--cor-texto)', fontSize: '1.1rem' }}>{curso.instrutor?.nome}</h4>
            </div>
          </div>

          {/* Card de Frequência e Datas */}
          <div style={{ display: 'flex', gap: '48px', borderLeft: '1px solid var(--cor-borda)', paddingLeft: '48px' }}>
            <div>
              <p style={{ margin: '0 0 4px 0', fontSize: '0.85rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 'bold' }}>Dias de Aula</p>
              <p style={{ margin: 0, color: 'var(--cor-texto)', fontWeight: '500' }}>Presencial (Consulte Instrutor)</p>
            </div>
            {!isInstrutor && (
              <div>
                <p style={{ margin: '0 0 4px 0', fontSize: '0.85rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 'bold' }}>Sua Frequência</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ margin: 0, color: 'var(--cor-primaria)', fontWeight: 'bold', fontSize: '1.4rem' }}>{frequenciaPercent}%</span>
                  {totalAulasComputadas > 0 ? (
                    <span style={{ color: frequenciaPercent >= 75 ? '#15803d' : '#b91c1c', fontSize: '0.8rem', backgroundColor: frequenciaPercent >= 75 ? '#dcfce7' : '#fee2e2', padding: '4px 10px', borderRadius: '12px', fontWeight: 'bold' }}>
                      {frequenciaPercent >= 75 ? 'Regular' : 'Risco de Reprovação'}
                    </span>
                  ) : (
                    <span style={{ color: '#64748b', fontSize: '0.8rem', backgroundColor: '#f1f5f9', padding: '4px 10px', borderRadius: '12px', fontWeight: 'bold' }}>
                      Sem Aulas Computadas
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* ÁREA DE CONTEÚDO E ABAS */}
      <div style={{ backgroundColor: 'var(--cor-branco)', borderRadius: '12px', border: '1px solid var(--cor-borda)', overflow: 'hidden' }}>
        
        {/* NAVEGAÇÃO DAS ABAS */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--cor-borda)', backgroundColor: '#F8FAFC' }}>
          <button onClick={() => setAbaAtiva('avisos')} style={tabStyle(abaAtiva === 'avisos')}>
            📢 Mural de Avisos
          </button>
          <button onClick={() => setAbaAtiva('materiais')} style={tabStyle(abaAtiva === 'materiais')}>
            📂 Materiais de Apoio
          </button>
          {isInstrutor && (
            <button onClick={() => setAbaAtiva('alunos')} style={tabStyle(abaAtiva === 'alunos')}>
              👥 Alunos & Avaliações
            </button>
          )}
        </div>

        {/* CONTEÚDO DAS ABAS */}
        <div style={{ padding: '32px' }}>
          
          {/* ABA: MURAL DE AVISOS */}
          {abaAtiva === 'avisos' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ margin: 0, color: 'var(--cor-primaria)' }}>Recados Recentes</h3>
                {isInstrutor && <span style={{ fontSize: '0.85rem', backgroundColor: '#e2e8f0', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold' }}>Modo Edição (Instrutor)</span>}
              </div>
              
              {isInstrutor && (
                <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: '#f8fafc', border: '1px solid var(--cor-borda)', borderRadius: '8px' }}>
                  <h4 style={{ margin: '0 0 12px 0' }}>Postar Novo Aviso</h4>
                  <textarea 
                    rows={3} 
                    value={novoAviso} 
                    onChange={(e) => setNovoAviso(e.target.value)} 
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--cor-borda)', marginBottom: '12px', resize: 'vertical' }}
                    placeholder="Escreva seu aviso aqui..."
                  />
                  <button className="btn" onClick={enviarAviso}>Postar no Mural</button>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {curso.avisos && curso.avisos.length > 0 ? curso.avisos.map((aviso: any) => (
                  <div key={aviso.id} style={{ backgroundColor: '#F8FAFC', borderLeft: '4px solid var(--cor-destaque)', padding: '24px', borderRadius: '0 8px 8px 0' }}>
                    <span style={{ display: 'block', fontSize: '0.85rem', color: '#64748B', marginBottom: '12px', fontWeight: '500' }}>Postado em {new Date(aviso.criadoEm).toLocaleDateString()}</span>
                    <p style={{ margin: 0, color: 'var(--cor-texto)', lineHeight: '1.6', fontSize: '1rem' }}>{aviso.conteudo}</p>
                  </div>
                )) : (
                  <p style={{ color: '#64748B' }}>Nenhum aviso postado ainda.</p>
                )}
              </div>
            </div>
          )}

          {/* ABA: MATERIAIS DE APOIO */}
          {abaAtiva === 'materiais' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ margin: 0, color: 'var(--cor-primaria)' }}>Arquivos Disponibilizados</h3>
              </div>

              {isInstrutor && (
                <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: '#f8fafc', border: '1px solid var(--cor-borda)', borderRadius: '8px' }}>
                  <h4 style={{ margin: '0 0 12px 0' }}>Adicionar Material (Link)</h4>
                  <div style={{ display: 'flex', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
                    <input 
                      type="text" 
                      placeholder="Título do Material (ex: Apostila Aula 01)" 
                      value={novoMaterial.titulo}
                      onChange={e => setNovoMaterial({...novoMaterial, titulo: e.target.value})}
                      style={{ flex: 1, minWidth: '200px', padding: '10px', borderRadius: '8px', border: '1px solid var(--cor-borda)' }}
                    />
                    <select 
                      value={novoMaterial.tipo}
                      onChange={e => setNovoMaterial({...novoMaterial, tipo: e.target.value})}
                      style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--cor-borda)' }}
                    >
                      <option value="PDF">PDF</option>
                      <option value="DOC">Word / Doc</option>
                      <option value="VIDEO">Vídeo</option>
                      <option value="LINK">Link Geral</option>
                    </select>
                  </div>
                  <input 
                    type="url" 
                    placeholder="URL / Link (ex: https://drive.google.com/...)" 
                    value={novoMaterial.url}
                    onChange={e => setNovoMaterial({...novoMaterial, url: e.target.value})}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--cor-borda)', marginBottom: '12px' }}
                  />
                  <button className="btn" onClick={enviarMaterial}>Adicionar Material</button>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                {curso.materiais && curso.materiais.length > 0 ? curso.materiais.map((mat: any) => (
                  <div 
                    key={mat.id} 
                    onClick={() => window.open(mat.url, '_blank')}
                    style={{ display: 'flex', alignItems: 'center', gap: '16px', border: '1px solid var(--cor-borda)', padding: '16px', borderRadius: '8px', cursor: 'pointer', backgroundColor: '#fff', transition: 'border-color 0.2s' }} 
                  >
                    <div style={{ width: '48px', height: '48px', borderRadius: '8px', backgroundColor: mat.tipo === 'PDF' ? '#fee2e2' : mat.tipo === 'DOC' ? '#dbeafe' : '#fef9c3', color: mat.tipo === 'PDF' ? '#ef4444' : mat.tipo === 'DOC' ? '#3b82f6' : '#eab308', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                      {mat.tipo}
                    </div>
                    
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: '0 0 4px 0', fontWeight: '600', color: 'var(--cor-texto)', fontSize: '0.95rem' }}>{mat.titulo}</p>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748B' }}>Acessar Link</p>
                    </div>
                    
                    <button style={{ background: 'transparent', border: 'none', color: 'var(--cor-primaria)', cursor: 'pointer', fontWeight: 'bold', padding: '8px' }}>Abrir</button>
                  </div>
                )) : (
                  <p style={{ color: '#64748B' }}>Nenhum material disponibilizado ainda.</p>
                )}
              </div>
            </div>
          )}

          {/* ABA: ALUNOS E AVALIAÇÕES (APENAS INSTRUTOR) */}
          {isInstrutor && abaAtiva === 'alunos' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ margin: 0, color: 'var(--cor-primaria)' }}>Gestão da Turma</h3>
                <span style={{ fontSize: '0.85rem', backgroundColor: '#e2e8f0', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold' }}>{alunosInscritos.length} Aluno(s) Matriculado(s)</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {alunosInscritos.map((insc: any) => (
                  <div key={insc.alunoId} style={{ border: '1px solid var(--cor-borda)', borderRadius: '8px', padding: '20px', backgroundColor: '#fff' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--cor-borda)', paddingBottom: '12px', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--cor-secundaria)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                          {insc.aluno.nome.charAt(0)}
                        </div>
                        <div>
                          <h4 style={{ margin: 0 }}>{insc.aluno.nome}</h4>
                          <span style={{ fontSize: '0.85rem', color: '#64748B' }}>Matrícula: {insc.aluno.matricula || 'N/A'}</span>
                        </div>
                      </div>
                      <button className="btn" style={{ backgroundColor: 'var(--cor-destaque)', padding: '6px 16px', fontSize: '0.9rem' }} onClick={() => salvarAvaliacao(insc)}>
                        Salvar Avaliação
                      </button>
                    </div>

                    <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
                      {/* Presenças e Faltas */}
                      <div style={{ flex: 1, minWidth: '200px' }}>
                        <h5 style={{ margin: '0 0 12px 0', color: '#64748B' }}>Frequência (Dias)</h5>
                        <div style={{ display: 'flex', gap: '16px' }}>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '4px' }}>Presenças</label>
                            <input 
                              type="number" 
                              value={insc.presencas || 0}
                              onChange={(e) => atualizarInscricaoLocal(insc.alunoId, 'presencas', parseInt(e.target.value) || 0)}
                              style={{ width: '80px', padding: '8px', borderRadius: '6px', border: '1px solid var(--cor-borda)' }}
                            />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '4px' }}>Faltas</label>
                            <input 
                              type="number" 
                              value={insc.faltas || 0}
                              onChange={(e) => atualizarInscricaoLocal(insc.alunoId, 'faltas', parseInt(e.target.value) || 0)}
                              style={{ width: '80px', padding: '8px', borderRadius: '6px', border: '1px solid var(--cor-borda)' }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Notas */}
                      <div style={{ flex: 2, minWidth: '300px' }}>
                        <h5 style={{ margin: '0 0 12px 0', color: '#64748B' }}>Avaliações</h5>
                        <div style={{ display: 'flex', gap: '16px' }}>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '4px' }}>Nota 1</label>
                            <input 
                              type="number" 
                              step="0.1"
                              value={insc.nota1 !== null ? insc.nota1 : ''}
                              onChange={(e) => atualizarInscricaoLocal(insc.alunoId, 'nota1', e.target.value === '' ? null : parseFloat(e.target.value))}
                              style={{ width: '80px', padding: '8px', borderRadius: '6px', border: '1px solid var(--cor-borda)' }}
                            />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '4px' }}>Nota 2</label>
                            <input 
                              type="number" 
                              step="0.1"
                              value={insc.nota2 !== null ? insc.nota2 : ''}
                              onChange={(e) => atualizarInscricaoLocal(insc.alunoId, 'nota2', e.target.value === '' ? null : parseFloat(e.target.value))}
                              style={{ width: '80px', padding: '8px', borderRadius: '6px', border: '1px solid var(--cor-borda)' }}
                            />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '4px', color: 'var(--cor-destaque)' }}>Média Final</label>
                            <input 
                              type="number" 
                              step="0.1"
                              value={insc.notaFinal !== null ? insc.notaFinal : ''}
                              onChange={(e) => atualizarInscricaoLocal(insc.alunoId, 'notaFinal', e.target.value === '' ? null : parseFloat(e.target.value))}
                              style={{ width: '80px', padding: '8px', borderRadius: '6px', border: '2px solid var(--cor-destaque)', fontWeight: 'bold' }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}
