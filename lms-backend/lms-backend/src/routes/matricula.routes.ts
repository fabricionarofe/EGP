import { Router } from 'express';
import { MatriculaController } from '../controllers/matricula.controller';
import { autenticar, autorizar } from '../middlewares/auth.middleware';

const router = Router();

// Somente alunos podem se matricular
router.post('/', autenticar, autorizar(['ALUNO']), MatriculaController.matricular);
// Somente instrutores/admins podem lançar notas
router.put('/:matriculaId/nota', autenticar, autorizar(['INSTRUTOR', 'ADMIN']), MatriculaController.lancarNota);

export default router;