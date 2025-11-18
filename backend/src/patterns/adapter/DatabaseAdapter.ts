/**
 * Adapter Pattern (Estrutural)
 * 
 * Propósito: Permite que classes com interfaces incompatíveis trabalhem juntas,
 * convertendo a interface de uma classe em outra interface esperada pelo cliente.
 * 
 * Problema resolvido: Abstrai o acesso ao banco de dados, permitindo trocar
 * facilmente entre PostgreSQL, MongoDB, ou outros bancos sem modificar o código cliente.
 */

import { Pool, QueryResult } from 'pg';
import { pool } from '../../db';

export interface DatabaseAdapter {
  query<T = any>(text: string, params?: any[]): Promise<T[]>;
  findById<T = any>(table: string, id: number): Promise<T | null>;
  findAll<T = any>(table: string, orderBy?: string): Promise<T[]>;
  insert<T = any>(table: string, data: Record<string, any>, returning?: string[]): Promise<T>;
  update<T = any>(table: string, id: number, data: Record<string, any>, returning?: string[]): Promise<T | null>;
  delete(table: string, id: number): Promise<boolean>;
}

export class PostgreSQLAdapter implements DatabaseAdapter {
  constructor(private pool: Pool) {}

  async query<T = any>(text: string, params?: any[]): Promise<T[]> {
    const result: QueryResult = await this.pool.query(text, params);
    return result.rows as T[];
  }

  async findById<T = any>(table: string, id: number): Promise<T | null> {
    const result = await this.query<T>(`SELECT * FROM ${table} WHERE id = $1`, [id]);
    return result.length > 0 ? result[0] : null;
  }

  async findAll<T = any>(table: string, orderBy: string = 'id DESC'): Promise<T[]> {
    return this.query<T>(`SELECT * FROM ${table} ORDER BY ${orderBy}`);
  }

  async insert<T = any>(table: string, data: Record<string, any>, returning: string[] = ['*']): Promise<T> {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map((_, index) => `$${index + 1}`).join(', ');
    const returningClause = returning.join(', ');
    
    const query = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders}) RETURNING ${returningClause}`;
    const result = await this.query<T>(query, values);
    return result[0];
  }

  async update<T = any>(table: string, id: number, data: Record<string, any>, returning: string[] = ['*']): Promise<T | null> {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map((key, index) => `${key} = $${index + 1}`).join(', ');
    const returningClause = returning.join(', ');
    
    const query = `UPDATE ${table} SET ${placeholders} WHERE id = $${keys.length + 1} RETURNING ${returningClause}`;
    const result = await this.query<T>(query, [...values, id]);
    return result.length > 0 ? result[0] : null;
  }

  async delete(table: string, id: number): Promise<boolean> {
    const result = await this.query(`DELETE FROM ${table} WHERE id = $1 RETURNING id`, [id]);
    return result.length > 0;
  }
}

// Singleton para garantir uma única instância do adapter
export class DatabaseAdapterSingleton {
  private static instance: DatabaseAdapter;

  static getInstance(): DatabaseAdapter {
    if (!DatabaseAdapterSingleton.instance) {
      DatabaseAdapterSingleton.instance = new PostgreSQLAdapter(pool);
    }
    return DatabaseAdapterSingleton.instance;
  }
}

