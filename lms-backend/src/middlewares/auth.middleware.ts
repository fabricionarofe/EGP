import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Estendemos a interface padrão do Express para incluir o usuário
export interface AuthRequest extends Request {
  usuario?: any;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  // Procura o token no cabeçalho "Authorization: Bearer <token>"
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Acesso negado. Token não fornecido.' });
  }

  const [, token] = authHeader.split(' '); // Pega apenas o token, descartando a palavra "Bearer"

  try {
    const secret = process.env.JWT_SECRET || 'chave_secreta_padrao_para_desenvolvimento';
    const decoded = jwt.verify(token, secret);
    req.usuario = decoded; // Salva as informações do usuário (id, perfil) para usarmos nas rotas
    return next(); // Libera o acesso para a próxima função (a rota desejada)
  } catch (error) {
    return res.status(401).json({ error: 'Acesso negado. Token inválido ou expirado.' });
  }
};