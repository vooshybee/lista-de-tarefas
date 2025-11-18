import {
  AuthorizationStrategy,
  RoleBasedAuthorizationStrategy,
  HierarchicalAuthorizationStrategy,
  StrictAuthorizationStrategy,
  AuthorizationContext,
  AuthorizationStrategyFactory,
} from '../../../patterns/strategy/AuthorizationStrategy';
import { Request } from 'express';

describe('AuthorizationStrategy - Strategy Pattern', () => {
  describe('RoleBasedAuthorizationStrategy', () => {
    let strategy: RoleBasedAuthorizationStrategy;
    let context: AuthorizationContext;

    beforeEach(() => {
      strategy = new RoleBasedAuthorizationStrategy();
      context = new AuthorizationContext(strategy);
    });

    it('deve permitir acesso quando o usuário tem o papel necessário', () => {
      const mockReq = {
        user: { id: 1, role: 'admin' },
      } as Request;

      const result = context.authorize(mockReq, ['admin', 'manager']);
      
      expect(result.authorized).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('deve negar acesso quando o usuário não tem o papel necessário', () => {
      const mockReq = {
        user: { id: 1, role: 'viewer' },
      } as Request;

      const result = context.authorize(mockReq, ['admin', 'manager']);
      
      expect(result.authorized).toBe(false);
      expect(result.error).toContain('Permissão negada');
    });

    it('deve negar acesso quando o usuário não está autenticado', () => {
      const mockReq = {} as Request;

      const result = context.authorize(mockReq, ['admin']);
      
      expect(result.authorized).toBe(false);
      expect(result.error).toBe('Usuário não autenticado');
    });
  });

  describe('HierarchicalAuthorizationStrategy', () => {
    let strategy: HierarchicalAuthorizationStrategy;
    let context: AuthorizationContext;

    beforeEach(() => {
      strategy = new HierarchicalAuthorizationStrategy();
      context = new AuthorizationContext(strategy);
    });

    it('deve permitir acesso quando o nível do usuário é suficiente', () => {
      const mockReq = {
        user: { id: 1, role: 'admin' },
      } as Request;

      const result = context.authorize(mockReq, ['viewer', 'manager']);
      
      expect(result.authorized).toBe(true);
    });

    it('deve permitir acesso quando o nível do usuário é igual ao necessário', () => {
      const mockReq = {
        user: { id: 1, role: 'manager' },
      } as Request;

      const result = context.authorize(mockReq, ['manager']);
      
      expect(result.authorized).toBe(true);
    });

    it('deve negar acesso quando o nível do usuário é insuficiente', () => {
      const mockReq = {
        user: { id: 1, role: 'viewer' },
      } as Request;

      const result = context.authorize(mockReq, ['admin']);
      
      expect(result.authorized).toBe(false);
      expect(result.error).toContain('nível de acesso é insuficiente');
    });
  });

  describe('StrictAuthorizationStrategy', () => {
    let strategy: StrictAuthorizationStrategy;
    let context: AuthorizationContext;

    beforeEach(() => {
      strategy = new StrictAuthorizationStrategy();
      context = new AuthorizationContext(strategy);
    });

    it('deve permitir acesso apenas para admin', () => {
      const mockReq = {
        user: { id: 1, role: 'admin' },
      } as Request;

      const result = context.authorize(mockReq, ['admin']);
      
      expect(result.authorized).toBe(true);
    });

    it('deve negar acesso para não-admin mesmo que tenha outros papéis', () => {
      const mockReq = {
        user: { id: 1, role: 'manager' },
      } as Request;

      const result = context.authorize(mockReq, ['admin', 'manager']);
      
      expect(result.authorized).toBe(false);
      expect(result.error).toContain('apenas administradores');
    });
  });

  describe('AuthorizationContext', () => {
    it('deve permitir trocar de estratégia dinamicamente', () => {
      const context = new AuthorizationContext(new RoleBasedAuthorizationStrategy());
      const mockReq = {
        user: { id: 1, role: 'viewer' },
      } as Request;

      // Com role-based, viewer não tem acesso
      let result = context.authorize(mockReq, ['admin']);
      expect(result.authorized).toBe(false);

      // Troca para hierarchical, viewer pode acessar viewer
      context.setStrategy(new HierarchicalAuthorizationStrategy());
      result = context.authorize(mockReq, ['viewer']);
      expect(result.authorized).toBe(true);
    });
  });

  describe('AuthorizationStrategyFactory', () => {
    it('deve criar RoleBasedAuthorizationStrategy', () => {
      const strategy = AuthorizationStrategyFactory.create('role-based');
      expect(strategy).toBeInstanceOf(RoleBasedAuthorizationStrategy);
    });

    it('deve criar HierarchicalAuthorizationStrategy', () => {
      const strategy = AuthorizationStrategyFactory.create('hierarchical');
      expect(strategy).toBeInstanceOf(HierarchicalAuthorizationStrategy);
    });

    it('deve criar StrictAuthorizationStrategy', () => {
      const strategy = AuthorizationStrategyFactory.create('strict');
      expect(strategy).toBeInstanceOf(StrictAuthorizationStrategy);
    });
  });
});

