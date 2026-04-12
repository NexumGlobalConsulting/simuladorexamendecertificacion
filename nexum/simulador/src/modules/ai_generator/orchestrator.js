import { generateNEXUMQuestion } from "./service.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BANK_PATH = path.join(__dirname, "..", "knowledge", "dynamic_questions.json");

// Pausa fundamental para respetar el Rate Limit de la cuenta gratuita de Groq
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export async function populateCompetency(compNumber) {
    const configs = {
        1: { range: [1, 25], topic: "Actuaciones Preparatorias" },
        2: { range: [26, 47], topic: "Fase de Selección" },
        3: { range: [48, 72], topic: "Ejecución Contractual" }
    };

    const config = configs[compNumber];
    if (!config) throw new Error("Competencia inválida. Usa 1, 2 o 3.");

    console.log(`\n🚀 Generando Bloque: ${config.topic} (Items ${config.range[0]}-${config.range[1]})`);
    
    let bank = [];
    
    // Asegurarnos de que el directorio exista antes de leer/escribir
    const dir = path.dirname(BANK_PATH);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    // Leer el banco existente si lo hay
    if (fs.existsSync(BANK_PATH)) {
        try {
            const fileData = fs.readFileSync(BANK_PATH, 'utf-8');
            bank = fileData ? JSON.parse(fileData) : [];
        } catch (e) {
            console.warn("⚠️ No se pudo parsear el banco actual. Se iniciará uno nuevo.");
            bank = [];
        }
    }

    for (let i = config.range[0]; i <= config.range[1]; i++) {
        const levels = ["básico", "intermedio", "experto"];
        const level = levels[i % 3]; // Rota entre básico, intermedio y experto
        
        const context = `Artículos de la Ley 32069 relativos a ${config.topic}. Considerar umbral de 8 UIT para contratos menores y >50 UIT para apelaciones ante el Tribunal.`;

        const question = await generateNEXUMQuestion(config.topic, compNumber, level, context);
        
        if (question) {
            question.id = `NEXUM-RX-${String(i).padStart(3, '0')}`;
            bank = bank.filter(q => q.id !== question.id); // Evita duplicar el ID si ya existía
            bank.push(question);
            console.log(`✅ [${question.id}] Nivel: ${level} - Generada con éxito.`);
        } else {
            console.log(`⏩ [Item ${i}] Saltado por precaución de API o Rate Limit. Se reintentará luego.`);
        }

        // Espera de 3 segundos (Vital para que Groq no bloquee la cuenta gratuita)
        await sleep(3000);
    }

    // Ordenar por ID y guardar
    bank.sort((a, b) => a.id.localeCompare(b.id));
    fs.writeFileSync(BANK_PATH, JSON.stringify(bank, null, 2));
    console.log(`\n📦 Banco actualizado exitosamente en: ${BANK_PATH}`);
}