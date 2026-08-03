import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class MatriculaController {
  
  static async matricular(req: Request, res: Response) {
    const { turmaId } = req.body;
    const usuarioId = (req as any).usuario.id; // Pegamos de forma segura do token JWT

    try {
      const matricula = await prisma.matricula.create({
        data: { usuarioId, turmaId }
      });
      return res.status(201).json({ mensagem: 'Matrícula realizada com sucesso!', matricula });
    } catch (error) {
      // Tratamento de erro caso já exista a matrícula (constraint unique no Prisma)
      return res.status(400).json({ mensagem: 'Aluno já matriculado nesta turma ou turma inexistente.' });
    }
  }

  static async lancarNota(req: Request, res: Response) {
    const { matriculaId } = req.params;
    const { nota } = req.body;

    try {
      const matriculaAtualizada = await prisma.matricula.update({
        where: { id: matriculaId },
        data: { nota }
      });

      return res.status(200).json({ 
        mensagem: 'Nota lançada com sucesso.', 
        matricula: matriculaAtualizada 
      });
    } catch (error) {
      return res.status(500).json({ mensagem: 'Erro interno ao lançar nota.' });
    }
  }
}