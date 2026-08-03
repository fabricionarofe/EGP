import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { register, login } from '../controllers/auth.controller';

const router = Router();

// Limite de requisições para evitar ataques de Força Bruta
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // Limita cada IP a 10 requisições por janela
  message: { error: 'Muitas tentativas de acesso. Tente novamente após 15 minutos.' }
});

// Rota POST para criar um usuário
router.post('/register', authLimiter, register);

// Rota POST para realizar o login
router.post('/login', authLimiter, login);

export default router;