/**
 * Factory Pattern (Criacional)
 * 
 * Propósito: Criar diferentes tipos de validadores de tarefas sem expor
 * a lógica de criação ao cliente e permitir adicionar novos tipos facilmente.
 * 
 * Problema resolvido: Evita acoplamento forte entre o código cliente e
 * as classes concretas de validadores, facilitando a extensão e manutenção.
 */

export interface TaskValidator {
  validate(title: string, description?: string): { isValid: boolean; error?: string };
}

export class BasicTaskValidator implements TaskValidator {
  validate(title: string, description?: string): { isValid: boolean; error?: string } {
    if (!title || title.trim().length === 0) {
      return { isValid: false, error: "Título é obrigatório" };
    }
    if (title.length > 200) {
      return { isValid: false, error: "Título não pode ter mais de 200 caracteres" };
    }
    if (description && description.length > 1000) {
      return { isValid: false, error: "Descrição não pode ter mais de 1000 caracteres" };
    }
    return { isValid: true };
  }
}

export class StrictTaskValidator implements TaskValidator {
  validate(title: string, description?: string): { isValid: boolean; error?: string } {
    if (!title || title.trim().length === 0) {
      return { isValid: false, error: "Título é obrigatório" };
    }
    if (title.length < 5) {
      return { isValid: false, error: "Título deve ter pelo menos 5 caracteres" };
    }
    if (title.length > 200) {
      return { isValid: false, error: "Título não pode ter mais de 200 caracteres" };
    }
    if (!description || description.trim().length === 0) {
      return { isValid: false, error: "Descrição é obrigatória" };
    }
    if (description.length < 10) {
      return { isValid: false, error: "Descrição deve ter pelo menos 10 caracteres" };
    }
    if (description.length > 1000) {
      return { isValid: false, error: "Descrição não pode ter mais de 1000 caracteres" };
    }
    return { isValid: true };
  }
}

export type ValidatorType = 'basic' | 'strict';

export class TaskValidatorFactory {
  static create(type: ValidatorType): TaskValidator {
    switch (type) {
      case 'basic':
        return new BasicTaskValidator();
      case 'strict':
        return new StrictTaskValidator();
      default:
        return new BasicTaskValidator();
    }
  }
}

