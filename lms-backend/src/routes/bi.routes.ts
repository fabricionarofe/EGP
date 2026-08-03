import { Router } from 'express';

const biRouter = Router();

biRouter.get('/', (req, res) => {
  res.json({ message: 'Endpoint de BI' });
});

export default biRouter;