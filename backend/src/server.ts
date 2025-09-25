import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { authenticateJWT } from "./middleware/authenticateJWT";


import taskRoutes from "./routes/tasks";
import userRoutes from "./routes/users";
import authRoutes from "./routes/auth";

dotenv.config();
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Rotas
app.use("/auth", authRoutes);

app.use(authenticateJWT);
app.use("/tasks", taskRoutes);
app.use("/users", userRoutes);

// Inicializa servidor
app.listen(PORT, () => console.log(`API rodando em http://localhost:${PORT}`));
