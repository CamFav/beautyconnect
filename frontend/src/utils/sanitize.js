// src/utils/sanitize.js

/**
 * Nettoyage générique des entrées texte (adresse, email, etc.)
 * Autorise espaces, accents, lettres, chiffres et symboles usuels (@, ., -, _, ', &)
 */
export const sanitizeInput = (value) => {
  if (typeof value !== "string") return "";

  return value
    .replace(/[<>]/g, "") // bloque HTML/script
    .replace(/[^\p{L}\p{N}\s@\-_.&,'’]/gu, "") // garde lettres, chiffres, espaces, tirets, @, points, apostrophes, esperluettes
    .replace(/\s{2,}/g, " ") // réduit espaces multiples
    .trimStart();
};

/**
 * Nettoyage spécifique du champ "name" (Prénom + Nom, max 2 mots)
 * Permet accents, tirets et apostrophes.
 */
export const sanitizeName = (value) => {
  if (typeof value !== "string") return "";

  let clean = value
    .replace(/[<>]/g, "")
    .replace(/[^\p{L}\s\-'’]/gu, "")
    .replace(/\s{2,}/g, " ");

  const parts = clean.trim().split(" ");
  if (parts.length > 2) clean = parts.slice(0, 2).join(" ");
  return clean;
};

/**
 * Nettoyage du nom d’entreprise (salon ou freelance)
 * Autorise lettres, chiffres, espaces, &, ', -, ., et accents.
 */
export const sanitizeBusinessName = (value) => {
  if (typeof value !== "string") return "";

  return value
    .replace(/[<>]/g, "")
    .replace(/[^\p{L}\p{N}\s\-&’'.]/gu, "")
    .replace(/\s{2,}/g, " ")
    .trim();
};
