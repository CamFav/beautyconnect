const { validationResult } = require("express-validator");

/**
 * Middleware de validation centralisé
 * Intercepte les erreurs de validation et renvoie une réponse uniforme.
 */
function validate(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Validation failed:", errors.array());
    }

    return res.status(400).json({
      message: "Erreur de validation des données.",
      errors: errors.array().map((err) => ({
        field: err.param,
        message: err.msg,
      })),
    });
  }

  next();
}

module.exports = validate;
