import "dotenv/config";
import { validateUrl } from "../utils/validator.js";

const GROQ_URL = process.env.GROQ_URL ?? "";
const API_KEY = process.env.GROQ_API_KEY ?? "";
const MODEL = "llama-3.1-8b-instant";

if (!validateUrl(GROQ_URL)) {
  throw new Error("❌ GROQ_URL inválida");
}

if (!API_KEY) {
  throw new Error("❌ Falta GROQ_API_KEY");
}

export async function generarPregunta(prompt) {
  try {
    const response = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
  model: MODEL,
  messages: [
    {
      role: "user",
      content: prompt
    }
  ]
})
    });

    if (!response.ok) {
  const errorText = await response.text();
  console.error("❌ Detalle API:", errorText);
  throw new Error(`HTTP ${response.status}`);
}

    const data = await response.json();

    return data?.choices?.[0]?.message?.content ?? "Sin respuesta";

  } catch (error) {
    console.error("❌ Error en API:", error?.message || error);
    throw error;
  }
}