// frontend/src/utils/validators.js

// === RÈGLES (alignées sur le backend) ===
const nameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ0-9'&\-\s]{2,60}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;
const phoneRegex = /^(?:\+?\d{1,3}\s?)?(?:\d{6,14})$/;
const siretRegex = /^\d{14}$/;

// === MESSAGES STANDARD ===
export const messages = {
  name: "Le nom doit contenir entre 2 et 60 caractères et peut inclure lettres, chiffres, espaces, tirets ou &.",
  email: "Adresse email invalide.",
  password:
    "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre.",
  phone: "Numéro de téléphone invalide (ex: +33611223344).",
  siret: "Le numéro SIRET doit contenir exactement 14 chiffres.",
  loginPassword: "Le mot de passe est requis.", // ➕ Ajout cohérent pour les formulaires de connexion
};

// === VALIDATIONS GÉNÉRIQUES ===
export const validateName = (value) => nameRegex.test(value);
export const validateEmail = (value) => emailRegex.test(value);
export const validatePassword = (value) => passwordRegex.test(value);
export const validatePhone = (value) =>
  !value || phoneRegex.test(String(value).replace(/\s/g, ""));
export const validateSiret = (value) => !value || siretRegex.test(value);

// === Aide visuelle : scoring de force du mot de passe ===
// 0=très faible, 1=faible, 2=moyen, 3=fort, 4=très fort
export const getPasswordScore = (pwd = "") => {
  if (!pwd) return 0;
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[a-z]/.test(pwd)) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/\d/.test(pwd)) score++;
  // Optionnel : points bonus si caractères spéciaux
  // if (/[@$!%*?&]/.test(pwd)) score++;
  return Math.min(score, 4);
};

// === Normalisation des erreurs API backend -> front ===
// Le backend renvoie { errors: [{ field, message }] } ou { message }
// Cette fonction retourne un objet { fieldName: "message" } prêt à afficher.
export const mapApiErrors = (errorPayload) => {
  const out = {};
  if (!errorPayload) return out;

  if (Array.isArray(errorPayload.errors)) {
    for (const e of errorPayload.errors) {
      if (e?.field) out[e.field] = e.message || "Erreur";
    }
  } else if (errorPayload.message) {
    out._error = errorPayload.message;
  }
  return out;
};

// === Validation spécifique au LOGIN ===
// Utilisée uniquement dans le formulaire de connexion
export const validateLoginForm = (data) => {
  const errors = {};
  if (!validateEmail(data.email)) errors.email = messages.email;
  if (!data.password?.trim()) errors.password = messages.loginPassword;
  return errors;
};
