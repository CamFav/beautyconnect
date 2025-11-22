import axios from "axios";
import { toast } from "react-hot-toast";

const baseURL =
  import.meta.env.VITE_API_URL?.trim() || "http://localhost:5000/api";

console.log(
  `%c[HTTP CLIENT] Base URL configurée : ${baseURL}`,
  "color: #3b82f6; font-weight: bold;"
);

// Création d’une instance Axios
const httpClient = axios.create({
  baseURL,
  withCredentials: true,
});

// Intercepteur de requête : ajoute automatiquement le token
httpClient.interceptors.request.use(
  (config) => {
    // Récupère le token depuis le localStorage
    const token = localStorage.getItem("token");
    if (token) {
      // Ajoute le header Authorization avec le token
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercepteur de réponse : gère les 401
httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      if (!window._sessionExpired) {
        window._sessionExpired = true;

        toast.error("Votre session a expiré, vous avez été déconnecté.", {
          duration: 6000,
          position: "top-center",
          style: {
            background: "#fef2f2",
            border: "1px solid #fecaca",
            color: "#b91c1c",
            fontWeight: 500,
            borderRadius: "8px",
            padding: "10px 14px",
          },
        });

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        window.dispatchEvent(new Event("sessionExpired"));

        setTimeout(() => {
          window._sessionExpired = false;
        }, 3000);
      }
    }

    return Promise.reject(error);
  }
);

export default httpClient;
