export const baseUrl = import.meta.env.VITE_BASE_URL;
export const wsUrl = import.meta.env.VITE_WS_URL;

export const getAuthHeaders = () => {
  const token = localStorage.getItem("jwtToken");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};
