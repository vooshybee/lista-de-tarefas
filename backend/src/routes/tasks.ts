import { Router } from "express";
import { pool } from "../db";
import { authorize } from "../middleware/authorize";

const router = Router();

router.get("/", authorize(["admin","manager","viewer"]), async (_req, res) => {
  const result = await pool.query("SELECT * FROM tasks ORDER BY id DESC");
  res.json(result.rows);
});

router.get("/:id", authorize(["admin","manager","viewer"]), async (req, res) => {
  const id = parseInt(req.params.id);
  const result = await pool.query("SELECT * FROM tasks WHERE id = $1", [id]);
  if (result.rows.length === 0) return res.status(404).json({ error: "Tarefa não encontrada" });
  res.json(result.rows[0]);
});

router.post("/", authorize(["admin","manager"]), async (req, res) => {
  const { title, description } = req.body;
  if (!title) return res.status(400).json({ error: "Título é obrigatório" });

  const result = await pool.query(
    "INSERT INTO tasks (title, description) VALUES ($1, $2) RETURNING *",
    [title, description]
  );

  res.status(201).json(result.rows[0]);
});

router.put("/:id", authorize(["admin","manager"]), async (req, res) => {
  const id = parseInt(req.params.id);
  const { title, description, status } = req.body;

  const existing = await pool.query("SELECT * FROM tasks WHERE id = $1", [id]);
  if (existing.rows.length === 0) return res.status(404).json({ error: "Tarefa não encontrada" });

  const tarefa = existing.rows[0];
  const result = await pool.query(
    "UPDATE tasks SET title=$1, description=$2, status=$3 WHERE id=$4 RETURNING *",
    [title ?? tarefa.title, description ?? tarefa.description, status ?? tarefa.status, id]
  );

  res.json(result.rows[0]);
});

router.delete("/:id", authorize(["admin","manager"]), async (req, res) => {
  const id = parseInt(req.params.id);
  const result = await pool.query("DELETE FROM tasks WHERE id = $1 RETURNING *", [id]);
  if (result.rowCount === 0) return res.status(404).json({ error: "Tarefa não encontrada" });

  res.json({ message: "Tarefa removida com sucesso" });
});

export default router;
