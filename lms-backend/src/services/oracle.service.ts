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

    // Usando DISTINCT para evitar repetições
    const query = `SELECT DISTINCT NOMFUN, MATCON FROM ${tableName} WHERE MATCON IS NOT NULL`;
    
    const result = await connection.execute(query, [], { 
      outFormat: oracledb.OUT_FORMAT_OBJECT,
      maxRows: 100000 
    });
    const servidores: any[] = result.rows || [];

    console.log(`[ORACLE SYNC] ${servidores.length} matrículas encontradas. Iniciando atualização...`);

    let atualizados = 0;

    // Limpa a tabela atual para não termos que fazer 37 mil upserts um por um
    console.log('[ORACLE SYNC] Limpando dados antigos...');
    await prisma.servidorOracle.deleteMany({});

    // Transforma os dados no formato do Prisma
    const dadosParaInserir = servidores
      .map(srv => {
        const nome = srv.NOMFUN || srv.NOME || srv.NOME_SERVIDOR || 'Servidor Sem Nome';
        const matricula = srv.MATCON?.toString() || srv.MATRICULA?.toString();
        return { nome, matricula };
      })
      .filter(srv => srv.matricula); // Garante que só passa se tiver matrícula

    // Insere em lotes de 5000 para ser ultrarrápido e não dar timeout
    const TAMANHO_LOTE = 5000;
    for (let i = 0; i < dadosParaInserir.length; i += TAMANHO_LOTE) {
      const lote = dadosParaInserir.slice(i, i + TAMANHO_LOTE);
      await prisma.servidorOracle.createMany({
        data: lote,
        skipDuplicates: true
      });
      atualizados += lote.length;
      console.log(`[ORACLE SYNC] Inseridos ${atualizados} de ${dadosParaInserir.length}...`);
    }

    console.log(`[ORACLE SYNC] Sincronização concluída! ${atualizados} matrículas salvas na nuvem.`);

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
