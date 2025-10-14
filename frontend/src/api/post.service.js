import http from "./httpClient";

const POSTS_URL = "/posts";

// Créer un post (Prestataire)
export const createPost = async (formData) => {
  const res = await http.post(POSTS_URL, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

// Récupérer tous les posts (Feed client)
export const getPosts = async () => {
  const res = await http.get(POSTS_URL);
  return res.data;
};

// Like / Unlike un post
export const likePost = async (postId) => {
  const res = await http.post(`${POSTS_URL}/${postId}/like`);
  return res.data;
};

// Mettre à jour un post (Prestataire)
export const updatePost = async (postId, data) => {
  const res = await http.patch(`${POSTS_URL}/${postId}`, data);
  return res.data.post;
};

// Supprimer un post (Prestataire)
export const deletePost = async (postId) => {
  const res = await http.delete(`${POSTS_URL}/${postId}`);
  return res.data;
};

// Ajouter / Retirer des favoris
export const favoritePost = async (postId) => {
  const res = await http.post(`${POSTS_URL}/${postId}/favorite`);
  return res.data;
};
