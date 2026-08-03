import app from './app';
import cron from 'node-cron';
import { sincronizarServidores } from './services/oracle.service';

const PORT = process.env.PORT || 3333;

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  
  // O "Despertador": Executa todo domingo às 03:00 da manhã
  cron.schedule('0 3 * * 0', async () => {
    console.log('⏰ Iniciando Sincronização Automática com Oracle (CRON)...');
    await sincronizarServidores();
  });
  
  console.log(`🔒 Modo seguro ativo.`);
});