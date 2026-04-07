import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import { questions } from "./modules/knowledge/questions.js";
import { evaluate } from "./modules/engine/evaluate.js";

const app = express();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootPath = path.resolve(__dirname, "..");

console.log("INICIANDO SERVIDOR...");

app.use(cors());
app.use(express.json());

// 🔥 SERVIR HTML
app.get("/", (req, res) => {
  res.sendFile(path.join(rootPath, "index.html"));
});

// 🔥 ENDPOINTS API (CRÍTICOS)
app.get("/questions", (req, res) => {
  res.json(questions);
});

app.post("/submit", (req, res) => {
  const { answers } = req.body;
  const result = evaluate(questions, answers);
  res.json(result);
});

// servidor
app.listen(3000, "0.0.0.0", () => {
  console.log("🔥 Servidor corriendo en puerto 3000");
});