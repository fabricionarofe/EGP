import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class AlunoController {
  static async obterMeuDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const usuarioId = (req as any).usuario.id;

      // Busca as matrículas do aluno e traz os dados do curso/turma relacionados
      const matriculas = await prisma.matricula.findMany({
        where: { usuarioId },
        include: {
          turma: {
            include: { curso: true }
          }
        }
      });

      return res.status(200).json({
        mensagem: 'Dashboard carregado com sucesso.',
        matriculas
      });
    } catch (error) {
      next(error); // Encaminha o erro para o Global Error Handler
    }
  }
}