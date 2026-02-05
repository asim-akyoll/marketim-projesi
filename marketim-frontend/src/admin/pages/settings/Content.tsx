import { Save, FileText, Shield, HelpCircle, AlertCircle } from "lucide-react";
import { useSettings } from "../../context/SettingsContext";

const Content = () => {
  const { settings, updateField, saveSettings, loading } = useSettings();

  if (loading || !settings) return null;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">İçerik Yönetimi</h2>

      <div className="grid grid-cols-1 gap-6">
        {/* FAQ */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <HelpCircle className="text-blue-600" size={20} />
            Sıkça Sorulan Sorular (SSS)
          </h3>
          <textarea
            rows={6}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            value={settings.faqText ?? ""}
            onChange={(e) => updateField("faqText", e.target.value)}
            placeholder="SSS metnini buraya giriniz..."
          />
        </div>

        {/* Terms */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <AlertCircle className="text-blue-600" size={20} />
            Kurallar & Şartlar
          </h3>
          <textarea
            rows={6}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            value={settings.termsText ?? ""}
            onChange={(e) => updateField("termsText", e.target.value)}
            placeholder="Kurallar metnini buraya giriniz..."
          />
        </div>

        {/* KVKK */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <Shield className="text-blue-600" size={20} />
            KVKK Metni
          </h3>
          <textarea
            rows={6}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            value={settings.kvkkText ?? ""}
            onChange={(e) => updateField("kvkkText", e.target.value)}
            placeholder="KVKK metnini buraya giriniz..."
          />
        </div>

        {/* Distance Sales */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <FileText className="text-blue-600" size={20} />
            Mesafeli Satış Sözleşmesi
          </h3>
          <textarea
            rows={6}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            value={settings.distanceSalesText ?? ""}
            onChange={(e) => updateField("distanceSalesText", e.target.value)}
            placeholder="Mesafeli satış sözleşmesi metnini giriniz..."
          />
        </div>
      </div>

      <div className="flex justify-end sticky bottom-6">
        <button
          onClick={saveSettings}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 font-medium shadow-lg"
        >
          <Save size={20} />
          Tümünü Kaydet
        </button>
      </div>
    </div>
  );
};

export default Content;
