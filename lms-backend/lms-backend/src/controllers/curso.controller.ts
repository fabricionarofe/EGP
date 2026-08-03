import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class CursoController {
  
  static async criar(req: Request, res: Response) {
    const { titulo, descricao, horas, instrutorId } = req.body;

    try {
      const curso = await prisma.curso.create({
        data: {
          titulo,
          descricao,
          horas,
          instrutorId
        }
      });

      return res.status(201).json({ mensagem: 'Curso criado com sucesso!', curso });
    } catch (error) {
      return res.status(500).json({ mensagem: 'Erro interno ao criar curso.' });
    }
  }

  static async listar(req: Request, res: Response) {
    try {
      const cursos = await prisma.curso.findMany({
        include: { instrutor: { select: { nome: true, email: true } } }
      });

      return res.status(200).json(cursos);
    } catch (error) {
      return res.status(500).json({ mensagem: 'Erro ao buscar cursos.' });
    }
  }
}