import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class TurmaController {
  static async criar(req: Request, res: Response) {
    const { nome, cursoId } = req.body;

    try {
      // Verifica se o curso referenciado existe
      const cursoExiste = await prisma.curso.findUnique({ where: { id: cursoId } });
      if (!cursoExiste) {
        return res.status(404).json({ mensagem: 'Curso não encontrado.' });
      }

      const turma = await prisma.turma.create({
        data: { nome, cursoId }
      });

      return res.status(201).json({ mensagem: 'Turma criada com sucesso!', turma });
    } catch (error) {
      return res.status(500).json({ mensagem: 'Erro interno ao criar turma.' });
    }
  }

  static async listar(req: Request, res: Response) {
    const { cursoId } = req.query;

    try {
      const turmas = await prisma.turma.findMany({
        where: cursoId ? { cursoId: String(cursoId) } : undefined, // Filtro opcional por curso
        include: { _count: { select: { matriculas: true } } } // Traz a contagem de alunos matriculados para o BI
      });

      return res.status(200).json(turmas);
    } catch (error) {
      return res.status(500).json({ mensagem: 'Erro ao buscar turmas.' });
    }
  }
}