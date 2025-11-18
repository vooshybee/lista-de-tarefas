# 📌 API de Tarefas (To-Do)

Esta é uma API simples para gerenciamento de tarefas com **CRUD completo** e **autenticação por token**.  
Ela permite **criar, listar, buscar por ID, atualizar e excluir tarefas**.

---

## 🚀 Como Rodar o Projeto

1. **Instale as dependências**:
```bash
npm install
```

2. **Configure as variáveis de ambiente**:
   - Crie um arquivo `.env` na raiz do diretório `backend/`
   - Configure pelo menos: `DB_PASSWORD`, `JWT_SECRET`, `DB_NAME`
   
   **Template mínimo:**
   ```env
   DB_USER=postgres
   DB_HOST=localhost
   DB_NAME=todolist
   DB_PASSWORD=sua_senha
   DB_PORT=5432
   JWT_SECRET=seu-jwt-secret-super-seguro
   PORT=3000
   ```

3. **Configure o banco de dados PostgreSQL**:
   - Certifique-se de que o PostgreSQL está rodando
   - Crie um banco de dados com o nome especificado em `DB_NAME`
   - Ajuste as credenciais em `.env` conforme necessário

4. **Execute a migração do banco de dados**:
```bash
# Cria as tabelas necessárias
npm run migrate

# (Opcional) Cria usuário admin inicial com credenciais de exemplo
npm run seed
```
   
   **Nota:** O seed cria um usuário admin com email `seuemail@exemplo.com` e senha `suasenha`. 
   **IMPORTANTE:** Altere essas credenciais no arquivo `database/seed.ts` antes de executar, ou delete o usuário após criar suas próprias credenciais.
   
   **Ou execute manualmente no pgAdmin4:**
   - Abra o arquivo `database/schema.sql` e execute no seu banco de dados

5. **Inicie o servidor**:
```bash
npm run dev    # Modo desenvolvimento
# ou
npm start      # Modo produção (após build)
```

6. **Para o frontend**:
```bash
cd ../frontend
npx serve .
```

O servidor estará rodando em:  
👉 `http://localhost:3000`

---

## 🔑 Autenticação

Todas as requisições devem incluir o **token de autenticação** no header:  

```
Authorization: Bearer meu-token-secreto
```

> ⚠️ Se o token estiver ausente ou incorreto, a API retornará **401 - Não autorizado**.

---

## 📚 Endpoints

### 🔍 Listar todas as tarefas
**GET** `/tasks`

**Exemplo de requisição (cURL):**
```bash
curl -X GET http://localhost:3000/tasks   -H "Authorization: Bearer meu-token-secreto"
```

---

### 🔎 Buscar tarefa por ID
**GET** `/tasks/:id`

**Exemplo:**
```bash
curl -X GET http://localhost:3000/tasks/1   -H "Authorization: Bearer meu-token-secreto"
```

---

### ➕ Criar nova tarefa
**POST** `/tasks`

**Body JSON:**
```json
{
  "title": "Estudar Node.js",
  "description": "Praticar CRUD com Express",
  "status": "pendente"
}
```

---

### ✏️ Atualizar tarefa
**PUT** `/tasks/:id`

**Body JSON:**
```json
{
  "title": "Estudar Express",
  "description": "Revisar middlewares",
  "status": "concluída"
}
```

---

### 🗑️ Deletar tarefa
**DELETE** `/tasks/:id`

---

## 👥 Endpoints de Usuários

### 🔍 Listar usuários (admin)
**GET** `/users`

### ➕ Criar usuário (admin)
**POST** `/users`

**Body JSON:**
```json
{
  "name": "João Silva",
  "email": "joao@example.com",
  "password": "senha123",
  "role": "manager"
}
```

### ✏️ Atualizar usuário (admin/manager)
**PUT** `/users/:id`

**Body JSON:**
```json
{
  "name": "João Silva Atualizado",
  "password": "novaSenha123"
}
```

### 🗑️ Deletar usuário (admin)
**DELETE** `/users/:id`

---

## 🔐 Endpoints de Autenticação

### 🔑 Login
**POST** `/auth/login`

**Body JSON:**
```json
{
  "email": "admin@example.com",
  "password": "senha123"
}
```

