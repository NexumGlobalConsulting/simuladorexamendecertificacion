import { generateNEXUMQuestion } from "./service.js";
import fs from "fs";

export async function populateFullBank() {
    const bank = [];
    
    // Configuración de rangos según tu instrucción
    const plan = [
        { range: [1, 25], comp: 1, topic: "Actuaciones Preparatorias" },
        { range: [26, 47], comp: 2, topic: "Fase de Selección" },
        { range: [48, 72], comp: 3, topic: "Ejecución Contractual" }
    ];

    console.log("🚀 Iniciando generación dinámica del banco NEXUM...");

    for (const group of plan) {
        for (let i = group.range[0]; i <= group.range[1]; i++) {
            const level = ["básico", "intermedio", "experto"][Math.floor(Math.random() * 3)];
            
            // Aquí el sistema extraería el fragmento de texto del PDF según el tema
            const context = "Texto extraído de la Ley 32069 relacionado con " + group.topic; 
            
            const question = await generateNEXUMQuestion(group.topic, group.comp, level, context);
            if (question) {
                question.id = `NEXUM-RX-${String(i).padStart(3, '0')}`;
                bank.push(question);
                console.log(`✅ Generada ${question.id} [C${group.comp} - ${level}]`);
            }
        }
    }

    // Persistencia en el sistema de archivos
    fs.writeFileSync('./src/modules/knowledge/dynamic_questions.json', JSON.stringify(bank, null, 2));
    return bank;
}