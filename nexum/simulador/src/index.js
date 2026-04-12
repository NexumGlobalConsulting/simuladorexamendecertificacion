import logger from "./utils/logger.js";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { errorHandler } from "./middleware/errorHandler.js";

import { questions } from "./modules/knowledge/questions.js";
import { evaluateSession } from "./modules/engine/evaluate.js";
// import { populateFullBank } from "./modules/ai_generator/orchestrator.js";

const app = express();

// 🔧 Compatibilidad __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares
app.use(cors());
app.use(express.json());

// 📦 Localización dinámica de la Simulation UI
const possiblePaths = [
    path.join(__dirname, "index.html"),
    path.join(__dirname, "..", "index.html")
];

const htmlPath = possiblePaths.find(p => fs.existsSync(p));

if (htmlPath) {
    console.log(`✅ Simulation UI localizada en: ${htmlPath}`);
    // Servir archivos estáticos desde la carpeta donde se encontró el HTML
    app.use(express.static(path.dirname(htmlPath)));
} else {
    console.error("❌ ERROR CRÍTICO: No se encontró index.html en src/ ni en la raíz.");
}

// Ruta principal
app.get("/", (req, res) => {
    if (htmlPath) {
        res.sendFile(htmlPath);
    } else {
        res.status(404).send("Error: index.html no encontrado.");
    }
});

// Endpoint de administración para regenerar el banco
// app.post("/api/admin/generate-bank", async (req, res) => {
//     try {
//         const newBank = await populateFullBank();
//         res.json({ message: "Banco generado con éxito", total: newBank.length });
//     } catch (error) {
//         res.status(500).json({ error: "Fallo en la generación dinámica" });
//     }
// });
// 
// 📚 API: Obtener blueprint de preguntas (Seguro)
app.get('/api/questions', (req, res) => {
    res.json(questions);
});

// 🧠 API: Motor de Evaluación (Engine Central)
app.post("/api/submit", (req, res) => {
    const { answers } = req.body;

    if (!Array.isArray(answers)) {
        return res.status(400).json({ error: "Formato de respuestas inválido." });
    }

    const result = evaluateSession(questions, answers);
    res.json(result);
});

app.get("/api/test-error", (req, res, next) => {
  next(new Error("Error de prueba Nexum"));
});

// 👇 SIEMPRE AL FINAL DE RUTAS
app.use(errorHandler);

// 🚀 Servidor
const PORT = 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`[NEXUM] 🔥 Engine activo en: http://localhost:${PORT}`);
});