import { Save, Clock, MessageSquare, Calendar } from "lucide-react";
import { useSettings } from "../../context/SettingsContext";

const Operations = () => {
  const { settings, updateField, saveSettings, loading } = useSettings();

  if (loading || !settings) return null;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">
        Operasyon & Çalışma Saatleri
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Working Hours */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <Calendar className="text-blue-600" size={20} />
            Çalışma Saatleri
          </h3>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">
                Çalışma Saatleri Kontrolü
              </p>
              <p className="text-sm text-gray-500">
                {settings.workingHoursEnabled
                  ? "Otomatik kontrol aktif"
                  : "Manuel kontrol"}
              </p>
            </div>
            <button
              onClick={() =>
                updateField(
                  "workingHoursEnabled",
                  !settings.workingHoursEnabled
                )
              }
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.workingHoursEnabled ? "bg-green-500" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.workingHoursEnabled
                    ? "translate-x-6"
                    : "translate-x-1"
                }`}
              />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Başlangıç Saati
              </label>
              <input
                type="time"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={settings.workingHoursStart}
                onChange={(e) =>
                  updateField("workingHoursStart", e.target.value)
                }
                disabled={!settings.workingHoursEnabled}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bitiş Saati
              </label>
              <input
                type="time"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={settings.workingHoursEnd}
                onChange={(e) => updateField("workingHoursEnd", e.target.value)}
                disabled={!settings.workingHoursEnabled}
              />
            </div>
          </div>
        </div>

        {/* Delivery Time */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <Clock className="text-blue-600" size={20} />
            Teslimat Süresi
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tahmini Teslimat Süresi (Dakika)
            </label>
            <input
              type="number"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={
                settings.estimatedDeliveryMinutes === 0
                  ? ""
                  : settings.estimatedDeliveryMinutes
              }
              onChange={(e) => {
                const val = e.target.value;
                updateField(
                  "estimatedDeliveryMinutes",
                  val === "" ? 0 : Number(val)
                );
              }}
              placeholder="0"
              onFocus={(e) => e.currentTarget.select()}
            />
            <p className="text-xs text-gray-500 mt-1">
              Müşterilere gösterilecek ortalama teslimat süresi.
            </p>
          </div>
        </div>

        {/* Closed Message */}
        {!settings.orderAcceptingEnabled && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6 lg:col-span-2">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <MessageSquare className="text-blue-600" size={20} />
              Kapalı Durum Mesajı
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sipariş Alımı Kapalı Mesajı
              </label>
              <textarea
                rows={3}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={settings.orderClosedMessage}
                onChange={(e) =>
                  updateField("orderClosedMessage", e.target.value)
                }
                placeholder="Müşterilere gösterilecek mesajı giriniz..."
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <button
          onClick={saveSettings}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 font-medium shadow-sm"
        >
          <Save size={20} />
          Ayarları Kaydet
        </button>
      </div>
    </div>
  );
};

export default Operations;
