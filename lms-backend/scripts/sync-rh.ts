import { sincronizarServidores } from '../src/services/oracle.service';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '.env') });

console.log('🚀 Iniciando processo manual de sincronização: Oracle -> Supabase...');

sincronizarServidores().then((res) => {
  console.log('\n✅ Resultado Final:', res);
  process.exit(0);
}).catch((err) => {
  console.error('\n❌ Erro crítico:', err);
  process.exit(1);
});
