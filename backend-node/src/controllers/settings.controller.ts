import { Request, Response } from "express";
import prisma from "../config/prisma";

// Map DB Keys to API Keys
const KEY_MAP: Record<string, string> = {
    STORE_NAME: "storeName",
    STORE_PHONE: "phone",
    STORE_EMAIL: "email",
    STORE_ADDRESS: "address",
    DELIVERY_FEE: "deliveryFeeFixed",
    FREE_DELIVERY_THRESHOLD: "deliveryFreeThreshold",
    PAY_ON_DELIVERY_ENABLED: "payOnDeliveryEnabled",
    IBAN_FULL_NAME: "ibanFullName",
    IBAN_NUMBER: "ibanNumber",
    MAINTENANCE_MODE: "maintenanceModeEnabled",
    MAINTENANCE_MESSAGE: "maintenanceMessage",
    FAQ_TEXT: "faqText",
    TERMS_TEXT: "termsText",
    KVKK_TEXT: "kvkkText",
    DISTANCE_SALES_TEXT: "distanceSalesText",
    ESTIMATED_DELIVERY_MINUTES: "estimatedDeliveryMinutes",
    WORKING_HOURS_ENABLED: "workingHoursEnabled",
    WORKING_HOURS_START: "openingTime",
    WORKING_HOURS_END: "closingTime",
    MIN_ORDER_AMOUNT: "minOrderAmount",
    ORDER_ACCEPTING_ENABLED: "orderAcceptingEnabled"
};

// Reverse Map
const REVERSE_KEY_MAP = Object.entries(KEY_MAP).reduce((acc, [k, v]) => ({ ...acc, [v]: k }), {} as Record<string, string>);

export const getSettings = async (req: Request, res: Response) => {
    try {
        const settings = await prisma.settings.findMany();
        const response: any = {};

        // Default values
        response.payOnDeliveryMethods = ["CASH", "CREDIT_CARD"]; 

        settings.forEach((s: any) => {
            const apiKey = KEY_MAP[s.setting_key];
            if (apiKey) {
                // Type conversion
                if (['payOnDeliveryEnabled', 'maintenanceModeEnabled', 'workingHoursEnabled', 'orderAcceptingEnabled'].includes(apiKey)) {
                    response[apiKey] = s.setting_value === 'true';
                } else if (['deliveryFeeFixed', 'deliveryFreeThreshold', 'minOrderAmount'].includes(apiKey)) {
                    response[apiKey] = parseFloat(s.setting_value);
                } else {
                    response[apiKey] = s.setting_value;
                }
            }
        });

        res.json(response);
    } catch (error) {
        console.error("Get Settings Error:", error);
        res.status(500).json({ message: "Error fetching settings" });
    }
};

export const updateSettings = async (req: Request, res: Response) => {
    try {
        const updates = req.body; // Expects camelCase keys
        const promises = [];

        for (const [key, value] of Object.entries(updates)) {
            const dbKey = REVERSE_KEY_MAP[key];
            if (dbKey) {
                const strValue = String(value);
                promises.push(
                    prisma.settings.upsert({
                        where: { setting_key: dbKey },
                        update: { setting_value: strValue, updated_at: new Date() },
                        create: { setting_key: dbKey, setting_value: strValue, updated_at: new Date() }
                    })
                );
            }
        }

        await prisma.$transaction(promises);
        res.json({ message: "Settings updated" });

    } catch (error: any) {
        console.error("Update Settings Error:", error);
        console.error("Payload:", JSON.stringify(req.body)); // Log the payload
        res.status(500).json({ message: "Error updating settings: " + (error.message || String(error)) });
    }
};
