import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validate } from '../middlewares/validate.middleware';
import { loginSchema, registroSchema } from '../schemas/auth.schema';
import rateLimit from 'express-rate-limit';

const router = Router();

// BOAS PRÁTICAS: Proteção contra Brute Force no Login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // Janela de 15 minutos
  max: 5, // Limita a 5 tentativas por IP dentro da janela
  message: { mensagem: 'Muitas tentativas de login. Por favor, tente novamente após 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * @swagger
 * /api/auth/registro:
 *   post:
 *     summary: Registra um novo usuário (Aluno ou Instrutor)
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *               - email
 *               - senha
 *             properties:
 *               nome:
 *                 type: string
 *               email:
 *                 type: string
 *               senha:
 *                 type: string
 *               perfil:
 *                 type: string
 *                 enum: [ALUNO, INSTRUTOR]
 *     responses:
 *       201:
 *         description: Usuário registrado com sucesso
 */
// Aplica a validação antes de chegar no controller
router.post('/registro', validate(registroSchema), AuthController.registrar);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Realiza o login na plataforma
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               senha:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login realizado com sucesso (Cookie gerado)
 *       401:
 *         description: Credenciais inválidas
 */
router.post('/login', loginLimiter, validate(loginSchema), AuthController.login);

export default router;
