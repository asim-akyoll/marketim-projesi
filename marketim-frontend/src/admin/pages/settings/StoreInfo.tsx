import { Save, Store, Phone, Mail, MapPin } from "lucide-react";
import { useSettings } from "../../context/SettingsContext";

const StoreInfo = () => {
  const { settings, updateField, saveSettings, loading } = useSettings();

  if (loading || !settings) return null;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Mağaza Bilgileri</h2>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6 max-w-2xl">
        <h3 className="font-bold text-gray-800 flex items-center gap-2">
          <Store className="text-blue-600" size={20} />
          Genel Bilgiler
        </h3>

        <div className="space-y-4">
          {/* Mağaza Adı */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mağaza Adı
            </label>
            <div className="relative">
              <Store
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                className="pl-10 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={settings.storeName ?? ""}
                onChange={(e) => updateField("storeName", e.target.value)}
              />
            </div>
          </div>

          {/* Telefon */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Telefon Numarası
            </label>
            <div className="relative">
              <Phone
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="tel"
                className="pl-10 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={settings.phone ?? ""}
                onChange={(e) => updateField("phone", e.target.value)}
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              E-posta Adresi
            </label>
            <div className="relative">
              <Mail
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="email"
                className="pl-10 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={settings.email ?? ""}
                onChange={(e) => updateField("email", e.target.value)}
              />
            </div>
          </div>

          {/* Adres */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Adres
            </label>
            <div className="relative">
              <MapPin
                className="absolute left-3 top-3 text-gray-400"
                size={18}
              />
              <textarea
                rows={3}
                className="pl-10 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={settings.address ?? ""}
                onChange={(e) => updateField("address", e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            onClick={saveSettings}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 font-medium shadow-sm"
          >
            <Save size={20} />
            Kaydet
          </button>
        </div>
      </div>
    </div>
  );
};

export default StoreInfo;
