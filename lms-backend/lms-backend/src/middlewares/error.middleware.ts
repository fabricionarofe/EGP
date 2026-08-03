import { Request, Response, NextFunction } from 'express';

// Centraliza o tratamento de erros para evitar o vazamento de Stack Trace (Segurança)
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  // Aqui você poderia integrar ferramentas como Sentry ou Datadog para monitoramento
  console.error(`[Erro Crítico] ${err.message || err}`);

  const status = err.status || 500;
  const isProducao = process.env.NODE_ENV === 'production';
  
  // Se for produção e for um erro 500, escondemos os detalhes do usuário
  const mensagem = (isProducao && status === 500) 
    ? 'Ocorreu um erro interno no servidor.' 
    : err.message || 'Erro interno no servidor.';

  res.status(status).json({ erro: true, mensagem });
};