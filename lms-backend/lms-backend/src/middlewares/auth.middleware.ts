import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const autenticar = (req: Request, res: Response, next: NextFunction) => {
  // Tenta ler do cookie HttpOnly (mais seguro) ou do Header (fallback)
  const token = req.cookies.access_token || req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ mensagem: 'Acesso negado. Token não fornecido.' });
  }

  try {
    const jwtSecret = process.env.JWT_SECRET || 'chave_super_secreta_fallback';
    const decoded = jwt.verify(token, jwtSecret);
    
    // Anexa as informações do usuário logado na requisição para uso nos controllers
    (req as any).usuario = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ mensagem: 'Sessão inválida ou expirada.' });
  }
};

// Middleware de Controle de Acesso Baseado em Funções (RBAC)
export const autorizar = (perfisPermitidos: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const usuario = (req as any).usuario;
    if (!usuario || !perfisPermitidos.includes(usuario.perfil)) {
      return res.status(403).json({ mensagem: 'Acesso restrito. Nível de privilégio insuficiente.' });
    }
    next();
  };
};