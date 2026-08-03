import { Router } from 'express';

const turmaRouter = Router();

turmaRouter.get('/', (req, res) => {
  res.json({ message: 'Endpoint para listar turmas' });
});

export default turmaRouter;