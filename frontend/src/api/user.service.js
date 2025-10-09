import http from "./httpClient";

const ACCOUNT_URL = "/account";

export const updateRole = async (role) => {
  const res = await http.patch(`${ACCOUNT_URL}/role`, { role });
  return res.data; // { message, user, token }
};
