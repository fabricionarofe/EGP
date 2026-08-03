import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { prisma } from '../../prisma/prisma';

export const listarCursos = async (req: AuthRequest, res: Response) => {
  try {
    // Busca todos os cursos no banco de dados, incluindo o nome do instrutor
    const cursos = await prisma.curso.findMany({
      include: {
        instrutor: {
          select: { nome: true }
        }
      }
    });
    
    return res.status(200).json(cursos);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao buscar cursos.' });
  }
};

export const criarCurso = async (req: AuthRequest, res: Response) => {
  try {
    const { titulo, descricao } = req.body;
    const usuarioId = req.usuario?.id; // Esse ID vem de dentro do Token JWT!

    if (!titulo || !descricao) {
      return res.status(400).json({ error: 'Título e descrição são obrigatórios.' });
    }

    if (req.usuario?.perfil !== 'INSTRUTOR') {
      return res.status(403).json({ error: 'Apenas instrutores podem criar cursos.' });
    }

    const novoCurso = await prisma.curso.create({
      data: { titulo, descricao, instrutorId: usuarioId }
    });

    return res.status(201).json({ message: 'Curso criado com sucesso!', curso: novoCurso });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao criar curso.' });
  }
};

export const buscarCurso = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const curso = await prisma.curso.findUnique({
      where: { id },
      include: {
        instrutor: { select: { id: true, nome: true } },
        modulos: {
          include: { aulas: true }
        },
        avisos: { orderBy: { criadoEm: 'desc' } },
        materiais: { orderBy: { criadoEm: 'desc' } },
        alunos: { where: { alunoId: req.usuario?.id } } // Para saber se já está matriculado
      }
    });

    if (!curso) return res.status(404).json({ error: 'Curso não encontrado.' });
    
    return res.status(200).json(curso);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao buscar curso.' });
  }
};

export const criarModulo = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { titulo } = req.body;
    
    if (req.usuario?.perfil !== 'INSTRUTOR') return res.status(403).json({ error: 'Proibido' });

    const modulo = await prisma.modulo.create({
      data: { titulo, cursoId: id }
    });
    return res.status(201).json(modulo);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao criar módulo.' });
  }
};

export const criarAula = async (req: AuthRequest, res: Response) => {
  try {
    const { moduloId } = req.params;
    const { titulo, conteudo, videoUrl } = req.body;

    if (req.usuario?.perfil !== 'INSTRUTOR') return res.status(403).json({ error: 'Proibido' });

    const aula = await prisma.aula.create({
      data: { titulo, conteudo, videoUrl, moduloId }
    });
    return res.status(201).json(aula);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao criar aula.' });
  }
};

export const matricular = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const alunoId = req.usuario?.id;

    if (!alunoId) return res.status(401).json({ error: 'Não autorizado.' });

    const jaMatriculado = await prisma.inscricao.findUnique({
      where: { alunoId_cursoId: { alunoId, cursoId: id } }
    });

    if (jaMatriculado) return res.status(400).json({ error: 'Você já está matriculado neste curso.' });

    const inscricao = await prisma.inscricao.create({
      data: { alunoId, cursoId: id }
    });

    return res.status(201).json({ message: 'Matrícula realizada com sucesso!', inscricao });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao matricular.' });
  }
};

export const meusCursosInstrutor = async (req: AuthRequest, res: Response) => {
  try {
    const instrutorId = req.usuario?.id;
    if (req.usuario?.perfil !== 'INSTRUTOR') return res.status(403).json({ error: 'Proibido' });

    const cursos = await prisma.curso.findMany({
      where: { instrutorId }
    });
    return res.status(200).json(cursos);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao buscar cursos do instrutor.' });
  }
};

export const criarAviso = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { conteudo } = req.body;
    
    if (req.usuario?.perfil !== 'INSTRUTOR') return res.status(403).json({ error: 'Proibido' });

    const curso = await prisma.curso.findUnique({ where: { id }});
    if (curso?.instrutorId !== req.usuario.id) return res.status(403).json({ error: 'Proibido' });

    const aviso = await prisma.aviso.create({
      data: { conteudo, cursoId: id }
    });
    return res.status(201).json(aviso);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao criar aviso.' });
  }
};

export const criarMaterial = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { titulo, tipo, url } = req.body;
    
    if (req.usuario?.perfil !== 'INSTRUTOR') return res.status(403).json({ error: 'Proibido' });

    const curso = await prisma.curso.findUnique({ where: { id }});
    if (curso?.instrutorId !== req.usuario.id) return res.status(403).json({ error: 'Proibido' });

    const material = await prisma.materialApoio.create({
      data: { titulo, tipo, url, cursoId: id }
    });
    return res.status(201).json(material);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao criar material.' });
  }
};

export const listarAlunosCurso = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    if (req.usuario?.perfil !== 'INSTRUTOR') return res.status(403).json({ error: 'Proibido' });

    const curso = await prisma.curso.findUnique({ where: { id }});
    if (curso?.instrutorId !== req.usuario.id) return res.status(403).json({ error: 'Proibido' });

    const inscricoes = await prisma.inscricao.findMany({
      where: { cursoId: id },
      include: {
        aluno: { select: { id: true, nome: true, email: true, matricula: true, fotoPerfil: true } }
      }
    });
    
    return res.status(200).json(inscricoes);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao buscar alunos.' });
  }
};

export const avaliarAluno = async (req: AuthRequest, res: Response) => {
  try {
    const { id, alunoId } = req.params;
    const { nota1, nota2, notaFinal, presencas, faltas } = req.body;
    
    if (req.usuario?.perfil !== 'INSTRUTOR') return res.status(403).json({ error: 'Proibido' });

    const curso = await prisma.curso.findUnique({ where: { id }});
    if (curso?.instrutorId !== req.usuario.id) return res.status(403).json({ error: 'Proibido' });

    const inscricao = await prisma.inscricao.update({
      where: { alunoId_cursoId: { alunoId, cursoId: id } },
      data: {
        nota1: nota1 !== undefined ? parseFloat(nota1) : undefined,
        nota2: nota2 !== undefined ? parseFloat(nota2) : undefined,
        notaFinal: notaFinal !== undefined ? parseFloat(notaFinal) : undefined,
        presencas: presencas !== undefined ? parseInt(presencas) : undefined,
        faltas: faltas !== undefined ? parseInt(faltas) : undefined,
      }
    });
    
    return res.status(200).json(inscricao);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao avaliar aluno.' });
  }
};