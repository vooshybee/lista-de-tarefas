import { Request, Response, NextFunction } from "express";
import { AuthorizationContext, AuthorizationStrategyFactory } from "../patterns/strategy/AuthorizationStrategy";

// Strategy Pattern: Cria estratégia baseada na configuração (pode ser configurado via env)
const strategyType = (process.env.AUTH_STRATEGY as 'role-based' | 'hierarchical' | 'strict') || 'role-based';
const authStrategy = AuthorizationStrategyFactory.create(strategyType);
const authContext = new AuthorizationContext(authStrategy);

export function authorize(allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Strategy Pattern: Usa o contexto com a estratégia configurada
    const result = authContext.authorize(req, allowedRoles);
    
    if (!result.authorized) {
      return res.status(403).json({ error: result.error || "Permissão negada" });
    }
    
    next();
  };
}
