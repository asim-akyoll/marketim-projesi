import http from "./http";

export const uploadFile = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await http.post("/api/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  // If backend returns a full URL (Cloudinary), return it directly.
  const url = response.data;
  if (url.startsWith("http")) {
    return url;
  }

  // Otherwise (local dev or relative path), prepend API Base URL
  const apiBase = (import.meta as any).env.VITE_API_BASE_URL || "http://localhost:8080";
  return `${apiBase}${url}`;
};
