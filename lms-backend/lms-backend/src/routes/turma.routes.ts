import { Router } from 'express';
import { TurmaController } from '../controllers/turma.controller';
import { validate } from '../middlewares/validate.middleware';
import { criarTurmaSchema } from '../schemas/turma.schema';
import { autenticar, autorizar } from '../middlewares/auth.middleware';

const router = Router();

// Somente Instrutores e Administradores podem criar turmas
router.post('/', autenticar, autorizar(['INSTRUTOR', 'ADMIN']), validate(criarTurmaSchema), TurmaController.criar);
// Qualquer usuário autenticado (incluindo alunos) pode listar as turmas disponíveis
router.get('/', autenticar, TurmaController.listar);

export default router;