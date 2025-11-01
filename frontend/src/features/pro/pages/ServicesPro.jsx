import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../../context/AuthContextBase";
import {
  getMyServices,
  createService,
  updateService,
  deleteService,
} from "../../../api/pro/pro.services";
import ServiceCard from "@/features/pro/components/services/ServiceCard";
import ServiceForm from "@/features/pro/components/services/ServiceForm";
import EmptyServices from "@/features/pro/components/services/EmptyServices";
import StickyFooterButton from "../../../components/ui/StickyFooterButton";
import AlertMessage from "../../../components/feedback/AlertMessage";
import Seo from "@/components/seo/Seo";

export default function ServicesPro() {
  const { user, token } = useContext(AuthContext);

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState(null);

  const [serviceName, setServiceName] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("");
  const [description, setDescription] = useState("");

  const isPro = user?.activeRole === "pro" || user?.role === "pro";

  useEffect(() => {
    if (!token || !isPro) return;

    const fetchServices = async () => {
      setLoading(true);
      try {
        const data = await getMyServices(token);
        setServices(data || []);
      } catch (err) {
        console.error(err);
        setMessage({
          type: "error",
          text: "Impossible de charger vos services.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [token, isPro]);

  const handleSaveService = async () => {
    const numberRegex = /^\d+(\.\d{1,2})?$/;

    if (!serviceName || !price || !duration) {
      setMessage({
        type: "error",
        text: "Merci de remplir les champs obligatoires.",
      });
      return;
    }

    if (!numberRegex.test(price)) {
      setMessage({
        type: "error",
        text: "Le prix doit être un nombre valide (ex : 25 ou 25.50).",
      });
      return;
    }

    if (!numberRegex.test(duration)) {
      setMessage({
        type: "error",
        text: "La durée doit être un nombre valide (en minutes, ex : 30 ou 45.5).",
      });
      return;
    }

    const payload = { name: serviceName, price, duration, description };

    try {
      if (editingService) {
        const updated = await updateService(token, editingService._id, payload);
        setServices((prev) =>
          prev.map((s) => (s._id === editingService._id ? updated : s))
        );
        setMessage({
          type: "success",
          text: "Service mis à jour avec succès.",
        });
      } else {
        const created = await createService(token, payload);
        setServices((prev) => [...prev, created]);
        setMessage({
          type: "success",
          text: "Service ajouté avec succès.",
        });
      }

      setShowForm(false);
      setEditingService(null);
      setServiceName("");
      setPrice("");
      setDuration("");
      setDescription("");
    } catch (err) {
      console.error("Erreur sauvegarde service:", err);
      setMessage({
        type: "error",
        text: "Impossible de sauvegarder ce service.",
      });
    }
  };

  const handleDelete = async (serviceId) => {
    if (!window.confirm("Voulez-vous vraiment supprimer ce service ?")) return;
    try {
      await deleteService(token, serviceId);
      setServices((prev) => prev.filter((s) => s._id !== serviceId));
      setMessage({ type: "success", text: "Service supprimé avec succès." });
    } catch (err) {
      console.error("Erreur suppression service:", err);
      setMessage({
        type: "error",
        text: "Impossible de supprimer ce service.",
      });
    }
  };

  if (!token || !isPro) {
    return (
      <div className="p-6 text-center text-gray-600">
        Accès réservé aux professionnels.
      </div>
    );
  }

  return (
    <>
      <Seo
        title="Mes services"
        description="Créez, modifiez et gérez vos prestations beauté sur BeautyConnect Pro."
      />
      <div className="p-6 space-y-6">
        <header className="mb-4">
          <h1 className="text-2xl font-semibold text-gray-900">Mes services</h1>
        </header>

        {message && <AlertMessage type={message.type} message={message.text} />}

        {loading && (
          <p className="text-gray-500 text-center py-10">
            Chargement en cours...
          </p>
        )}

        {!loading && services.length === 0 && !showForm && (
          <EmptyServices onAdd={() => setShowForm(true)} />
        )}

        {showForm && (
          <ServiceForm
            editingService={editingService}
            serviceName={serviceName}
            price={price}
            duration={duration}
            description={description}
            setServiceName={setServiceName}
            setPrice={setPrice}
            setDuration={setDuration}
            setDescription={setDescription}
            onSave={handleSaveService}
            onCancel={() => {
              setShowForm(false);
              setEditingService(null);
              setServiceName("");
              setPrice("");
              setDuration("");
              setDescription("");
            }}
          />
        )}

        {!loading && services.length > 0 && !showForm && (
          <div className="grid grid-cols-1 gap-4">
            {services.map((s) => (
              <ServiceCard
                key={s._id}
                service={s}
                onEdit={() => {
                  setEditingService(s);
                  setServiceName(s.name);
                  setPrice(s.price);
                  setDuration(s.duration);
                  setDescription(s.description || "");
                  setShowForm(true);
                }}
                onDelete={() => handleDelete(s._id)}
              />
            ))}
          </div>
        )}

        {!showForm && !loading && services.length > 0 && (
          <StickyFooterButton
            label="Ajouter un service"
            onClick={() => setShowForm(true)}
          />
        )}
      </div>
    </>
  );
}
