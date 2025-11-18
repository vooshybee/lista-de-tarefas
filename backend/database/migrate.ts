/**
 * Script de Migração do Banco de Dados
 * 
 * Este script cria as tabelas necessárias no banco de dados PostgreSQL.
 * Execute: npx ts-node database/migrate.ts
 */

import { Pool } from 'pg';
import dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
});

async function migrate() {
  try {
    console.log('🔄 Iniciando migração do banco de dados...');
    
    // Lê o arquivo SQL (caminho relativo ao diretório do script)
    const sqlPath = path.join(__dirname, 'schema.sql');
    let sql: string;
    
    try {
      sql = fs.readFileSync(sqlPath, 'utf8');
    } catch {
      // Se não encontrar, tenta caminho relativo ao diretório raiz
      const rootPath = path.join(process.cwd(), 'database', 'schema.sql');
      sql = fs.readFileSync(rootPath, 'utf8');
    }
    
    // Executa o SQL
    await pool.query(sql);
    
    console.log('✅ Migração concluída com sucesso!');
    console.log('\n📋 Tabelas criadas:');
    console.log('   - users');
    console.log('   - tasks');
    console.log('\n💡 Dica: Execute o script generateHash.ts para criar um hash de senha para o usuário admin.');
    
  } catch (error) {
    console.error('❌ Erro ao executar migração:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();

