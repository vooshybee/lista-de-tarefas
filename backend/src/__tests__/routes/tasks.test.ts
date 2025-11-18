import request from 'supertest';
import express from 'express';
import taskRoutes from '../../routes/tasks';
import { authenticateJWT } from '../../middleware/authenticateJWT';
import jwt from 'jsonwebtoken';

// Mock do DatabaseAdapter
jest.mock('../../patterns/adapter/DatabaseAdapter', () => {
  const mockAdapter = {
    findAll: jest.fn(),
    findById: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };
  return {
    DatabaseAdapterSingleton: {
      getInstance: jest.fn(() => mockAdapter),
    },
    PostgreSQLAdapter: jest.fn(),
  };
});

// Mock do TaskValidatorFactory
jest.mock('../../patterns/factory/TaskValidatorFactory', () => {
  const mockValidator = {
    validate: jest.fn(() => ({ isValid: true })),
  };
  return {
    TaskValidatorFactory: {
      create: jest.fn(() => mockValidator),
    },
  };
});

import { DatabaseAdapterSingleton } from '../../patterns/adapter/DatabaseAdapter';
import { TaskValidatorFactory } from '../../patterns/factory/TaskValidatorFactory';

const app = express();
app.use(express.json());
app.use(authenticateJWT);
app.use('/tasks', taskRoutes);

const JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

function generateToken(role: string = 'admin') {
  return jwt.sign({ id: 1, role }, JWT_SECRET);
}

describe('Tasks Routes - Integration Tests', () => {
  let mockDb: any;
  let mockValidator: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockDb = DatabaseAdapterSingleton.getInstance();
    mockValidator = TaskValidatorFactory.create('basic');
  });

  describe('GET /tasks', () => {
    it('deve listar todas as tarefas', async () => {
      const mockTasks = [
        { id: 1, title: 'Tarefa 1', description: 'Descrição 1' },
        { id: 2, title: 'Tarefa 2', description: 'Descrição 2' },
      ];
      mockDb.findAll.mockResolvedValue(mockTasks);

      const response = await request(app)
        .get('/tasks')
        .set('Authorization', `Bearer ${generateToken('admin')}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockTasks);
      expect(mockDb.findAll).toHaveBeenCalledWith('tasks', 'id DESC');
    });
  });

  describe('GET /tasks/:id', () => {
    it('deve retornar uma tarefa específica', async () => {
      const mockTask = { id: 1, title: 'Tarefa 1', description: 'Descrição 1' };
      mockDb.findById.mockResolvedValue(mockTask);

      const response = await request(app)
        .get('/tasks/1')
        .set('Authorization', `Bearer ${generateToken('admin')}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockTask);
      expect(mockDb.findById).toHaveBeenCalledWith('tasks', 1);
    });

    it('deve retornar 404 quando tarefa não encontrada', async () => {
      mockDb.findById.mockResolvedValue(null);

      const response = await request(app)
        .get('/tasks/999')
        .set('Authorization', `Bearer ${generateToken('admin')}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Tarefa não encontrada');
    });
  });

  describe('POST /tasks', () => {
    it('deve criar uma nova tarefa com validação', async () => {
      const newTask = { title: 'Nova Tarefa', description: 'Descrição' };
      const createdTask = { id: 1, ...newTask };
      
      mockValidator.validate.mockReturnValue({ isValid: true });
      mockDb.insert.mockResolvedValue(createdTask);

      const response = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${generateToken('admin')}`)
        .send(newTask);

      expect(response.status).toBe(201);
      expect(response.body).toEqual(createdTask);
      expect(mockValidator.validate).toHaveBeenCalledWith(newTask.title, newTask.description);
      expect(mockDb.insert).toHaveBeenCalledWith('tasks', newTask);
    });

    it('deve retornar erro quando validação falhar', async () => {
      mockValidator.validate.mockReturnValue({
        isValid: false,
        error: 'Título é obrigatório',
      });

      const response = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${generateToken('admin')}`)
        .send({ description: 'Sem título' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Título é obrigatório');
      expect(mockDb.insert).not.toHaveBeenCalled();
    });
  });

  describe('PUT /tasks/:id', () => {
    it('deve atualizar uma tarefa existente', async () => {
      const existingTask = { id: 1, title: 'Tarefa Antiga', description: 'Descrição Antiga', status: 'pendente' };
      const updatedTask = { ...existingTask, title: 'Tarefa Atualizada' };
      
      mockDb.findById.mockResolvedValue(existingTask);
      mockValidator.validate.mockReturnValue({ isValid: true });
      mockDb.update.mockResolvedValue(updatedTask);

      const response = await request(app)
        .put('/tasks/1')
        .set('Authorization', `Bearer ${generateToken('admin')}`)
        .send({ title: 'Tarefa Atualizada' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(updatedTask);
      expect(mockDb.update).toHaveBeenCalledWith('tasks', 1, { title: 'Tarefa Atualizada' });
    });

    it('deve retornar 404 quando tarefa não encontrada', async () => {
      mockDb.findById.mockResolvedValue(null);

      const response = await request(app)
        .put('/tasks/999')
        .set('Authorization', `Bearer ${generateToken('admin')}`)
        .send({ title: 'Atualizada' });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Tarefa não encontrada');
    });
  });

  describe('DELETE /tasks/:id', () => {
    it('deve deletar uma tarefa', async () => {
      mockDb.delete.mockResolvedValue(true);

      const response = await request(app)
        .delete('/tasks/1')
        .set('Authorization', `Bearer ${generateToken('admin')}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Tarefa removida com sucesso');
      expect(mockDb.delete).toHaveBeenCalledWith('tasks', 1);
    });

    it('deve retornar 404 quando tarefa não encontrada', async () => {
      mockDb.delete.mockResolvedValue(false);

      const response = await request(app)
        .delete('/tasks/999')
        .set('Authorization', `Bearer ${generateToken('admin')}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Tarefa não encontrada');
    });
  });
});

