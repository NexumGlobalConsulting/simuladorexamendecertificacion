import 'dotenv/config';

/**
 * PROJECT: NEXUM Simulation Engine
 * MILESTONE: AI-INTEGRATION-V2 (Clean Boot)
 * DESCRIPTION: Inference Engine for dynamic question generation based on Law 32069.
 * STATUS: Validated - Ready for mass population.
 */

/**
 * Inference Engine Core - NEXUM (V2: Arranque Limpio)
 * Genera preguntas de alta fidelidad basadas exclusivamente en la Ley 32069.
 * Este módulo actúa como el filtro final contra normativa derogada.
 */
export async function generateNEXUMQuestion(topic, competency, level, contextText) {
    const API_KEY = process.env.GROQ_API_KEY;
    const API_URL = "https://api.groq.com/openai/v1/chat/completions";

    if (!API_KEY) {
        console.error("❌ ERROR: No se detecta GROQ_API_KEY en el archivo .env");
        return null;
    }

    const systemPrompt = `Actúa como el Auditor Maestro de NEXUM, experto en la NUEVA Ley N° 32069 (2025) y su Reglamento (DS 009-2025-EF). 
    
    🚫 FILTRO DE VIGENCIA (PROHIBICIONES ESTRICTAS):
    1. PROHIBIDO mencionar la Ley 30225 o sus procesos (Adjudicación Simplificada, Selección de Consultores Individuales).
    2. PROHIBIDO usar umbrales antiguos (como las 65 UIT para el Tribunal). El umbral vigente para apelaciones ante el Tribunal es SUPERIOR a 50 UIT.
    3. PROHIBIDO usar el término "Valor Referencial" para bienes y servicios; usa "Cuantía" según el nuevo estándar del Sistema Nacional de Abastecimiento.

    🎯 PROTOCOLO DE CONSTRUCCIÓN NEXUM:
    - Enunciado: Plantea un conflicto de gestión pública que requiera interpretar la norma vigente, no solo recordarla.
    - Opciones: Crea distractores que parezcan correctos bajo la lógica de la ley antigua (prejuicio del usuario) pero que sean erróneos bajo la 32069.
    - Clasificación de Errores: Debes identificar si el error del distractor es por Plazo Alterado, Requisito Inexistente o Aplicación Indebida.

    Genera un objeto JSON con esta estructura exacta:
    {
        "id": "TEMP",
        "competencia": ${competency},
        "subcompetencia": "Referencia específica al Temario OECE (ej. 1.2.3)",
        "tema": "${topic}",
        "level": "${level}",
        "enunciado": "Escenario práctico detallado...",
        "opciones": {
            "A": "...",
            "B": "...",
            "C": "...",
            "D": "..."
        },
        "respuesta_correcta": "Letra",
        "sustento_normativo": "Artículo exacto de la Ley 32069 o DS 009-2025-EF",
        "explicacion": "Análisis técnico profundo justificando la respuesta correcta y refutando los distractores.",
        "tipo_error_distractores": {
            "A": "tipo de error o 'Correcta'",
            "B": "tipo de error o 'Correcta'",
            "C": "tipo de error o 'Correcta'",
            "D": "tipo de error o 'Correcta'"
        },
        "peso": ${level === 'experto' ? 3 : level === 'intermedio' ? 2 : 1},
        "estado": "en revisión"
    }`;

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "llama3-70b-8192",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: `Genera una pregunta nivel ${level} sobre el tema: ${topic}. \n\nCONTEXTO LEGAL EXCLUSIVO EXTRAÍDO DEL PDF: ${contextText}` }
                ],
                temperature: 0.0, // Cero creatividad para evitar alucinaciones normativas
                response_format: { type: "json_object" }
            })
        });

        const data = await response.json();
        return JSON.parse(data.choices[0].message.content);
    } catch (error) {
        console.error("❌ Error Crítico en el Motor de Inferencia:", error);
        return null;
    }
}