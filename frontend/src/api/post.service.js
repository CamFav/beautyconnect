import axios from "axios";

const API_URL = "http://localhost:5000/api/posts";

// Créer un post (Prestataire)
export const createPost = async (token, formData) => {
  const res = await axios.post(API_URL, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

// Récupérer tous les posts (Feed client)
export const getPosts = async () => {
  const res = await axios.get(API_URL);
  return res.data;
};

// Like / Unlike un post
export const likePost = async (token, postId) => {
  const res = await axios.post(
    `${API_URL}/${postId}/like`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return res.data;
};

// Ajouter / Retirer des favoris
export const favoritePost = async (token, postId) => {
  const res = await axios.post(
    `${API_URL}/${postId}/favorite`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return res.data;
};
