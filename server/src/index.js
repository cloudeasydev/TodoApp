import "dotenv/config";
import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import { todosRouter } from "./routes/todos.js";

const app = express();
const port = Number(process.env.PORT) || 5000;
const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
  console.error("Missing MONGODB_URI. Add it to server/.env");
  process.exit(1);
}

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  }),
);
app.use(express.json());
app.use("/api/todos", todosRouter);

app.get("/api/health", (_req, res) => {
  const connected = mongoose.connection.readyState === 1;
  res.json({ ok: connected, database: connected ? "connected" : "disconnected" });
});

app.use((error, _req, res, _next) => {
  console.error(error);
  const status = error.status || 500;
  res.status(status).json({ message: error.message || "Server error" });
});

mongoose
  .connect(mongoUri)
  .then(() => {
    app.listen(port, () => {
      console.log(`API listening on http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  });
