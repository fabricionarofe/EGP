import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class BIController {
  static async obterMetricas(req: Request, res: Response) {
    try {
      const totalAlunos = await prisma.usuario.count({ where: { perfil: 'ALUNO' } });
      
      const totalCursos = await prisma.curso.count();
      
      const agregacaoHoras = await prisma.curso.aggregate({
        _sum: { horas: true }
      });
      const totalHoras = agregacaoHoras._sum.horas || 0;

      // Taxa de desempenho (Média das notas já lançadas)
      const agregacaoNotas = await prisma.matricula.aggregate({
        _avg: { nota: true }
      });
      const mediaDesempenho = agregacaoNotas._avg.nota || 0;

      return res.status(200).json({
        totalAlunos,
        totalCursos,
        totalHoras,
        mediaDesempenho: Number(mediaDesempenho.toFixed(2)) // Arredonda para 2 casas
      });
    } catch (error) {
      return res.status(500).json({ mensagem: 'Erro ao consolidar os dados de BI.' });
    }
  }
}