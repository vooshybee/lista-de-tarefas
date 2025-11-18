import { DatabaseAdapter, PostgreSQLAdapter, DatabaseAdapterSingleton } from '../../../patterns/adapter/DatabaseAdapter';
import { Pool } from 'pg';

// Mock do Pool do PostgreSQL
jest.mock('../../../db', () => ({
  pool: {
    query: jest.fn(),
  } as unknown as Pool,
}));

import { pool } from '../../../db';

describe('DatabaseAdapter - Adapter Pattern', () => {
  let adapter: DatabaseAdapter;
  let mockPool: jest.Mocked<Pool>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPool = pool as jest.Mocked<Pool>;
    adapter = new PostgreSQLAdapter(mockPool);
  });

  describe('query', () => {
    it('deve executar uma query e retornar os resultados', async () => {
      const mockRows = [{ id: 1, name: 'Test' }];
      (mockPool.query as jest.Mock).mockResolvedValue({ rows: mockRows });

      const result = await adapter.query('SELECT * FROM test');
      
      expect(mockPool.query).toHaveBeenCalledWith('SELECT * FROM test', undefined);
      expect(result).toEqual(mockRows);
    });

    it('deve executar uma query com parâmetros', async () => {
      const mockRows = [{ id: 1 }];
      (mockPool.query as jest.Mock).mockResolvedValue({ rows: mockRows });

      const result = await adapter.query('SELECT * FROM test WHERE id = $1', [1]);
      
      expect(mockPool.query).toHaveBeenCalledWith('SELECT * FROM test WHERE id = $1', [1]);
      expect(result).toEqual(mockRows);
    });
  });

  describe('findById', () => {
    it('deve encontrar um registro por ID', async () => {
      const mockRow = { id: 1, name: 'Test' };
      (mockPool.query as jest.Mock).mockResolvedValue({ rows: [mockRow] });

      const result = await adapter.findById('users', 1);
      
      expect(mockPool.query).toHaveBeenCalledWith('SELECT * FROM users WHERE id = $1', [1]);
      expect(result).toEqual(mockRow);
    });

    it('deve retornar null quando não encontrar registro', async () => {
      (mockPool.query as jest.Mock).mockResolvedValue({ rows: [] });

      const result = await adapter.findById('users', 999);
      
      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('deve retornar todos os registros ordenados', async () => {
      const mockRows = [{ id: 1 }, { id: 2 }];
      (mockPool.query as jest.Mock).mockResolvedValue({ rows: mockRows });

      const result = await adapter.findAll('users');
      
      expect(mockPool.query).toHaveBeenCalledWith('SELECT * FROM users ORDER BY id DESC', undefined);
      expect(result).toEqual(mockRows);
    });

    it('deve aceitar orderBy customizado', async () => {
      const mockRows = [{ id: 1 }];
      (mockPool.query as jest.Mock).mockResolvedValue({ rows: mockRows });

      const result = await adapter.findAll('users', 'name ASC');
      
      expect(mockPool.query).toHaveBeenCalledWith('SELECT * FROM users ORDER BY name ASC', undefined);
      expect(result).toEqual(mockRows);
    });
  });

  describe('insert', () => {
    it('deve inserir um novo registro', async () => {
      const mockRow = { id: 1, name: 'Test', email: 'test@test.com' };
      (mockPool.query as jest.Mock).mockResolvedValue({ rows: [mockRow] });

      const data = { name: 'Test', email: 'test@test.com' };
      const result = await adapter.insert('users', data);
      
      expect(mockPool.query).toHaveBeenCalledWith(
        'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
        ['Test', 'test@test.com']
      );
      expect(result).toEqual(mockRow);
    });
  });

  describe('update', () => {
    it('deve atualizar um registro existente', async () => {
      const mockRow = { id: 1, name: 'Updated' };
      (mockPool.query as jest.Mock).mockResolvedValue({ rows: [mockRow] });

      const data = { name: 'Updated' };
      const result = await adapter.update('users', 1, data);
      
      expect(mockPool.query).toHaveBeenCalledWith(
        'UPDATE users SET name = $1 WHERE id = $2 RETURNING *',
        ['Updated', 1]
      );
      expect(result).toEqual(mockRow);
    });

    it('deve retornar null quando não encontrar registro para atualizar', async () => {
      (mockPool.query as jest.Mock).mockResolvedValue({ rows: [] });

      const result = await adapter.update('users', 999, { name: 'Updated' });
      
      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('deve deletar um registro e retornar true', async () => {
      (mockPool.query as jest.Mock).mockResolvedValue({ rows: [{ id: 1 }] });

      const result = await adapter.delete('users', 1);
      
      expect(mockPool.query).toHaveBeenCalledWith('DELETE FROM users WHERE id = $1 RETURNING id', [1]);
      expect(result).toBe(true);
    });

    it('deve retornar false quando não encontrar registro para deletar', async () => {
      (mockPool.query as jest.Mock).mockResolvedValue({ rows: [] });

      const result = await adapter.delete('users', 999);
      
      expect(result).toBe(false);
    });
  });

  describe('DatabaseAdapterSingleton', () => {
    it('deve retornar a mesma instância em múltiplas chamadas', () => {
      const instance1 = DatabaseAdapterSingleton.getInstance();
      const instance2 = DatabaseAdapterSingleton.getInstance();
      
      expect(instance1).toBe(instance2);
    });
  });
});