**Resposta:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "Administrador",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

---

## ✅ Observações

- O sistema utiliza **autenticação JWT** com tokens que expiram em 2 horas.
- O acesso às rotas é protegido por autenticação e autorização baseada em roles (admin, manager, viewer).
- O armazenamento é feito em **PostgreSQL** com migrações automatizadas.
- O seed cria um usuário admin inicial com credenciais de exemplo que devem ser alteradas.

---

## 🧪 Testes (TDD)

O projeto utiliza **Test-Driven Development (TDD)** com Jest e Supertest.

### Executar testes:
```bash
npm test              # Executa todos os testes
npm run test:watch    # Executa testes em modo watch
npm run test:coverage # Executa testes com cobertura
```

### Estrutura de testes:
- `src/__tests__/patterns/` - Testes unitários dos padrões de design
- `src/__tests__/routes/` - Testes de integração das rotas

---

## 🎨 Design Patterns Utilizados

Este projeto implementa três padrões de design fundamentais, um de cada categoria:

### 1. Factory Pattern (Criacional)

**Propósito:** Criar diferentes tipos de validadores de tarefas sem expor a lógica de criação ao cliente, permitindo adicionar novos tipos facilmente.

**Problema Resolvido:** Evita acoplamento forte entre o código cliente e as classes concretas de validadores. Antes, a validação estava hardcoded nas rotas, dificultando a manutenção e extensão. Agora, podemos facilmente adicionar novos tipos de validadores (ex: `PremiumTaskValidator`, `MinimalTaskValidator`) sem modificar o código existente.

**Localização:** `src/patterns/factory/TaskValidatorFactory.ts`

**Trecho de Código:**
```typescript
// Factory cria validadores baseado no tipo
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

// Uso na rota de tarefas
const validatorType = process.env.TASK_VALIDATOR_TYPE || 'basic';
const taskValidator = TaskValidatorFactory.create(validatorType);

// Validação desacoplada
const validation = taskValidator.validate(title, description);
if (!validation.isValid) {
  return res.status(400).json({ error: validation.error });
}
```

**Benefícios:**
- Facilita adicionar novos tipos de validadores
- Centraliza a lógica de criação
- Permite configurar o tipo via variável de ambiente

---

### 2. Adapter Pattern (Estrutural)

**Propósito:** Permite que classes com interfaces incompatíveis trabalhem juntas, convertendo a interface de uma classe em outra interface esperada pelo cliente.

**Problema Resolvido:** Abstrai o acesso ao banco de dados, permitindo trocar facilmente entre PostgreSQL, MongoDB, ou outros bancos sem modificar o código cliente. Antes, as rotas estavam diretamente acopladas ao `pool` do PostgreSQL, tornando impossível trocar de banco sem reescrever todo o código.

**Localização:** `src/patterns/adapter/DatabaseAdapter.ts`

**Trecho de Código:**
```typescript
// Interface comum para diferentes bancos de dados
export interface DatabaseAdapter {
  query<T = any>(text: string, params?: any[]): Promise<T[]>;
  findById<T = any>(table: string, id: number): Promise<T | null>;
  findAll<T = any>(table: string, orderBy?: string): Promise<T[]>;
  insert<T = any>(table: string, data: Record<string, any>): Promise<T>;
  update<T = any>(table: string, id: number, data: Record<string, any>): Promise<T | null>;
  delete(table: string, id: number): Promise<boolean>;
}

// Implementação para PostgreSQL
export class PostgreSQLAdapter implements DatabaseAdapter {
  async findAll<T = any>(table: string, orderBy: string = 'id DESC'): Promise<T[]> {
    return this.query<T>(`SELECT * FROM ${table} ORDER BY ${orderBy}`);
  }
  // ... outros métodos
}

// Uso nas rotas (desacoplado do banco específico)
const db = DatabaseAdapterSingleton.getInstance();
const tasks = await db.findAll("tasks", "id DESC");
```

**Benefícios:**
- Facilita migração entre diferentes bancos de dados
- Código cliente não precisa conhecer detalhes de implementação
- Permite criar adapters para MongoDB, MySQL, etc. sem alterar rotas

---

### 3. Strategy Pattern (Comportamental)

