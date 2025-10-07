import axios from "axios";
const API_URL = "http://localhost:5000/api/account";

export const updateRole = async (token, role) => {
  const res = await axios.patch(
    `${API_URL}/role`,
    { role },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data; // { message, user, token }
};
