import http from "./http";

export type PublicSettings = {
  // Delivery
  deliveryFeeFixed: number;
  deliveryFreeThreshold: number;

  // Payment
  payOnDeliveryEnabled: boolean;
  payOnDeliveryMethods: string[];
  ibanFullName: string;
  ibanNumber: string;

  // System
  maintenanceModeEnabled: boolean;
  maintenanceMessage: string;

  // Content
  faqText: string;
  termsText: string;
  kvkkText: string;
  distanceSalesText: string;

  // Store (footer)
  storeName: string;
  phone: string;
  email: string;
  address: string;

  estimatedDeliveryMinutes: string;

  // Working hours (footer)
  workingHoursEnabled: boolean;
  openingTime: string; // WORKING_HOURS_START
  closingTime: string; // WORKING_HOURS_END
  minOrderAmount: number;
  orderAcceptingEnabled: boolean;
};

export const publicSettingsService = {
  async get(): Promise<PublicSettings> {
    const res = await http.get<PublicSettings>("/api/settings");
    return res.data;
  },
};
