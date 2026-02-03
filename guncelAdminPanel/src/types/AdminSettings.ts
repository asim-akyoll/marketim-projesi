export interface AdminSettings {
  // Delivery
  deliveryFeeFixed: number;
  deliveryFreeThreshold: number;

  // Payment
  payOnDeliveryEnabled: boolean;
  payOnDeliveryMethods: string[];

  // Order rules
  minOrderAmount: number;
  orderAcceptingEnabled: boolean;

  // Working hours
  workingHoursEnabled: boolean;
  workingHoursStart: string;
  workingHoursEnd: string;

  // Info
  estimatedDeliveryMinutes: number;
  deliveryZones: string[];
  orderClosedMessage: string;
  returnCancelPolicyText: string;

  // Store info
  storeName: string;
  storeLogo: string;
  storePhone: string;
  storeEmail: string;
  storeAddress: string;

  // Invoice
  invoiceTitle: string;
  invoiceTaxNumber: string;
  invoiceTaxOffice: string;

  // System
  maintenanceModeEnabled: boolean;
  maintenanceMessage: string;

  // Content
  faqText: string;
  termsText: string;
  kvkkText: string;
  distanceSalesText: string;
}
