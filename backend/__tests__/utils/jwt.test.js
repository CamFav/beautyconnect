const jwt = require("jsonwebtoken");

// On simule la variable d'environnement
process.env.JWT_SECRET = "testsecret";
process.env.JWT_EXPIRES_IN = "1h";

const { generateToken, verifyToken } = require("../../utils/jwt");

describe("utils/jwt", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("generateToken", () => {
    it("génère un token JWT valide", () => {
      const user = { _id: "123", email: "test@example.com", role: "client" };
      const token = generateToken(user);
      expect(typeof token).toBe("string");

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      expect(decoded.sub).toBe("123");
      expect(decoded.email).toBe("test@example.com");
      expect(decoded.activeRole).toBe("client");
    });

    it("utilise user.id ou user.sub si _id absent", () => {
      const user = { id: "abc", email: "id@example.com" };
      const token = generateToken(user);
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      expect(decoded.sub).toBe("abc");
    });

    it("jette une erreur si aucun user n'est fourni", () => {
      expect(() => generateToken()).toThrow(
        "Impossible de générer un token sans utilisateur."
      );
    });

    it("jette une erreur si user n’a pas d’ID valide", () => {
      const user = { email: "test@example.com" };
      expect(() => generateToken(user)).toThrow(
        "L'utilisateur fourni pour le token ne possède pas d'identifiant valide."
      );
    });
  });

  describe("verifyToken", () => {
    it("vérifie un token valide", () => {
      const token = jwt.sign({ sub: "123" }, process.env.JWT_SECRET, {
        issuer: "beautyconnect",
      });
      const decoded = verifyToken(token);
      expect(decoded.sub).toBe("123");
    });

    it("jette une erreur si aucun token fourni", () => {
      expect(() => verifyToken()).toThrow("Aucun token fourni.");
    });

    it("jette une erreur si token invalide", () => {
      expect(() => verifyToken("tokenInvalide")).toThrow();
    });
  });
});
