// Importação nativa removida do topo para não quebrar no Vercel
import { prisma } from '../../prisma/prisma';
import bcrypt from 'bcryptjs';

export async function sincronizarServidores() {
  let oracledb: any;
  let connection;
  
  try {
    // Carrega dinamicamente só se a função for chamada
    oracledb = require('oracledb');
    
    try {
      oracledb.initOracleClient({ libDir: 'C:\\oracle\\instantclient_12_1' });
    } catch (err) {
      console.error('[ORACLE SYNC] Aviso: Cliente Oracle não inicializado. Erro:', err);
    }
    
    const user = process.env.ORACLE_USER;
    const password = process.env.ORACLE_PASSWORD;
    const connectString = process.env.ORACLE_CONNECTION_STRING;
    const tableName = process.env.ORACLE_TABLE_NAME;

    if (!user || !password || !connectString || !tableName) {
      console.warn('[ORACLE SYNC] Credenciais do Oracle não foram configuradas no .env. Sincronização cancelada.');
      return { success: false, message: 'Credenciais ausentes no .env' };
    }

    console.log('[ORACLE SYNC] Conectando ao banco de dados Oracle em Thick Mode...');
    
    // Inicia a conexão
    connection = await oracledb.getConnection({
      user: user,
      password: password,
      connectString: connectString
    });

    console.log('[ORACLE SYNC] Conexão bem-sucedida! Extraindo dados únicos...');

    // Usando DISTINCT para evitar as 9 milhões de repetições de contracheque
    const query = `SELECT DISTINCT NOMFUN, CPF, MATCON, LOTACAO FROM ${tableName}`;
    
    const result = await connection.execute(query, [], { 
      outFormat: oracledb.OUT_FORMAT_OBJECT,
      maxRows: 100000 // Garante que a biblioteca não pare no limite padrão
    });
    const servidores: any[] = result.rows || [];

    console.log(`[ORACLE SYNC] ${servidores.length} servidores encontrados. Iniciando atualização no banco local...`);

    let atualizados = 0;
    let criados = 0; // Para Tabela Espelho, tudo é "sincronizado", podemos somar

    for (const srv of servidores) {
      const nome = srv.NOMFUN || srv.NOME || srv.NOME_SERVIDOR || 'Servidor Sem Nome';
      const matricula = srv.MATCON?.toString() || srv.MATRICULA?.toString() || null;
      let cpf = srv.CPF?.toString() || null;
      const lotacao = srv.LOTACAO || null;

      if (!cpf) continue; // Ignora se não houver CPF, pois é a chave primária
      
      cpf = cpf.replace(/\\D/g, ''); // Remove pontuação do CPF

      // Sincroniza na Tabela Espelho (Update or Insert)
      await prisma.servidorOracle.upsert({
        where: { cpf: cpf },
        update: {
          nome: nome,
          matricula: matricula,
          lotacao: lotacao
        },
        create: {
          cpf: cpf,
          nome: nome,
          matricula: matricula,
          lotacao: lotacao
        }
      });
      atualizados++;
    }

    console.log(`[ORACLE SYNC] Sincronização Finalizada. ${atualizados} registros processados na base espelho.`);
    return { success: true, message: `Base espelho sincronizada! ${atualizados} servidores processados.` };

  } catch (error) {
    console.error('[ORACLE SYNC] ERRO na sincronização:', error);
    return { success: false, message: 'Erro ao conectar ou executar no Oracle', error };
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error(err);
      }
    }
  }
}
