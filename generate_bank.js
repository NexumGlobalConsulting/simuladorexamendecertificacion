import { generarPregunta } from "./service/groqClient.js";

async function main() {
  console.log("🚀 Generando pregunta...\n");

  const resultado = await generarPregunta(
    "Genera una pregunta tipo OECE sobre actuaciones preparatorias"
  );

  console.log(resultado);
}

main();