import { Router } from 'express';
import { meusCursos } from '../controllers/aluno.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const alunoRouter = Router();

alunoRouter.use(authMiddleware);

alunoRouter.get('/meus-cursos', meusCursos);

export default alunoRouter;