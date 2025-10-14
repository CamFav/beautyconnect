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

// Mettre à jour un post (Prestataire)
export const updatePost = async (token, postId, data) => {
  const res = await axios.patch(
    `http://localhost:5000/api/posts/${postId}`,
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return res.data.post;
};

// Supprimer un post (Prestataire)
export const deletePost = async (token, postId) => {
  const res = await axios.delete(
    `http://localhost:5000/api/posts/${postId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
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

// Suivre / Ne plus suivre un utilisateur
export const followUser = async (token, userId) => {
  const res = await fetch(`http://localhost:5000/api/users/${userId}/follow`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.json();
};
