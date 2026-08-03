import { Router } from 'express';

const matriculaRouter = Router();

matriculaRouter.get('/', (req, res) => {
  res.json({ message: 'Endpoint para listar matrículas' });
});

export default matriculaRouter;