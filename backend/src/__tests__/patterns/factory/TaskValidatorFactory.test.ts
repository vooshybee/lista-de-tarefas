import { TaskValidatorFactory, BasicTaskValidator, StrictTaskValidator } from '../../../patterns/factory/TaskValidatorFactory';

describe('TaskValidatorFactory - Factory Pattern', () => {
  describe('create', () => {
    it('deve criar um BasicTaskValidator quando o tipo for "basic"', () => {
      const validator = TaskValidatorFactory.create('basic');
      expect(validator).toBeInstanceOf(BasicTaskValidator);
    });

    it('deve criar um StrictTaskValidator quando o tipo for "strict"', () => {
      const validator = TaskValidatorFactory.create('strict');
      expect(validator).toBeInstanceOf(StrictTaskValidator);
    });

    it('deve criar um BasicTaskValidator como padrão quando o tipo for inválido', () => {
      const validator = TaskValidatorFactory.create('invalid' as any);
      expect(validator).toBeInstanceOf(BasicTaskValidator);
    });
  });

  describe('BasicTaskValidator', () => {
    let validator: BasicTaskValidator;

    beforeEach(() => {
      validator = new BasicTaskValidator();
    });

    it('deve validar tarefa com título válido', () => {
      const result = validator.validate('Tarefa válida');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('deve rejeitar tarefa sem título', () => {
      const result = validator.validate('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Título é obrigatório');
    });

    it('deve rejeitar tarefa com título muito longo', () => {
      const longTitle = 'a'.repeat(201);
      const result = validator.validate(longTitle);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Título não pode ter mais de 200 caracteres');
    });

    it('deve rejeitar tarefa com descrição muito longa', () => {
      const longDescription = 'a'.repeat(1001);
      const result = validator.validate('Título válido', longDescription);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Descrição não pode ter mais de 1000 caracteres');
    });
  });

  describe('StrictTaskValidator', () => {
    let validator: StrictTaskValidator;

    beforeEach(() => {
      validator = new StrictTaskValidator();
    });

    it('deve validar tarefa com título e descrição válidos', () => {
      const result = validator.validate('Tarefa válida', 'Descrição válida com mais de 10 caracteres');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('deve rejeitar tarefa sem título', () => {
      const result = validator.validate('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Título é obrigatório');
    });

    it('deve rejeitar tarefa com título muito curto', () => {
      const result = validator.validate('1234');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Título deve ter pelo menos 5 caracteres');
    });

    it('deve rejeitar tarefa sem descrição', () => {
      const result = validator.validate('Título válido');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Descrição é obrigatória');
    });

    it('deve rejeitar tarefa com descrição muito curta', () => {
      const result = validator.validate('Título válido', 'curta');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Descrição deve ter pelo menos 10 caracteres');
    });
  });
});

