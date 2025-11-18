# 📋 Lista de Tarefas - API com Design Patterns e TDD

Projeto de API REST para gerenciamento de tarefas implementado com **TypeScript**, **Express**, **PostgreSQL**, utilizando **Design Patterns** e **Test-Driven Development (TDD)**.

## 🎯 Características

- ✅ **CRUD completo** de tarefas
- 🔐 **Autenticação JWT** e autorização por roles
- 🎨 **Design Patterns** implementados (Factory, Adapter, Strategy)
- 🧪 **Testes TDD** com Jest e Supertest
- 📚 **Documentação completa** no README do backend

## 🚀 Início Rápido

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npx serve .
```

## 📖 Documentação

Para mais detalhes sobre:
- **Endpoints da API**: Veja `backend/README.md`
- **Design Patterns**: Veja seção "Design Patterns Utilizados" em `backend/README.md`
- **Testes**: Veja seção "Testes (TDD)" em `backend/README.md`

## 🎨 Design Patterns Implementados

1. **Factory Pattern (Criacional)** - Validação de tarefas
2. **Adapter Pattern (Estrutural)** - Abstração de banco de dados
3. **Strategy Pattern (Comportamental)** - Estratégias de autorização

Veja detalhes completos em `backend/README.md`.

## 🧪 Testes

```bash
cd backend
npm test              # Executa todos os testes
npm run test:watch    # Modo watch
npm run test:coverage # Com cobertura
```

## 📁 Estrutura

```
lista-de-tarefas/
├── backend/          # API REST com TypeScript
│   ├── src/
│   │   ├── patterns/    # Design Patterns
│   │   ├── routes/      # Rotas da API
│   │   ├── middleware/  # Middlewares
│   │   └── __tests__/   # Testes TDD
│   └── README.md
└── frontend/        # Interface web
```

