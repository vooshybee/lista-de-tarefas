/**
 * Strategy Pattern (Comportamental)
 * 
 * Propósito: Define uma família de algoritmos, encapsula cada um deles e
 * os torna intercambiáveis. Permite que o algoritmo varie independentemente
 * dos clientes que o utilizam.
 * 
 * Problema resolvido: Remove condicionais complexas de autorização e permite
 * adicionar novas estratégias de autorização sem modificar o código existente.
 */

import { Request } from 'express';

export interface AuthorizationStrategy {
  canAccess(userRole: string, requiredRoles: string[]): boolean;
  getErrorMessage(): string;
}

export class RoleBasedAuthorizationStrategy implements AuthorizationStrategy {
  canAccess(userRole: string, requiredRoles: string[]): boolean {
    return requiredRoles.includes(userRole);
  }

  getErrorMessage(): string {
    return "Permissão negada: você não tem o papel necessário para acessar este recurso";
  }
}

export class HierarchicalAuthorizationStrategy implements AuthorizationStrategy {
  private roleHierarchy: Record<string, number> = {
    'viewer': 1,
    'manager': 2,
    'admin': 3,
  };

  canAccess(userRole: string, requiredRoles: string[]): boolean {
    const userLevel = this.roleHierarchy[userRole] || 0;
    const requiredLevels = requiredRoles.map(role => this.roleHierarchy[role] || 0);
    const minRequiredLevel = Math.min(...requiredLevels);
    return userLevel >= minRequiredLevel;
  }

  getErrorMessage(): string {
    return "Permissão negada: seu nível de acesso é insuficiente";
  }
}

export class StrictAuthorizationStrategy implements AuthorizationStrategy {
  canAccess(userRole: string, requiredRoles: string[]): boolean {
    // Apenas admin pode acessar
    return userRole === 'admin' && requiredRoles.includes('admin');
  }

  getErrorMessage(): string {
    return "Permissão negada: apenas administradores podem acessar este recurso";
  }
}

export class AuthorizationContext {
  private strategy: AuthorizationStrategy;

  constructor(strategy: AuthorizationStrategy) {
    this.strategy = strategy;
  }

  setStrategy(strategy: AuthorizationStrategy): void {
    this.strategy = strategy;
  }

  authorize(req: Request, requiredRoles: string[]): { authorized: boolean; error?: string } {
    if (!req.user) {
      return { authorized: false, error: "Usuário não autenticado" };
    }

    const userRole = req.user.role;
    const canAccess = this.strategy.canAccess(userRole, requiredRoles);

    if (!canAccess) {
      return { authorized: false, error: this.strategy.getErrorMessage() };
    }

    return { authorized: true };
  }
}

// Factory para criar estratégias de autorização
export class AuthorizationStrategyFactory {
  static create(type: 'role-based' | 'hierarchical' | 'strict'): AuthorizationStrategy {
    switch (type) {
      case 'role-based':
        return new RoleBasedAuthorizationStrategy();
      case 'hierarchical':
        return new HierarchicalAuthorizationStrategy();
      case 'strict':
        return new StrictAuthorizationStrategy();
      default:
        return new RoleBasedAuthorizationStrategy();
    }
  }
}

