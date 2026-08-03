import { z } from 'zod';

export const loginSchema = z.object({
  body: z.object({
    email: z.string({ required_error: 'O e-mail é obrigatório' })
            .email('Formato de e-mail inválido')
            .trim(),
    senha: z.string({ required_error: 'A senha é obrigatória' })
            .min(8, 'A senha deve ter no mínimo 8 caracteres')
  })
});

export const registroSchema = z.object({
  body: z.object({
    nome: z.string({ required_error: 'O nome é obrigatório' }).min(2).max(100).trim(),
    email: z.string().email('Formato de e-mail inválido').trim(),
    senha: z.string().min(8, 'A senha precisa ter no mínimo 8 caracteres'),
    perfil: z.enum(['ALUNO', 'INSTRUTOR']).default('ALUNO')
  })
});
