import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import fs from "fs";

const app = express();
const PORT = 3000;
const DB_FILE = "db.json";

// 🔑 Defina uma chave secreta (ideal usar .env)
const API_KEY = "euamobolaspeludas";

app.use(cors());
app.use(express.json());

// 🔑 Middleware de autenticação
function authenticate(req: Request, res: Response, next: NextFunction) {
  const key = req.headers["x-api-key"];
  if (key !== API_KEY) {
    return res.status(401).json({ error: "Acesso negado: chave inválida ou ausente" });
  }
  next();
}

// ✅ Aplique o middleware ANTES das rotas
app.use(authenticate);

// Tipo da Tarefa
interface Task {
  id: number;
  title: string;
  description: string;
  status: "pendente" | "concluída";
}

// Funções auxiliares
function loadTasks(): Task[] {
  if (!fs.existsSync(DB_FILE)) return [];
  return JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
}

function saveTasks(tasks: Task[]) {
  fs.writeFileSync(DB_FILE, JSON.stringify(tasks, null, 2));
}

// Rotas CRUD
app.get("/tasks", (req: Request, res: Response) => {
  res.json(loadTasks());
});

app.get("/tasks/:id", (req: Request, res: Response) => {
  const tasks = loadTasks();
  const id = parseInt(req.params.id);
  const task = tasks.find((t) => t.id === id);

  if (!task) return res.status(404).json({ error: "Tarefa não encontrada" });

  res.json(task);
});

app.post("/tasks", (req: Request, res: Response) => {
  const { title, description } = req.body;
  if (!title) return res.status(400).json({ error: "Título é obrigatório" });

  const tasks = loadTasks();
  const newTask: Task = {
    id: Date.now(),
    title,
    description,
    status: "pendente",
  };
  tasks.push(newTask);
  saveTasks(tasks);
  res.status(201).json(newTask);
});

app.put("/tasks/:id", (req: Request, res: Response) => {
  let tasks = loadTasks();
  const id = parseInt(req.params.id);
  const index = tasks.findIndex((t) => t.id === id);

  if (index === -1) return res.status(404).json({ error: "Tarefa não encontrada" });

  const updatedTask: Task = {
    ...tasks[index],
    title: req.body.title ?? tasks[index].title,
    description: req.body.description ?? tasks[index].description,
    status: req.body.status ?? tasks[index].status,
  };

  tasks[index] = updatedTask;
  saveTasks(tasks);
  res.json(updatedTask);
});

app.delete("/tasks/:id", (req: Request, res: Response) => {
  let tasks = loadTasks();
  const id = parseInt(req.params.id);
  const index = tasks.findIndex((t) => t.id === id);

  if (index === -1) return res.status(404).json({ error: "Tarefa não encontrada" });

  tasks.splice(index, 1);
  saveTasks(tasks);
  res.json({ message: "Tarefa removida com sucesso" });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`API rodando em http://localhost:${PORT}`);
});
