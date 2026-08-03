import { z } from 'zod';

export const criarCursoSchema = z.object({
  body: z.object({
    titulo: z.string({ required_error: 'O título do curso é obrigatório' }).min(3).max(150).trim(),
    descricao: z.string().optional(),
    horas: z.number({ required_error: 'A carga horária é obrigatória' }).int().positive(),
    // O instrutorId idealmente viria do token JWT de quem está logado (Princípio de Menor Privilégio), mas para testes iniciais:
    instrutorId: z.string({ required_error: 'ID do instrutor é obrigatório' }).uuid('ID inválido')
  })
});