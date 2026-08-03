import { Router } from 'express';
import { AlunoController } from '../controllers/aluno.controller';
import { autenticar, autorizar } from '../middlewares/auth.middleware';

const router = Router();

// Rota exclusiva, passando pelos middlewares de Autenticação e Autorização (RBAC)
router.get('/dashboard', autenticar, autorizar(['ALUNO']), AlunoController.obterMeuDashboard);

export default router;