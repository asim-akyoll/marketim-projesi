import http from "./http";

export const uploadFile = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await http.post("/api/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  // Backend returns "/uploads/filename.jpg". 
  // We need to prepend the API Base URL so the frontend (Vercel) loads it from the Backend (Railway).
  const apiBase = (import.meta as any).env.VITE_API_BASE_URL || "http://localhost:8080";
  return `${apiBase}${response.data}`;
};
