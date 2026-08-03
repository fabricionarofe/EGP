import 'dotenv/config'; // Importação que garante o carregamento imediato das variáveis de ambiente

import express, { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from '../../routes/auth.routes';
import cursoRoutes from '../../routes/curso.routes';
import biRoutes from '../../routes/bi.routes';
import matriculaRoutes from '../../routes/matricula.routes';
import turmaRoutes from '../../routes/turma.routes';
import alunoRoutes from '../../routes/aluno.routes';
import { errorHandler } from '../../middlewares/error.middleware';
import { setupSwagger } from '../../docs/swagger';

const app: Application = express();

// --- BOAS PRÁTICAS DE SEGURANÇA ---
// 1. Helmet: Adiciona cabeçalhos de segurança HTTP (ex: X-Frame-Options, X-XSS-Protection)
app.use(helmet());

// 2. CORS: Restringe quais domínios podem acessar nossa API
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true // Permite o envio de cookies de sessão
}));

// 3. Parsers
app.use(express.json({ limit: '10kb' })); // Limita o tamanho do payload (previne DoS)
app.use(cookieParser()); // Necessário para ler o cookie HttpOnly

// --- ROTAS ---
app.use('/api/auth', authRoutes);
app.use('/api/cursos', cursoRoutes);
app.use('/api/bi', biRoutes);
app.use('/api/matriculas', matriculaRoutes);
app.use('/api/turmas', turmaRoutes);
app.use('/api/aluno', alunoRoutes);

// --- DOCUMENTAÇÃO SWAGGER ---
setupSwagger(app);

// Rota de Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'LMS API rodando com segurança.' });
});

// 4. Tratamento Global de Erros (DEVE ser o último middleware)
app.use(errorHandler);

export default app;
