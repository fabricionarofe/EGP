import { Router } from 'express';
import { BIController } from '../controllers/bi.controller';
import { autenticar, autorizar } from '../middlewares/auth.middleware';

const router = Router();

router.get('/metricas', autenticar, autorizar(['INSTRUTOR', 'ADMIN']), BIController.obterMetricas);

export default router;