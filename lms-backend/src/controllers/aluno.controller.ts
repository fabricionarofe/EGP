import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { prisma } from '../../prisma/prisma';

export const meusCursos = async (req: AuthRequest, res: Response) => {
  try {
    const alunoId = req.usuario?.id;
    if (!alunoId) return res.status(401).json({ error: 'Não autorizado' });

    const inscricoes = await prisma.inscricao.findMany({
      where: { alunoId },
      include: {
        curso: {
          include: {
            instrutor: { select: { nome: true } }
          }
        }
      }
    });

    const cursos = inscricoes.map(insc => insc.curso);
    return res.status(200).json(cursos);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao buscar meus cursos.' });
  }
};
