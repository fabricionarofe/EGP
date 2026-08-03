import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

// FALLBACK DE SEGURANÇA: Se o .env estiver vazio ou falhar, injetamos a URL manualmente
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "file:./dev.db";
}

// Adiciona o prisma ao objeto global do Node.js para evitar múltiplas instâncias em desenvolvimento
declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    // log: ['query'], // Opcional: descomente para logar as queries no console
  });

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}