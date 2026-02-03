import axios, { AxiosError } from "axios";

const API_BASE_URL =
  (import.meta as any).env?.VITE_API_BASE_URL || "http://localhost:8080";

const http = axios.create({
  baseURL: API_BASE_URL,
  // Eğer backend cookie tabanlı auth kullanmıyorsa false kalsın.
  // Cookie gerekiyorsa true yaparsın.
  withCredentials: false,
});

// Axios config'e _retry eklemek için (TS)
declare module "axios" {
  export interface AxiosRequestConfig {
    _retry?: boolean;
  }
}

const isAuthFreeEndpoint = (url?: string) => {
  if (!url) return false;
  // Login endpoint'ini buraya ekliyoruz ki 401/403 loop olmasın
  return url.includes("/api/auth/login");
};

http.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  // Header objesi yoksa oluştur
  config.headers = config.headers ?? {};

  // Zaten set edilmişse dokunma
  const alreadyHasAuth =
    typeof (config.headers as any).Authorization !== "undefined";

  if (token && !alreadyHasAuth) {
    (config.headers as any).Authorization = `Bearer ${token}`;
  }

  return config;
});

http.interceptors.response.use(
  (res) => res,
  (error: AxiosError) => {
    const status = error.response?.status;
    const config = error.config;

    const isUnauthorized = status === 401 || status === 403;

    const onLoginPage = window.location.pathname === "/login";
    const safeToRedirect =
      !onLoginPage && !isAuthFreeEndpoint(config?.url ?? "");

    // loop önlemi + aynı request'e tekrar tekrar işlem yapma
    if (isUnauthorized && config && !config._retry && safeToRedirect) {
      config._retry = true;

      // Token invalid => temizle
      localStorage.removeItem("token");

      // SPA navigate yerine replace: geri tuşu ile loop yaşamazsın
      window.location.replace("/login");
    }

    return Promise.reject(error);
  }
);

export default http;
