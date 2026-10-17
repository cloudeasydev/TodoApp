import { Router } from "express";
import mongoose from "mongoose";
import { Todo } from "../models/Todo.js";

export const todosRouter = Router();

function invalidId(id) {
  return !mongoose.Types.ObjectId.isValid(id);
}

todosRouter.get("/", async (_req, res, next) => {
  try {
    const todos = await Todo.find().sort({ createdAt: -1 });
    res.json(todos);
  } catch (error) {
    next(error);
  }
});

todosRouter.post("/", async (req, res, next) => {
  try {
    const title = String(req.body?.title ?? "").trim();
    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }
    const todo = await Todo.create({ title });
    res.status(201).json(todo);
  } catch (error) {
    next(error);
  }
});

todosRouter.patch("/:id", async (req, res, next) => {
  try {
    if (invalidId(req.params.id)) {
      return res.status(400).json({ message: "Invalid todo id" });
    }

    const updates = {};
    if (typeof req.body?.title === "string") {
      const title = req.body.title.trim();
      if (!title) {
        return res.status(400).json({ message: "Title cannot be empty" });
      }
      updates.title = title;
    }
    if (typeof req.body?.completed === "boolean") {
      updates.completed = req.body.completed;
    }
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "Nothing to update" });
    }

    const todo = await Todo.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });
    if (!todo) {
      return res.status(404).json({ message: "Todo not found" });
    }
    res.json(todo);
  } catch (error) {
    next(error);
  }
});

todosRouter.delete("/:id", async (req, res, next) => {
  try {
    if (invalidId(req.params.id)) {
      return res.status(400).json({ message: "Invalid todo id" });
    }
    const todo = await Todo.findByIdAndDelete(req.params.id);
    if (!todo) {
      return res.status(404).json({ message: "Todo not found" });
    }
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});
