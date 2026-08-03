import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';

export function CursoDetalhes() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [curso, setCurso] = useState<any>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [matriculando, setMatriculando] = useState(false);

  useEffect(() => {
    carregarDetalhes();
  }, [id]);

  const carregarDetalhes = async () => {
    try {
      const response = await api.get(`/cursos/${id}`);
      setCurso(response.data);
    } catch (err) {
      setErro('Erro ao carregar detalhes do curso.');
    } finally {
      setCarregando(false);
    }
  };

  const handleMatricula = async () => {
    if (curso.alunos && curso.alunos.length > 0) {
      // Já matriculado
      navigate(`/curso/${id}/sala`);
      return;
    }

    try {
      setMatriculando(true);
      await api.post(`/cursos/${id}/matricular`);
      alert('Matrícula realizada com sucesso!');
      navigate(`/curso/${id}/sala`);
    } catch (err) {
      alert('Erro ao realizar matrícula.');
    } finally {
      setMatriculando(false);
    }
  };

  if (carregando) return <p style={{ padding: '40px' }}>Carregando curso...</p>;
  if (erro) return <p style={{ padding: '40px', color: 'red' }}>{erro}</p>;
  if (!curso) return null;

  const estaMatriculado = curso.alunos && curso.alunos.length > 0;

  return (
    <div>
      <div style={{ backgroundColor: 'var(--cor-branco)', padding: '40px', borderRadius: '12px', border: '1px solid var(--cor-borda)' }}>
        <button 
          onClick={() => navigate('/dashboard')} 
          style={{ background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer', marginBottom: '24px', fontWeight: '500', padding: 0, display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          ← Voltar para os cursos
        </button>
        
        <h1 style={{ color: 'var(--cor-primaria)', marginTop: 0, marginBottom: '16px' }}>{curso.titulo}</h1>
        <span style={{ display: 'inline-block', backgroundColor: 'var(--cor-fundo-cinza)', color: 'var(--cor-secundaria)', padding: '4px 12px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: '600', marginBottom: '32px', border: '1px solid var(--cor-borda)' }}>Curso Online</span>
        
        <h3 style={{ color: 'var(--cor-texto)', marginBottom: '16px' }}>Sobre este curso</h3>
        <p style={{ color: '#64748B', lineHeight: '1.7', marginBottom: '16px' }}>{curso.descricao}</p>
        <p style={{ color: '#64748B', marginBottom: '40px' }}><strong>Instrutor:</strong> {curso.instrutor?.nome || 'Não informado'}</p>
        
        <div style={{ borderTop: '1px solid var(--cor-borda)', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748B' }}>
              {curso.modulos?.length || 0} módulos • {curso.modulos?.reduce((acc: number, m: any) => acc + m.aulas.length, 0) || 0} aulas
            </p>
          </div>
          <button 
            className="btn" 
            style={{ padding: '12px 32px', backgroundColor: estaMatriculado ? 'var(--cor-secundaria)' : 'var(--cor-destaque)' }}
            onClick={handleMatricula}
            disabled={matriculando}
          >
            {matriculando ? 'Processando...' : (estaMatriculado ? 'Acessar Sala de Aula' : 'Realizar Inscrição')}
          </button>
        </div>
      </div>
    </div>
  );
}