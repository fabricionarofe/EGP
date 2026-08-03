import { Router } from 'express';
import { atualizarFotoPerfil } from '../controllers/usuario.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const usuarioRouter = Router();

usuarioRouter.use(authMiddleware);

usuarioRouter.put('/:id/foto', atualizarFotoPerfil);

export default usuarioRouter;
