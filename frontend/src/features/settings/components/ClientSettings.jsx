import { useEffect, useState } from "react";
import axios from "axios";
import Avatar from "../../../components/common/Avatar";

const API_BASE = "http://localhost:5000/api/account";

const clean = (v) =>
  typeof v === "string"
    ? v
        .trim()
        .replace(/[<>]/g, "")
        .replace(/[\u200B-\u200D\uFEFF]/g, "")
    : v;

export default function ClientSettings({ user, token, headers, setMessage }) {
  // ---------- AVATAR CLIENT ----------
  const [savingAvatarClient, setSavingAvatarClient] = useState(false);
  const [avatarClientPreview, setAvatarClientPreview] = useState(null);
  const [avatarClientFile, setAvatarClientFile] = useState(null);

  // ---------- CLIENT INFOS ----------
  const [savingClient, setSavingClient] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [locationClient, setLocationClient] = useState("");

  useEffect(() => {
    if (!user) return;

    // Prévisualisation avatar
    setAvatarClientPreview(user.avatarClient || null);

    // Infos client
    setName(user.name || "");
    setEmail(user.email || "");
    setPhone(user.phone || "");
    setLocationClient(user.location || "");
  }, [user]);

  // -------------------------------------------------
  //   AVATAR CLIENT
  // -------------------------------------------------
  const onAvatarClientChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarClientFile(file);
    setAvatarClientPreview(URL.createObjectURL(file));
  };

  const saveAvatarClient = async (e) => {
    e.preventDefault();
    if (!avatarClientFile || !token) return;

    setMessage(null);
    setSavingAvatarClient(true);

    try {
      const formData = new FormData();
      formData.append("avatar", avatarClientFile);

      await axios.patch(
        "http://localhost:5000/api/users/client/avatar",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setMessage({ type: "success", text: "Avatar client mis à jour" });
    } catch (err) {
      console.error(err);
      const text =
        err?.response?.data?.message ||
        "Impossible de mettre à jour l'avatar client.";
      setMessage({ type: "error", text });
    } finally {
      setSavingAvatarClient(false);
    }
  };

  // -------------------------------------------------
  //   INFOS CLIENT
  // -------------------------------------------------
  const handleSaveClient = async (e) => {
    e.preventDefault();
    if (!token) return;

    setMessage(null);
    setSavingClient(true);

    try {
      const payload = {
        name: clean(name),
        email: clean(email),
        phone: clean(phone),
        location: clean(locationClient),
      };

      await axios.patch(`${API_BASE}/profile`, payload, { headers });
      setMessage({ type: "success", text: "Profil client mis à jour" });
    } catch (err) {
      console.error(err);
      const text =
        err?.response?.data?.message ||
        "Impossible de mettre à jour le profil client.";
      setMessage({ type: "error", text });
    } finally {
      setSavingClient(false);
    }
  };

  return (
    <section className="bg-white border border-gray-200 rounded-xl shadow-sm">
      <div className="border-b border-gray-100 px-6 py-4">
        <h2 className="text-lg font-semibold">Profil client</h2>
        <p className="text-sm text-gray-500">
          Informations visibles dans votre espace client.
        </p>
      </div>

      {/* Avatar client */}
      <form
        onSubmit={saveAvatarClient}
        className="px-6 py-4 flex flex-col gap-4 border-b border-gray-100"
      >
        <h3 className="font-medium text-gray-800">Avatar Client</h3>
        <div className="flex items-center gap-4">
          <Avatar
            src={avatarClientPreview}
            name={user?.name}
            email={user?.email}
            size={64} // équivalent à w-16 h-16
            className="border"
          />

          <input
            type="file"
            accept="image/*"
            onChange={onAvatarClientChange}
            className="text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={savingAvatarClient}
          className={`px-4 py-2 rounded text-white ${
            savingAvatarClient ? "bg-gray-300" : "bg-black hover:bg-gray-900"
          }`}
        >
          {savingAvatarClient
            ? "Enregistrement…"
            : "Mettre à jour avatar client"}
        </button>
      </form>

      {/* Infos client */}
      <form
        onSubmit={handleSaveClient}
        className="px-6 py-5 grid grid-cols-1 md:grid-cols-2 gap-5"
      >
        <div>
          <label className="block text-sm font-medium mb-1">Nom</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            className="w-full border rounded px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Téléphone</label>
          <input
            type="tel"
            className="w-full border rounded px-3 py-2"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Localisation</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2"
            value={locationClient}
            onChange={(e) => setLocationClient(e.target.value)}
          />
        </div>

        <div className="col-span-1 md:col-span-2">
          <button
            type="submit"
            disabled={savingClient}
            className={`px-4 py-2 rounded text-white ${
              savingClient ? "bg-gray-300" : "bg-gray-900 hover:bg-black"
            }`}
          >
            {savingClient ? "Enregistrement…" : "Enregistrer (client)"}
          </button>
        </div>
      </form>
    </section>
  );
}
