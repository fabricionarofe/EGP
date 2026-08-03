import app from './app';

const PORT = process.env.PORT || 3333;

app.listen(PORT, () => {
  console.log(`🚀 Servidor LMS rodando na porta ${PORT}`);
  console.log(`🔒 Modo seguro ativo.`);
});
