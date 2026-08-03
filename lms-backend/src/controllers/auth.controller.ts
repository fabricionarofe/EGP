import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../prisma/prisma';
import { z } from 'zod';

const registerSchema = z.object({
  nome: z.string().min(3, "O nome deve ter no mínimo 3 caracteres."),
  email: z.string().email("E-mail em formato inválido."),
  senha: z.string().min(6, "A senha deve ter no mínimo 6 caracteres."),
  perfil: z.enum(["ALUNO", "INSTRUTOR", "ADMIN"]),
  cpf: z.string().optional(),
  matricula: z.string().optional(),
  lotacao: z.string().optional(),
  especialidade: z.string().optional(),
  areaFormacao: z.string().optional()
});

export const register = async (req: Request, res: Response) => {
  try {
    // 1. Validação Estrita (Zod)
    const validData = registerSchema.safeParse(req.body);
    if (!validData.success) {
      return res.status(400).json({ error: validData.error.errors[0].message });
    }

    const { nome, email, senha, perfil, matricula, cpf, lotacao, especialidade, areaFormacao } = validData.data;

    // 2. Verificar se o e-mail já está cadastrado
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { email },
    });

    if (usuarioExistente) {
      return res.status(400).json({ error: 'Este e-mail já está em uso.' });
    }

    // 3. Validação na Base Espelho do RH (Cancela)
    // Se for Aluno, obriga a ter o CPF na base da Prefeitura
    let matriculaFinal = matricula;
    let lotacaoFinal = lotacao;
    let cpfFinal = cpf;

    if (perfil === 'ALUNO') {
      if (!cpf) {
        return res.status(400).json({ error: 'O CPF é obrigatório para alunos.' });
      }

      const cpfLimpo = cpf.replace(/\\D/g, '');
      cpfFinal = cpfLimpo;
      
      const servidorValido = await prisma.servidorOracle.findUnique({
        where: { cpf: cpfLimpo }
      });

      if (!servidorValido) {
        return res.status(403).json({ error: 'Acesso Negado: Seu CPF não foi encontrado na base de servidores da Prefeitura.' });
      }

      // Aproveitamos para salvar os dados oficiais do RH no perfil dele!
      matriculaFinal = servidorValido.matricula || matricula;
      lotacaoFinal = servidorValido.lotacao || lotacao;
    }

    // 4. Criptografar a senha
    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(senha, salt);

    // 4. Salvar o usuário no banco de dados
    const novoUsuario = await prisma.usuario.create({
      data: {
        nome,
        email,
        senha: senhaHash,
        perfil,
        matricula: matriculaFinal,
        cpf: cpfFinal,
        lotacao: lotacaoFinal,
        especialidade,
        areaFormacao
      },
    });

    // 5. Retornar sucesso (sem enviar a senha de volta!)
    return res.status(201).json({ message: 'Usuário cadastrado com sucesso!', id: novoUsuario.id });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro interno no servidor ao cadastrar usuário.' });
  }
};

const loginSchema = z.object({
  email: z.string().email("E-mail em formato inválido."),
  senha: z.string().min(1, "A senha é obrigatória.")
});

export const login = async (req: Request, res: Response) => {
  try {
    const validData = loginSchema.safeParse(req.body);
    if (!validData.success) {
      return res.status(400).json({ error: validData.error.errors[0].message });
    }

    const { email, senha } = validData.data;

    // 1. Buscar o usuário pelo e-mail
    const usuario = await prisma.usuario.findUnique({
      where: { email },
    });

    if (!usuario) {
      return res.status(400).json({ error: 'E-mail ou senha incorretos.' });
    }

    // 2. Verificar se a senha está correta
    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) {
      return res.status(400).json({ error: 'E-mail ou senha incorretos.' });
    }

    // 3. Gerar o token JWT
    // DICA: Em produção, coloque essa chave secreta no arquivo .env como JWT_SECRET!
    const secret = process.env.JWT_SECRET || 'chave_secreta_padrao_para_desenvolvimento';
    const token = jwt.sign({ id: usuario.id, perfil: usuario.perfil }, secret, { expiresIn: '1d' });

    // 4. Retornar os dados do usuário e o token
    // Não enviamos a senha de volta por segurança
    const { senha: _, ...usuarioSemSenha } = usuario;
    
    return res.status(200).json({ message: 'Login realizado com sucesso!', token, usuario: usuarioSemSenha });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro interno no servidor ao fazer login.' });
  }
};