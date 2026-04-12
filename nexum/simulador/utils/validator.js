export function validateUrl(url) {
  if (typeof url !== "string") return false;

  if (url.includes("[") || url.includes("]") || url.includes("(")) {
    console.error("❌ URL inválida:", url);
    return false;
  }

  try {
    const parsed = new URL(url);
    return ["http:", "https:"].includes(parsed.protocol);
  } catch {
    console.error("❌ URL mal formada:", url);
    return false;
  }
}