**Propósito:** Define uma família de algoritmos, encapsula cada um deles e os torna intercambiáveis. Permite que o algoritmo varie independentemente dos clientes que o utilizam.

**Problema Resolvido:** Remove condicionais complexas de autorização e permite adicionar novas estratégias de autorização sem modificar o código existente. Antes, a autorização usava apenas verificação simples de roles. Agora, podemos facilmente alternar entre estratégias baseadas em roles, hierarquia, ou regras estritas.

**Localização:** `src/patterns/strategy/AuthorizationStrategy.ts`

**Trecho de Código:**
```typescript
// Interface comum para estratégias de autorização
export interface AuthorizationStrategy {
  canAccess(userRole: string, requiredRoles: string[]): boolean;
  getErrorMessage(): string;
}

// Estratégia baseada em roles
export class RoleBasedAuthorizationStrategy implements AuthorizationStrategy {
  canAccess(userRole: string, requiredRoles: string[]): boolean {
    return requiredRoles.includes(userRole);
  }
}

// Estratégia hierárquica (admin > manager > viewer)
export class HierarchicalAuthorizationStrategy implements AuthorizationStrategy {
  private roleHierarchy: Record<string, number> = {
    'viewer': 1,
    'manager': 2,
    'admin': 3,
  };
  
  canAccess(userRole: string, requiredRoles: string[]): boolean {
    const userLevel = this.roleHierarchy[userRole] || 0;
    const minRequiredLevel = Math.min(...requiredRoles.map(r => this.roleHierarchy[r] || 0));
    return userLevel >= minRequiredLevel;
  }
}

// Contexto que usa a estratégia
export class AuthorizationContext {
  constructor(private strategy: AuthorizationStrategy) {}
  
  authorize(req: Request, requiredRoles: string[]): { authorized: boolean; error?: string } {
    if (!req.user) return { authorized: false, error: "Usuário não autenticado" };
    
    const canAccess = this.strategy.canAccess(req.user.role, requiredRoles);
    return canAccess 
      ? { authorized: true }
      : { authorized: false, error: this.strategy.getErrorMessage() };
  }
}

// Uso no middleware
const strategyType = process.env.AUTH_STRATEGY || 'role-based';
const authStrategy = AuthorizationStrategyFactory.create(strategyType);
const authContext = new AuthorizationContext(authStrategy);
```

**Benefícios:**
- Permite trocar estratégias de autorização em runtime
- Facilita adicionar novas regras de autorização
- Remove condicionais complexas do código
- Cada estratégia pode ter sua própria lógica e mensagens de erro

---

## 📁 Estrutura do Projeto

```
backend/
├── database/
│   ├── schema.sql            # Schema do banco de dados
│   ├── migrate.ts            # Script de migração
│   └── seed.ts               # Script de seed (usuário admin)
├── src/
│   ├── patterns/
│   │   ├── factory/          # Factory Pattern
│   │   │   └── TaskValidatorFactory.ts
│   │   ├── adapter/          # Adapter Pattern
│   │   │   └── DatabaseAdapter.ts
│   │   └── strategy/         # Strategy Pattern
│   │       └── AuthorizationStrategy.ts
│   ├── routes/
│   │   ├── tasks.ts          # Usa Factory e Adapter
│   │   ├── users.ts
│   │   └── auth.ts
│   ├── middleware/
│   │   ├── authenticateJWT.ts
│   │   └── authorize.ts      # Usa Strategy
│   ├── __tests__/            # Testes TDD
│   │   ├── patterns/
│   │   └── routes/
│   ├── db.ts                 # Configuração do banco
│   ├── server.ts             # Servidor Express
│   └── types.d.ts            # Tipos TypeScript
├── .env                      # Variáveis de ambiente (não versionado)
├── jest.config.js            # Configuração do Jest
├── tsconfig.json             # Configuração do TypeScript
└── package.json
```

---

## 🔧 Configuração de Variáveis de Ambiente

Você pode configurar os padrões via variáveis de ambiente:

```env
# Tipo de validador: 'basic' ou 'strict'
TASK_VALIDATOR_TYPE=basic

# Estratégia de autorização: 'role-based', 'hierarchical' ou 'strict'
AUTH_STRATEGY=role-based
```