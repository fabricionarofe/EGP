import { Router, Request, Response } from 'express';
import { sincronizarServidores } from '../services/oracle.service';
import { authMiddleware } from '../middlewares/auth.middleware';

const oracleRouter = Router();

// Apenas usuários logados (e preferencialmente ADMINS) podem rodar isso
oracleRouter.post('/sincronizar', authMiddleware, async (req: Request, res: Response) => {
  try {
    // Verifica se o usuário que clicou no botão é um ADMIN
    // @ts-ignore
    if (req.usuario?.perfil !== 'ADMIN') {
      return res.status(403).json({ error: 'Apenas administradores podem disparar a sincronização manual.' });
    }

    // Chama o nosso robô!
    const resultado = await sincronizarServidores();
    
    if (resultado.success) {
      return res.status(200).json(resultado);
    } else {
      return res.status(500).json(resultado);
    }
  } catch (error) {
    return res.status(500).json({ error: 'Erro interno ao acionar robô Oracle.' });
  }
});

export default oracleRouter;
