import oracledb from 'oracledb';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Carrega as variáveis do .env
dotenv.config();

// Ativa o Thick Mode
try {
  oracledb.initOracleClient({ libDir: 'C:\\oracle\\instantclient_12_1' });
} catch (err) {
  console.error('❌ Aviso: Cliente Oracle não inicializado.', err);
}

async function extrairSnapshot() {
  let connection;
  try {
    const user = process.env.ORACLE_USER;
    const password = process.env.ORACLE_PASSWORD;
    const connectString = process.env.ORACLE_CONNECTION_STRING;
    const tableName = process.env.ORACLE_TABLE_NAME;

    if (!user || !password || !connectString || !tableName) {
      console.error('❌ ERRO: Faltam credenciais no arquivo .env');
      console.log('Verifique se ORACLE_USER, ORACLE_PASSWORD, ORACLE_CONNECTION_STRING e ORACLE_TABLE_NAME estão preenchidos.');
      return;
    }

    console.log(`🔌 Conectando ao Oracle [Thick Mode] em [${connectString}]...`);
    
    connection = await oracledb.getConnection({
      user: user,
      password: password,
      connectString: connectString
    });

    console.log(`✅ Conectado com sucesso! Extraindo dados agrupados de [${tableName}]...`);

    // Busca apenas os funcionários únicos
    const query = `SELECT DISTINCT NOMFUN, CPF, MATCON, LOTACAO FROM ${tableName}`;
    
    const result = await connection.execute(query, [], { 
      outFormat: oracledb.OUT_FORMAT_OBJECT,
      maxRows: 100000 // Aumentado para pegar toda a base (até 100 mil)
    });

    const rows = result.rows as any[];
    
    if (rows.length === 0) {
      console.log('⚠️ A tabela ou view não retornou nenhuma linha (está vazia).');
      return;
    }

    console.log(`📦 ${rows.length} registros extraídos. Convertendo para arquivo CSV...`);

    // Pega o nome das colunas a partir do primeiro registro
    const colunas = Object.keys(rows[0]);
    
    // Cria o cabeçalho do CSV
    let csvContent = colunas.join(';') + '\n';

    // Preenche as linhas
    rows.forEach(row => {
      const linhaStr = colunas.map(coluna => {
        let valor = row[coluna];
        if (valor === null || valor === undefined) return '';
        // Remove quebras de linha e pontos e vírgulas para não quebrar o CSV
        if (typeof valor === 'string') {
          return valor.replace(/(\r\n|\n|\r)/gm, " ").replace(/;/g, ",");
        }
        return valor;
      }).join(';');
      csvContent += linhaStr + '\n';
    });

    // Salva o arquivo
    const filePath = path.join(__dirname, '..', 'snapshot_oracle.csv');
    fs.writeFileSync(filePath, csvContent, 'utf-8');

    console.log(`\n🎉 SUCESSO! Arquivo salvo em: ${filePath}`);
    console.log(`Você já pode abrir o arquivo 'snapshot_oracle.csv' no Excel para inspecionar os dados.`);

  } catch (error) {
    console.error('\n❌ ERRO FATAL AO CONECTAR OU EXECUTAR:', error);
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error('Erro ao fechar conexão:', err);
      }
    }
  }
}

extrairSnapshot();
