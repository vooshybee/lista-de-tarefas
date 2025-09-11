import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import taskRoutes from "./routes/tasks";

dotenv.config();

const app = express();
const PORT = 3000;
const API_KEY = process.env.API_KEY;

app.use(cors());
app.use(express.json());

// 🔐 Middleware de autenticação global
function authenticate(req: Request, res: Response, next: NextFunction) {
  const key = req.headers["x-api-key"];
  if (key !== API_KEY) {
    return res.status(401).json({ error: "Acesso negado: chave inválida ou ausente" });
  }
  next();
}

app.use(authenticate);

// Rotas das tarefas
app.use("/tasks", taskRoutes);

// Inicializa servidor
app.listen(PORT, () => {
  console.log(`API rodando em http://localhost:${PORT}`);
});
