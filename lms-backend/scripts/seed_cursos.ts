import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  let instrutor = await prisma.usuario.findFirst({
    where: { perfil: 'INSTRUTOR' }
  });

  if (!instrutor) {
    instrutor = await prisma.usuario.create({
      data: {
        nome: 'Instrutor Fictício',
        email: 'instrutor.ficticio@egp.pa.gov.br',
        senha: 'hash',
        perfil: 'INSTRUTOR'
      }
    });
  }

  const cursos = [
    { titulo: 'Gestão de Tempo na Administração Pública', descricao: 'Aprenda a otimizar sua rotina no serviço público com técnicas modernas de produtividade.' },
    { titulo: 'Liderança e Gestão de Equipes', descricao: 'Desenvolva habilidades de liderança e saiba como motivar e gerenciar sua equipe no setor público.' },
    { titulo: 'Redação Oficial Descomplicada', descricao: 'Curso prático sobre as normas e padronizações da redação de documentos oficiais.' },
    { titulo: 'Noções Básicas de Licitação (Nova Lei)', descricao: 'Entenda os principais pontos da Nova Lei de Licitações e Contratos (Lei 14.133/2021).' },
  ];

  for (const c of cursos) {
    await prisma.curso.create({
      data: {
        titulo: c.titulo,
        descricao: c.descricao,
        instrutorId: instrutor.id
      }
    });
  }

  console.log('Cursos criados com sucesso!');
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    console.log("Fim da execução.");
  });
