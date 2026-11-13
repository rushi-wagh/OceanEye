const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
const API_BASE_URL =
  configuredApiBaseUrl || (import.meta.env.DEV ? "" : "https://oceaneyee.onrender.com");

export { API_BASE_URL };
