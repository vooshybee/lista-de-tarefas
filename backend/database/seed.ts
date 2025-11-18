/**
 * Script de Seed - Cria usuário admin inicial
 * 
 * Execute após a migração: npx ts-node database/seed.ts
 * 
 * IMPORTANTE: Altere a senha padrão após o primeiro login!
 */

import { Pool } from 'pg';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
});

async function seed() {
  try {
    console.log('🌱 Iniciando seed do banco de dados...');
    
    // Gera hash da senha padrão
    const defaultPassword = 'suasenha';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);
    
    // Insere usuário admin
    const result = await pool.query(
      `INSERT INTO users (name, email, password, role) 
       VALUES ($1, $2, $3, $4) 
       ON CONFLICT (email) DO NOTHING
       RETURNING id, name, email, role`,
      ['Administrador', 'seuemail@exemplo.com', hashedPassword, 'admin']
    );
    
    if (result.rows.length > 0) {
      console.log('✅ Usuário admin criado com sucesso!');
      console.log('\n📧 Credenciais de acesso:');
      console.log('   Email: seuemail@exemplo.com');
      console.log('   Senha: suasenha');
      console.log('\n⚠️  IMPORTANTE: Altere a senha após o primeiro login!');
    } else {
      console.log('ℹ️  Usuário admin já existe no banco de dados.');
    }
    
  } catch (error) {
    console.error('❌ Erro ao executar seed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seed();

