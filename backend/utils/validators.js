const NAME_REGEX = /^[\p{L}0-9'&\-\s]{2,60}$/u;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[^\s]{8,}$/;

const validateEmail = (email) => EMAIL_REGEX.test(email);
const validatePassword = (password) => PASSWORD_REGEX.test(password);
const validateName = (name) => NAME_REGEX.test(name);

const validationMessages = {
  name:
    "Le nom doit contenir entre 2 et 60 caracteres et peut inclure lettres, chiffres, espaces, tirets ou &.",
  email: "Adresse email invalide.",
  password:
    "Le mot de passe doit contenir au moins 8 caracteres, une majuscule, une minuscule et un chiffre, sans espace.",
};

module.exports = {
  validateEmail,
  validatePassword,
  validateName,
  validationMessages,
  patterns: {
    NAME_REGEX,
    EMAIL_REGEX,
    PASSWORD_REGEX,
  },
};
