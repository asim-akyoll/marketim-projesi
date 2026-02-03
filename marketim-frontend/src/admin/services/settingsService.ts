import http from "./http";
import type { AdminSettings } from "../types/AdminSettings";

export const getAdminSettings = async (): Promise<AdminSettings> => {
  const res = await http.get<AdminSettings>("/api/admin/settings");
  return res.data;
};

export const updateAdminSettings = async (
  payload: AdminSettings
): Promise<AdminSettings> => {
  const res = await http.patch<AdminSettings>("/api/admin/settings", payload);
  return res.data;
};
