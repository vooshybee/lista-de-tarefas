import { Router } from "express";
import { authorize } from "../middleware/authorize";
import { DatabaseAdapterSingleton } from "../patterns/adapter/DatabaseAdapter";
import { TaskValidatorFactory } from "../patterns/factory/TaskValidatorFactory";

const router = Router();
const db = DatabaseAdapterSingleton.getInstance();

// Factory Pattern: Cria validador baseado no tipo (pode ser configurado via env)
const validatorType = (process.env.TASK_VALIDATOR_TYPE as 'basic' | 'strict') || 'basic';
const taskValidator = TaskValidatorFactory.create(validatorType);

router.get("/", authorize(["admin","manager","viewer"]), async (_req, res) => {
  const tasks = await db.findAll("tasks", "id DESC");
  res.json(tasks);
});

router.get("/:id", authorize(["admin","manager","viewer"]), async (req, res) => {
  const id = parseInt(req.params.id);
  const task = await db.findById("tasks", id);
  if (!task) return res.status(404).json({ error: "Tarefa não encontrada" });
  res.json(task);
});

router.post("/", authorize(["admin","manager"]), async (req, res) => {
  const { title, description } = req.body;
  
  // Factory Pattern: Usa o validador criado pela factory
  const validation = taskValidator.validate(title, description);
  if (!validation.isValid) {
    return res.status(400).json({ error: validation.error });
  }

  // Adapter Pattern: Usa o adapter para inserir no banco
  const task = await db.insert("tasks", { title, description });
  res.status(201).json(task);
});

router.put("/:id", authorize(["admin","manager"]), async (req, res) => {
  const id = parseInt(req.params.id);
  const { title, description, status } = req.body;

  // Adapter Pattern: Usa o adapter para buscar e atualizar
  const existing = await db.findById("tasks", id);
  if (!existing) return res.status(404).json({ error: "Tarefa não encontrada" });

  const updateData: Record<string, any> = {};
  if (title !== undefined) updateData.title = title;
  if (description !== undefined) updateData.description = description;
  if (status !== undefined) updateData.status = status;

  // Valida apenas se title ou description foram fornecidos
  if (title !== undefined || description !== undefined) {
    const validation = taskValidator.validate(
      title ?? existing.title,
      description ?? existing.description
    );
    if (!validation.isValid) {
      return res.status(400).json({ error: validation.error });
    }
  }

  const updated = await db.update("tasks", id, updateData);
  res.json(updated);
});

router.delete("/:id", authorize(["admin","manager"]), async (req, res) => {
  const id = parseInt(req.params.id);
  
  // Adapter Pattern: Usa o adapter para deletar
  const deleted = await db.delete("tasks", id);
  if (!deleted) return res.status(404).json({ error: "Tarefa não encontrada" });

  res.json({ message: "Tarefa removida com sucesso" });
});

export default router;
