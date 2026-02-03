import axios from "axios";

const http = axios.create({
  baseURL: "http://localhost:8080",
  headers: {
    "Content-Type": "application/json",
  },
});

// Eğer token varsa otomatik ekle (customer login'i sonra bağlayacağız)
http.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // ileride login sonrası buraya yazacağız
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default http;
