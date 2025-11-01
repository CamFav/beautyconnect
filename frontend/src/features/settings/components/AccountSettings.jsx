import { useEffect, useRef, useState, useContext } from "react";
import httpClient from "../../../api/http/httpClient";
import Avatar from "../../../components/ui/Avatar";
import StickyFooterButton from "../../../components/ui/StickyFooterButton";
import { User, Mail, Phone } from "lucide-react";
import AlertMessage from "../../../components/feedback/AlertMessage";
import {
  validateEmail,
  validateName,
  validatePhone,
  messages,
} from "../../../utils/validators";
import { AuthContext } from "../../../context/AuthContextBase";

export default function AccountSettings({ user, token, headers, setMessage }) {
  const fileInputRef = useRef(null);
  const { updateUser } = useContext(AuthContext);

  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [emailExists, setEmailExists] = useState(false);

  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);

  const clean = (v) =>
    typeof v === "string"
      ? v
          .trim()
          .replace(/[<>]/g, "")
          .replace(/[\u200B-\u200D\uFEFF]/g, "")
      : v;

  // Init user
  useEffect(() => {
    if (!user) return;
    setAvatarPreview(user.avatarClient || null);
    const [first, last] = (user.name || "").split(" ");
    setFirstName(first || "");
    setLastName(last || "");
    setEmail(user.email || "");
    setPhone(user.phone || "");
    setHasChanges(false);
  }, [user]);

  // --- Vérif email existant ---
  useEffect(() => {
    const checkEmail = async () => {
      if (!validateEmail(email) || email === user?.email) {
        setEmailExists(false);
        return;
      }
      try {
        const res = await httpClient.get(`/users/check-email?email=${email}`);
        setEmailExists(res.data.exists);
      } catch (err) {
        console.error("Erreur vérification email :", err);
      }
    };

    const delay = setTimeout(checkEmail, 500);
    return () => clearTimeout(delay);
  }, [email, user?.email]);

  // --- Avatar ---
  const onAvatarClick = () => fileInputRef.current?.click();

  const onAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setHasChanges(true);
  };

  const saveAvatar = async () => {
    if (!avatarFile || !token) return;
    try {
      const formData = new FormData();
      formData.append("avatar", avatarFile);

      const { data } = await httpClient.patch(
        "/users/client/avatar",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (data?.user) {
        updateUser(data.user);
      }
    } catch (err) {
      console.error("Erreur avatar :", err);
      throw new Error("Impossible de mettre à jour l’avatar.");
    }
  };

  const validateNames = () => {
    if (!validateName(firstName)) {
      setMessage({ type: "error", text: messages.name });
      return false;
    }
    if (!validateName(lastName)) {
      setMessage({ type: "error", text: "Nom invalide. " + messages.name });
      return false;
    }
    return true;
  };

  // --- Save ---
  const handleSave = async () => {
    if (!token) return;

    if (!validateNames()) return;

    if (!validateEmail(email)) {
      setMessage({ type: "error", text: messages.email });
      return;
    }

    if (emailExists) {
      setMessage({
        type: "error",
        text: "Cette adresse email est déjà utilisée.",
      });
      return;
    }

    if (phone && !validatePhone(phone)) {
      setMessage({ type: "error", text: messages.phone });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const payload = {
        name: clean(`${firstName} ${lastName}`),
        email: clean(email),
        phone: clean(phone),
      };

      await httpClient.patch("/account/profile", payload, { headers });

      if (avatarFile) await saveAvatar();

      setMessage({ type: "success", text: "Profil mis à jour avec succès." });
      setHasChanges(false);
    } catch (err) {
      console.error("Erreur profil :", err);
      setMessage({
        type: "error",
        text:
          err?.response?.data?.message ||
          "Impossible de mettre à jour le profil.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (!user) return;
    const [first, last] = (user.name || "").split(" ");
    setFirstName(first || "");
    setLastName(last || "");
    setEmail(user.email || "");
    setPhone(user.phone || "");
    setAvatarPreview(user.avatarClient || null);
    setAvatarFile(null);
    setHasChanges(false);
  };

  return (
    <section className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 space-y-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Mon compte</h2>

      {setMessage?.text && (
        <AlertMessage type={setMessage.type} message={setMessage.text} />
      )}

      {/* Avatar */}
      <div className="flex flex-col items-center gap-3 mb-6">
        <div
          role="button"
          tabIndex={0}
          onClick={onAvatarClick}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") onAvatarClick();
          }}
          className="cursor-pointer focus:ring-2 focus:ring-blue-400 rounded-full"
          title="Changer l'avatar"
        >
          <Avatar
            src={avatarPreview}
            name={user?.name}
            size={90}
            className="border"
          />
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={onAvatarChange}
          className="hidden"
        />
        <p className="text-sm text-gray-600 text-center">
          Cliquez sur l'avatar pour sélectionner un fichier
        </p>
      </div>

      {/* Formulaire */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Prénom */}
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium mb-1">
            Prénom
          </label>
          <div className="relative">
            <User
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              id="firstName"
              type="text"
              value={firstName}
              onChange={(e) => {
                setFirstName(e.target.value);
                setHasChanges(true);
              }}
              placeholder="Votre prénom"
              className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
        </div>

        {/* Nom */}
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium mb-1">
            Nom
          </label>
          <div className="relative">
            <User
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              id="lastName"
              type="text"
              value={lastName}
              onChange={(e) => {
                setLastName(e.target.value);
                setHasChanges(true);
              }}
              placeholder="Votre nom"
              className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Adresse email
          </label>
          <div className="relative">
            <Mail
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setHasChanges(true);
              }}
              placeholder="email@example.com"
              className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
        </div>

        {/* Téléphone */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium mb-1">
            Téléphone
          </label>
          <div className="relative">
            <Phone
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9+\s]/g, "");
                setPhone(val);
                setHasChanges(true);
              }}
              placeholder="+33 6 12 34 56 78"
              className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
        </div>
      </div>

      {/* Actions sticky */}
      {hasChanges && (
        <StickyFooterButton
          label={saving ? "Enregistrement..." : "Enregistrer"}
          onClick={handleSave}
          disabled={saving}
        >
          <button
            type="button"
            onClick={handleCancel}
            className="ml-3 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Annuler
          </button>
        </StickyFooterButton>
      )}
    </section>
  );
}
