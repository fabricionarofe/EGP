import { Router } from 'express';
import { CursoController } from '../controllers/curso.controller';
import { validate } from '../middlewares/validate.middleware';
import { criarCursoSchema } from '../schemas/curso.schema';

const router = Router();

router.post('/', validate(criarCursoSchema), CursoController.criar);
router.get('/', CursoController.listar);

export default router;