const trimTrailingSlash = (value) => value.replace(/\/+$/, "");

const configuredBaseUrl = process.env.REACT_APP_API_URL;

export const API_BASE_URL = configuredBaseUrl
  ? trimTrailingSlash(configuredBaseUrl)
  : "http://localhost:5001";

export const buildApiUrl = (path) => {
  if (!path) return API_BASE_URL;
  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
};
