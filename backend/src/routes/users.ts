import { Router } from "express";
import { pool } from "../db";
import bcrypt from "bcrypt";
import { authorize } from "../middleware/authorize";

const router = Router();

// Listar usuários (admin)
router.get("/", authorize(["admin"]), async (_req, res) => {
  const result = await pool.query("SELECT id, name, email, role FROM users ORDER BY id ASC");
  res.json(result.rows);
});

// Criar usuário (admin)
router.post("/", authorize(["admin"]), async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role) return res.status(400).json({ error: "Todos os campos são obrigatórios" });

  const hashed = await bcrypt.hash(password, 10);
  const result = await pool.query(
    "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role",
    [name, email, hashed, role]
  );

  res.status(201).json(result.rows[0]);
});

// Atualizar usuário (admin e manager podem alterar nome/senha)
router.put("/:id", authorize(["admin", "manager"]), async (req, res) => {
  const { name, password } = req.body;
  const id = parseInt(req.params.id);

  const existing = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
  if (existing.rows.length === 0) return res.status(404).json({ error: "Usuário não encontrado" });

  let hashedPassword = existing.rows[0].password;
  if (password) hashedPassword = await bcrypt.hash(password, 10);

  const result = await pool.query(
    "UPDATE users SET name = $1, password = $2 WHERE id = $3 RETURNING id, name, email, role",
    [name ?? existing.rows[0].name, hashedPassword, id]
  );

  res.json(result.rows[0]);
});

// Deletar usuário (admin)
router.delete("/:id", authorize(["admin"]), async (req, res) => {
  const id = parseInt(req.params.id);
  const result = await pool.query("DELETE FROM users WHERE id = $1 RETURNING *", [id]);

  if (result.rowCount === 0) return res.status(404).json({ error: "Usuário não encontrado" });

  res.json({ message: "Usuário removido com sucesso" });
});

export default router;
