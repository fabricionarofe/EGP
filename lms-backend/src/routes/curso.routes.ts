import { Router } from 'express';
import { listarCursos, criarCurso, buscarCurso, matricular, criarModulo, criarAula, meusCursosInstrutor, criarAviso, criarMaterial, listarAlunosCurso, avaliarAluno } from '../controllers/curso.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const cursoRouter = Router();

cursoRouter.use(authMiddleware);

// IMPORTANTE: /instrutor/meus-cursos deve vir antes de /:id para não ser interpretado como um ID de curso
cursoRouter.get('/instrutor/meus-cursos', meusCursosInstrutor);

cursoRouter.get('/', listarCursos);
cursoRouter.post('/', criarCurso);

cursoRouter.get('/:id', buscarCurso);
cursoRouter.post('/:id/matricular', matricular);
cursoRouter.post('/:id/modulos', criarModulo);
cursoRouter.post('/:cursoId/modulos/:moduloId/aulas', criarAula);

cursoRouter.post('/:id/avisos', criarAviso);
cursoRouter.post('/:id/materiais', criarMaterial);

cursoRouter.get('/:id/alunos', listarAlunosCurso);
cursoRouter.put('/:id/alunos/:alunoId/avaliar', avaliarAluno);

export default cursoRouter;