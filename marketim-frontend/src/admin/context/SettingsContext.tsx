import React, { createContext, useContext, useEffect, useState } from "react";
import type { AdminSettings } from "../types/AdminSettings";
import { toast } from "react-hot-toast";

import {
  getAdminSettings,
  updateAdminSettings,
} from "../services/settingsService";

interface SettingsContextType {
  settings: AdminSettings | null;
  updateField: <K extends keyof AdminSettings>(
    key: K,
    value: AdminSettings[K]
  ) => void;
  saveSettings: () => Promise<void>;
  loading: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
);

export const SettingsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminSettings()
      .then(setSettings)
      .finally(() => setLoading(false));
  }, []);

  const updateField = <K extends keyof AdminSettings>(
    key: K,
    value: AdminSettings[K]
  ) => {
    if (!settings) return;
    setSettings({ ...settings, [key]: value });
  };

  const saveSettings = async () => {
    if (!settings) return;
    try {
      const updatedSettings = await updateAdminSettings(settings); // Send FULL settings
      setSettings(updatedSettings);
      toast.success("Ayarlar başarıyla kaydedildi");
    } catch (err: any) {
      console.error(err);
      toast.error("Ayarlar güncellenemedi");
      throw err;
    }
  };

  return (
    <SettingsContext.Provider
      value={{ settings, updateField, saveSettings, loading }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error("useSettings must be used inside SettingsProvider");
  }
  return ctx;
};
