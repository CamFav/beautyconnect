// Vérifie si l'email a un format standard
const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// Vérifie la solidité du mot de passe
// 8+ caractères, au moins une majuscule, une minuscule et un chiffre
const validatePassword = (password) =>
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/.test(password);

// Vérifie le nom d'utilisateur ou le business name
// Exemples valides : "Camille", "Camille Favriel", "Studio & 2000 Camillé"
const validateName = (name) => /^[A-Za-zÀ-ÿ0-9'&\-\s]{2,60}$/.test(name);

module.exports = {
  validateEmail,
  validatePassword,
  validateName,
};
