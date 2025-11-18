import dotenv from 'dotenv';
dotenv.config({ path: '.env.test' });

// Configuração global para testes
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key';
process.env.NODE_ENV = 'test';

