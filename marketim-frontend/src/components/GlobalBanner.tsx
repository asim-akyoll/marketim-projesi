import { useEffect, useState } from "react";
import { AlertCircle, Truck, Clock, Smartphone } from "lucide-react";
import { publicSettingsService, type PublicSettings } from "../services/publicSettingsService";
import { isShopOpen } from "../utils/timeUtils";

export const GlobalBanner = () => {
    const [settings, setSettings] = useState<PublicSettings | null>(null);
    const [msgIndex, setMsgIndex] = useState(0);

    useEffect(() => {
        publicSettingsService.get().then(setSettings).catch(() => {});
    }, []);

    // Construct messages array regardless of critical checks (but empty if no settings)
    const messages = [];
    if (settings) {
        // Message 1: Free Delivery
        if (settings.deliveryFreeThreshold > 0) {
            messages.push({
                bg: "bg-green-600",
                icon: <Truck size={18} />,
                content: (
                    <span>
                         <strong>{settings?.deliveryFreeThreshold || 300} TL</strong> ve üzeri siparişlerde <strong>ÜCRETSİZ TESLİMAT!</strong>
                    </span>
                 )
            });
        }
        // Message 2: Estimated Delivery
        if (settings.estimatedDeliveryMinutes) {
            messages.push({
                bg: "bg-green-600",
                icon: <Clock size={18} />,
                content: (
                    <span>
                        Ortalama Teslimat Süresi: <strong>{settings.estimatedDeliveryMinutes} dakika</strong>
                    </span>
                )
            });
        }
        // Message 3: Working Hours
        if (settings.workingHoursEnabled && settings.openingTime && settings.closingTime) {
            messages.push({
                 bg: "bg-green-600",
                 icon: <Clock size={18} />,
                 content: (
                     <span>
                         Çalışma Saatleri: <strong>{settings.openingTime} - {settings.closingTime}</strong>
                     </span>
                 )
            });
        }
        // Message 4: App Install Prompt
        messages.push({
            bg: "bg-green-600",
            icon: <Smartphone size={18} />,
            content: (
                <span>
                    <strong>İndir</strong> ile uygulamayı hemen yükle.
                </span>
            )
        });
    }

    // Effect for rotation MUST be at top level
    useEffect(() => {
        if (messages.length <= 1) return;
        const interval = setInterval(() => {
            setMsgIndex((prev) => (prev + 1) % messages.length);
        }, 3000);
        return () => clearInterval(interval);
    }, [messages.length]);

    // RENDER LOGIC STARTS HERE
    if (!settings) return null;

    // 1. Priority: Order Accepting Disabled
    if (!settings.orderAcceptingEnabled) {
        return (
            <div className="bg-red-600 text-white px-4 py-3 text-center text-sm font-medium shadow-md flex items-center justify-center gap-2">
                <AlertCircle size={18} />
                <span>
                    ⚠️ Şu anda sipariş alımı geçici olarak durdurulmuştur.
                </span>
            </div>
        );
    }

    // 2. Priority: Working Hours Closed
    const isOpen = isShopOpen(settings.openingTime || "09:00", settings.closingTime || "22:00");
    if (settings.workingHoursEnabled && !isOpen) {
        return (
             <div className="bg-orange-600 text-white px-4 py-3 text-center text-sm font-medium shadow-md flex items-center justify-center gap-2">
                <Clock size={18} />
                <span>
                    🕓 Şu an mağazamız kapalıdır. <strong>{settings.openingTime}</strong> itibarıyla hizmetinizdeyiz.
                </span>
            </div>
        );
    }

    // 3. Priority: Rotating Info
    if (messages.length === 0) return null;

    // Safety check for index
    const safeIndex = msgIndex % messages.length;
    const currentMsg = messages[safeIndex];

    return (
        <div className={`${currentMsg.bg} text-white px-2 py-2 h-10 text-center text-xs md:text-sm font-medium shadow-md flex items-center justify-center gap-2 transition-colors duration-500 overflow-hidden whitespace-nowrap`}>
            {currentMsg.icon}
            {currentMsg.content}
        </div>
    );
};
