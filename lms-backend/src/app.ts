import express, { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.routes';
import usuarioRoutes from './routes/usuario.routes';
import cursoRoutes from './routes/curso.routes';
import biRoutes from './routes/bi.routes';
import matriculaRoutes from './routes/matricula.routes';
import turmaRoutes from './routes/turma.routes';
import alunoRoutes from './routes/aluno.routes';
import { errorHandler } from './middlewares/error.middleware';
import { setupSwagger } from './docs/swagger';

dotenv.config();

const app: Application = express();

app.use(helmet());

app.use(cors({
  origin: true, // Permite qualquer origem (inclusive o frontend no Vercel)
  credentials: true
}));

app.use(express.json({ limit: '50mb' })); // Aumentado para suportar Base64 da imagem
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/cursos', cursoRoutes);
app.use('/api/bi', biRoutes);
app.use('/api/matriculas', matriculaRoutes);
app.use('/api/turmas', turmaRoutes);
app.use('/api/aluno', alunoRoutes);

import oracleRoutes from './routes/oracle.routes';
app.use('/api/oracle', oracleRoutes);

setupSwagger(app);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'LMS API rodando com segurança.' });
});

app.use(errorHandler);

export default app;
module.exports = app;