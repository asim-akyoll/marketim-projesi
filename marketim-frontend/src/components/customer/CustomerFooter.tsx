import { useEffect, useMemo, useState } from "react";
import {
  publicSettingsService,
  type PublicSettings,
} from "../../services/publicSettingsService";
import { MapPin, Phone, Clock } from "lucide-react";
import Modal from "../ui/Modal";

export default function CustomerFooter() {
  const [settings, setSettings] = useState<PublicSettings | null>(null);
  const [modal, setModal] = useState<
    null | "kvkk" | "terms" | "faq" | "distance"
  >(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await publicSettingsService.get();
        setSettings(data);
      } catch {
        setSettings(null);
      }
    })();
  }, []);

  const storeName = settings?.storeName || "Marketim";
  const phone = settings?.phone || "";
  const email = settings?.email || "";
  const address = settings?.address || "";

  const hoursText = useMemo(() => {
    if (!settings) return "Bilgiler yükleniyor...";
    if (!settings.workingHoursEnabled) return "Şu an kapalı olabilir";
    if (!settings.openingTime || !settings.closingTime)
      return "Saat bilgisi yok";
    return `${settings.openingTime} – ${settings.closingTime}`;
  }, [settings]);

  const year = new Date().getFullYear();

  const kvkkText = settings?.kvkkText?.trim() || "İçerik bulunamadı.";
  const termsText = settings?.termsText?.trim() || "İçerik bulunamadı.";
  const distanceText =
    settings?.distanceSalesText?.trim() || "İçerik bulunamadı.";
  const faqText = settings?.faqText?.trim() || "İçerik bulunamadı.";

  return (
    <footer className="mt-auto bg-slate-800 text-slate-300 border-t border-slate-700">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Üst Kısım: Marka ve Slogan */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-700">
          <div>
            <div className="text-2xl font-extrabold tracking-tight text-white mb-1">
              <span className="text-green-500">{storeName}</span>
            </div>
            <p className="text-slate-400 text-sm max-w-sm leading-relaxed">
              mahallenizin en taze, en hızlı ve güvenilir marketi.
            </p>
          </div>

          <div className="flex gap-2">
             {["Hızlı Teslimat", "Taze Ürünler", "Güvenli Ödeme"].map((badge) => (
                <span key={badge} className="px-3 py-1 rounded-full bg-slate-700 border border-slate-600 text-xs font-medium text-slate-300">
                  {badge}
                </span>
             ))}
          </div>
        </div>

        {/* Orta Kısım: Grid Info */}
        <div className="py-8 grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Adres */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 text-white font-semibold text-base">
                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-green-500">
                        <MapPin size={18} />
                    </div>
                    Adres
                </div>
                <p className="text-sm leading-relaxed text-slate-400 pl-10">
                    {address || "Adres bilgisi girilmemiştir."}
                </p>
            </div>

            {/* İletişim */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 text-white font-semibold text-base">
                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-green-500">
                        <Phone size={18} />
                    </div>
                    İletişim
                </div>
                <div className="space-y-1.5 text-sm text-slate-400 pl-10">
                     <div className="flex items-center gap-2">
                        <span className="w-14">Telefon:</span>
                        {phone ? (
                            <a href={`tel:${phone}`} className="text-white hover:text-green-400 transition-colors">{phone}</a>
                        ) : "—"}
                     </div>
                     <div className="flex items-center gap-2">
                        <span className="w-14">E-posta:</span>
                         {email ? (
                            <a href={`mailto:${email}`} className="text-white hover:text-green-400 transition-colors">{email}</a>
                        ) : "—"}
                     </div>
                </div>
            </div>

            {/* Çalışma Saatleri */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 text-white font-semibold text-base">
                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-green-500">
                        <Clock size={18} />
                    </div>
                   Saatler
                </div>
                <div className="text-sm text-slate-400 pl-10">
                    <p className="mb-0.5">{hoursText}</p>
                    <p className="text-xs text-slate-500">Haftanın her günü.</p>
                </div>
            </div>
        </div>

        {/* Alt Kısım: Copyright ve Linkler */}
        <div className="pt-6 border-t border-slate-700 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            &copy; {year} <span className="text-white font-medium">{storeName}</span>. Tüm hakları saklıdır.
          </div>
          
          <div className="flex gap-4">
             <button onClick={() => setModal("kvkk")} className="hover:text-green-400 transition-colors">KVKK</button>
             <button onClick={() => setModal("terms")} className="hover:text-green-400 transition-colors">Kullanım Şartları</button>
             <button onClick={() => setModal("distance")} className="hover:text-green-400 transition-colors">Mesafeli Satış</button>
             <button onClick={() => setModal("faq")} className="hover:text-green-400 transition-colors">S.S.S</button>
          </div>
        </div>
      </div>

      {/* MODALS */}
      <Modal
        open={modal === "kvkk"}
        title="KVKK Aydınlatma Metni"
        onClose={() => setModal(null)}
      >
        {kvkkText}
      </Modal>

      <Modal
        open={modal === "terms"}
        title="Kullanım Şartları"
        onClose={() => setModal(null)}
      >
        {termsText}
      </Modal>

      <Modal
        open={modal === "distance"}
        title="Mesafeli Satış Sözleşmesi"
        onClose={() => setModal(null)}
      >
        {distanceText}
      </Modal>

      <Modal
        open={modal === "faq"}
        title="Sıkça Sorulan Sorular"
        onClose={() => setModal(null)}
      >
        {faqText}
      </Modal>
    </footer>
  );
}
