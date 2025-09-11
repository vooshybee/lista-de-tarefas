# 📌 API de Tarefas (To-Do)

Esta é uma API simples para gerenciamento de tarefas com **CRUD completo** e **autenticação por token**.  
Ela permite **criar, listar, buscar por ID, atualizar e excluir tarefas**.

---

## 🚀 Como Rodar o Projeto

1. **Instale as dependências**:
```bash
npm install
```

2. **Inicie o servidor**:
```bash
npm start ou npm run dev
npx serve . no frontend



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

## ✅ Observações

- O token estático foi usado para **atender ao requisito de autenticação**.  
- Não há cadastro de usuários, mas o acesso às rotas é protegido.  
- O armazenamento das tarefas é feito em arquivo JSON (`tasks.json`), simulando um banco de dados simples.