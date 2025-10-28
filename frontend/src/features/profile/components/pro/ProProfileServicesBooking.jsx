import { useState } from "react";
import httpClient from "../../../../api/http/httpClient";
import { getAvailableSlots } from "../../../../api/pro/pro.slots";
import { toast } from "react-hot-toast";
import AlertMessage from "../../../../components/feedback/AlertMessage";

export default function ProProfileServicesBooking({
  publicServices = [],
  user,
  currentUser,
}) {
  const token = localStorage.getItem("token");

  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSelectService = (service) => {
    const isAlreadyOpen = selectedService?._id === service._id;
    setSelectedService(isAlreadyOpen ? null : service);
    setSlots([]);
    setSelectedDate("");
    setSelectedSlot(null);
    setErrorMessage("");
  };

  const handleConfirmBooking = async () => {
    setErrorMessage("");

    if (!currentUser?._id) {
      return setErrorMessage("Vous devez être connecté pour réserver.");
    }

    if (currentUser._id === user?._id) {
      return setErrorMessage(
        "Vous ne pouvez pas réserver vos propres services."
      );
    }

    if (!selectedService || !selectedDate || !selectedSlot) {
      return setErrorMessage(
        "Veuillez sélectionner un service, une date et un créneau."
      );
    }

    if (!slots.includes(selectedSlot)) {
      return setErrorMessage(
        "Le créneau sélectionné n'est plus disponible. Veuillez choisir un autre créneau."
      );
    }

    if (!token) {
      return setErrorMessage("Token manquant. Veuillez vous reconnecter.");
    }

    const location = {
      city: user.proProfile?.location?.city || "",
      country: user.proProfile?.location?.country || "",
      latitude: user.proProfile?.location?.latitude ?? undefined,
      longitude: user.proProfile?.location?.longitude ?? undefined,
    };

    setBookingLoading(true);

    try {
      await httpClient.post(
        "/reservations",
        {
          proId: user._id,
          serviceId: selectedService._id,
          date: selectedDate,
          time: selectedSlot,
          location,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Réservation envoyée avec succès !");
      setSelectedSlot(null);
      setSlots([]);
      setSelectedDate("");
    } catch (err) {
      const backendMessage =
        err?.response?.data?.error ||
        "Erreur lors de la réservation. Vérifiez vos données.";
      setErrorMessage(backendMessage);
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <section id="offres" className="bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">
        Offres et tarifs
      </h2>

      {publicServices.length === 0 ? (
        <p className="text-gray-500">
          Ce professionnel n’a pas encore ajouté de services.
        </p>
      ) : (
        <div className="space-y-6">
          {publicServices.map((service) => (
            <div
              key={service._id}
              className="border border-gray-200 rounded-lg shadow-sm"
            >
              <div
                role="button"
                tabIndex={0}
                aria-label={`Voir le service ${service.name}`}
                onClick={() => handleSelectService(service)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleSelectService(service);
                  }
                }}
                className="p-4 cursor-pointer hover:bg-gray-50 rounded-lg transition flex justify-between items-center focus:ring-2 focus:ring-blue-500"
              >
                <div>
                  <h3 className="text-lg font-medium text-gray-800">
                    {service.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {service.duration} min
                  </p>
                  {service.description && (
                    <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                      {service.description}
                    </p>
                  )}
                </div>
                <span className="text-base font-semibold text-gray-900">
                  {service.price}€
                </span>
              </div>

              {selectedService?._id === service._id && (
                <div className="p-4 border-t bg-gray-50">
                  <h3 className="text-md font-semibold mb-3 text-gray-800">
                    Créneaux disponibles
                  </h3>

                  {!currentUser && (
                    <AlertMessage
                      type="error"
                      message="Connectez-vous pour réserver ce service."
                    />
                  )}

                  <label className="block mb-3 text-sm text-gray-600">
                    Choisissez une date :
                    <input
                      type="date"
                      value={selectedDate}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={async (e) => {
                        const chosenDate = e.target.value;
                        setSelectedDate(chosenDate);
                        setSelectedSlot(null);
                        setErrorMessage("");

                        if (!chosenDate) return;

                        setLoadingSlots(true);
                        try {
                          const available = await getAvailableSlots(
                            user._id,
                            selectedService._id,
                            chosenDate
                          );

                          const today = new Date().toISOString().split("T")[0];
                          let filtered = available;
                          if (chosenDate === today) {
                            const now = new Date();
                            filtered = available.filter((slot) => {
                              const [h, m] = slot.split(":").map(Number);
                              const slotTime = new Date();
                              slotTime.setHours(h, m, 0, 0);
                              return slotTime > now;
                            });
                          }

                          setSlots(filtered);
                        } catch {
                          setSlots([]);
                        } finally {
                          setLoadingSlots(false);
                        }
                      }}
                      className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    />
                  </label>

                  {loadingSlots && (
                    <p className="text-sm text-gray-500">
                      Chargement des créneaux...
                    </p>
                  )}

                  {!loadingSlots && selectedDate && slots.length === 0 && (
                    <p className="text-sm text-gray-500">
                      Aucun créneau disponible ce jour.
                    </p>
                  )}

                  {!loadingSlots && slots.length > 0 && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {slots.map((slot, i) => (
                          <label
                            key={i}
                            role="button"
                            tabIndex={0}
                            aria-label={`Sélectionner le créneau ${slot}`}
                            onClick={() => {
                              if (!currentUser) {
                                setErrorMessage(
                                  "Vous devez être connecté pour réserver ce créneau."
                                );
                                return;
                              }
                              setSelectedSlot(slot);
                              setErrorMessage("");
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                if (!currentUser) {
                                  setErrorMessage(
                                    "Vous devez être connecté pour réserver ce créneau."
                                  );
                                  return;
                                }
                                setSelectedSlot(slot);
                                setErrorMessage("");
                              }
                            }}
                            className={`flex items-center gap-2 border rounded-lg p-3 cursor-pointer transition ${
                              selectedSlot === slot
                                ? "border-blue-600 bg-blue-50"
                                : "border-gray-300 hover:bg-gray-100"
                            }`}
                          >
                            <input
                              type="radio"
                              name="selectedSlot"
                              checked={selectedSlot === slot}
                              onChange={() => setSelectedSlot(slot)}
                              className="accent-blue-600"
                              disabled={!currentUser}
                            />
                            <span className="text-gray-800">{slot}</span>
                          </label>
                        ))}
                      </div>

                      {errorMessage && (
                        <AlertMessage type="error" message={errorMessage} />
                      )}

                      {selectedSlot && (
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                          <button
                            onClick={handleConfirmBooking}
                            disabled={bookingLoading || !currentUser}
                            className={`px-4 py-2 rounded text-white text-sm ${
                              bookingLoading || !currentUser
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-blue-600 hover:bg-blue-700"
                            }`}
                          >
                            {bookingLoading
                              ? "Réservation..."
                              : "Confirmer la réservation"}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
