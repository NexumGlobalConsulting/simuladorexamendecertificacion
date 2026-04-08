import fs from "fs";

export async function generateNEXUMQuestion(topic, competency, level, contextText) {

    const API_KEY = process.env.GROQ_API_KEY;
    const API_URL = "https://api.groq.com/openai/v1/chat/completions";

    if (!API_KEY) {
        console.error("❌ ERROR: GROQ_API_KEY no encontrada");
        return null;
    }

    // ===============================
    // 🧠 RAG NEXUM PRO (RETRIEVER)
    // ===============================
    function obtenerContexto(query) {
        try {
            const texto = fs.readFileSync("./data/normativa.txt", "utf-8");

            const fragmentos = texto.split("\n");

            const relevantes = fragmentos.filter(f =>
                f.toLowerCase().includes(query.toLowerCase())
            );

            return relevantes.slice(0, 8).join("\n");
        } catch (e) {
            console.error("⚠️ No se pudo leer normativa.txt");
            return "";
        }
    }

    const contextoLegal = obtenerContexto(topic);

    // ===============================
    // 🔥 PROMPT NEXUM PRO (CONTROL TOTAL)
    // ===============================
    const systemPrompt = `
Eres el Auditor Maestro de NEXUM.

⚠️ SISTEMA CONTROLADO:
Debes generar contenido SOLO usando el contexto proporcionado por el usuario.

🚫 PROHIBIDO:
- Usar conocimiento externo
- Inventar normativa
- Mencionar Unión Europea, REACH, química u otros dominios
- Usar Ley 30225 o normativa derogada

📚 MARCO LEGAL:
Ley 32069 (2025) y DS 009-2025-EF

🎯 TAREA:
Generar UNA pregunta tipo examen OECE.

⚠️ REGLAS CRÍTICAS:
- Si el contexto no contiene suficiente información → responde null
- Si usas información fuera del contexto → respuesta inválida
- Responde SOLO JSON válido
- No agregues texto adicional

Estructura EXACTA:

{
  "id": "TEMP",
  "competencia": "${competency}",
  "tema": "${topic}",
  "nivel": "${level}",
  "enunciado": "...",
  "opciones": {
    "A": "...",
    "B": "...",
    "C": "...",
    "D": "..."
  },
  "respuesta_correcta": "A",
  "sustento_normativo": "...",
  "explicacion": "..."
}
`;

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "llama-3.1-8b-instant",
                messages: [
                    { role: "system", content: systemPrompt },
                    {
                        role: "user",
                        content: `
Genera una pregunta sobre: ${topic}

Contexto normativo:
${contextoLegal}

Instrucción:
Usa SOLO el contexto.
Si no es suficiente → null
`
                    }
                ],
                temperature: 0.0
            })
        });

        const data = await response.json();

        if (data.error) {
            console.error("⚠️ Error API:", data.error.message);
            return null;
        }

        const content = data?.choices?.[0]?.message?.content;

        if (!content) {
            console.error("⚠️ Respuesta vacía");
            return null;
        }

        // ===============================
        // 🛡️ PARSE + VALIDADOR NEXUM
        // ===============================
        let parsed;

        try {
            parsed = JSON.parse(content);
        } catch (err) {
            console.error("❌ JSON inválido");
            console.log("🔍 RAW:", content);
            return null;
        }

        // Validación estructural
        if (
            !parsed ||
            !parsed.enunciado ||
            !parsed.opciones ||
            !parsed.respuesta_correcta
        ) {
            console.error("❌ Estructura inválida");
            return null;
        }

        // 🔒 Filtro anti-contaminación
        const texto = JSON.stringify(parsed).toLowerCase();

        if (
            texto.includes("unión europea") ||
            texto.includes("reach") ||
            texto.includes("química") ||
            texto.includes("planta")
        ) {
            console.error("❌ Contenido fuera de dominio");
            return null;
        }

        return parsed;

    } catch (error) {
        console.error("❌ Error crítico:", error.message);
        return null;
    }
}