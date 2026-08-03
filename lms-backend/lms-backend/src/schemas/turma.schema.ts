import { z } from 'zod';

export const criarTurmaSchema = z.object({
  body: z.object({
    nome: z.string({ required_error: 'O nome da turma é obrigatório' }).min(3).max(100).trim(),
    cursoId: z.string({ required_error: 'O ID do curso é obrigatório' }).uuid('ID de curso inválido')
  })
});