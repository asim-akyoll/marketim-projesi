import { Save, CreditCard, Truck, DollarSign, Power } from "lucide-react";
import { useSettings } from "../../context/SettingsContext";

const DeliveryPayment = () => {
  const { settings, updateField, saveSettings, loading } = useSettings();

  if (loading || !settings) return null;

  const paymentMethods = settings.payOnDeliveryMethods || [];

  const togglePaymentMethod = (method: string) => {
    if (paymentMethods.includes(method)) {
      updateField(
        "payOnDeliveryMethods",
        paymentMethods.filter((m) => m !== method)
      );
    } else {
      updateField("payOnDeliveryMethods", [...paymentMethods, method]);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">
        Teslimat & Ödeme Ayarları
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Status & Limits */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <Power className="text-blue-600" size={20} />
            Sipariş Durumu & Limitler
          </h3>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Sipariş Alımı</p>
              <p className="text-sm text-gray-500">
                {settings.orderAcceptingEnabled
                  ? "Şu an sipariş alınıyor"
                  : "Sipariş alımı kapalı"}
              </p>
            </div>
            <button
              onClick={() =>
                updateField(
                  "orderAcceptingEnabled",
                  !settings.orderAcceptingEnabled
                )
              }
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.orderAcceptingEnabled ? "bg-green-500" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.orderAcceptingEnabled
                    ? "translate-x-6"
                    : "translate-x-1"
                }`}
              />
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Minimum Sipariş Tutarı (₺)
            </label>
            <div className="relative">
              <DollarSign
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="number"
                className="pl-10 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={
                  (settings.minOrderAmount ?? 0) === 0 ? "" : settings.minOrderAmount
                }
                onChange={(e) => {
                  const val = e.target.value;
                  updateField("minOrderAmount", val === "" ? 0 : Number(val));
                }}
                placeholder="0"
                onFocus={(e) => e.currentTarget.select()}
              />
            </div>
          </div>
        </div>

        {/* Delivery Settings */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <Truck className="text-blue-600" size={20} />
            Teslimat Ücretleri
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Teslimat Ücreti (₺)
            </label>
            <div className="relative">
              <DollarSign
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="number"
                className="pl-10 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={
                  (settings.deliveryFeeFixed ?? 0) === 0
                    ? ""
                    : settings.deliveryFeeFixed
                }
                onChange={(e) => {
                  const val = e.target.value;
                  updateField("deliveryFeeFixed", val === "" ? 0 : Number(val));
                }}
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ücretsiz Teslimat Eşiği (₺)
            </label>
            <div className="relative">
              <DollarSign
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="number"
                className="pl-10 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={
                  (settings.deliveryFreeThreshold ?? 0) === 0
                    ? ""
                    : settings.deliveryFreeThreshold
                }
                onChange={(e) => {
                  const val = e.target.value;
                  updateField(
                    "deliveryFreeThreshold",
                    val === "" ? 0 : Number(val)
                  );
                }}
                placeholder="0"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Bu tutarın üzerindeki siparişlerde teslimat ücretsiz olur.
            </p>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6 lg:col-span-2">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <CreditCard className="text-blue-600" size={20} />
            Ödeme Yöntemleri
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { key: "CASH", label: "Kapıda Nakit Ödeme" },
              {
                key: "CARD",
                label: "Kapıda Kredi Kartı",
              },
              { key: "IBAN", label: "IBAN / Havale" },
            ].map((method) => (
              <label
                key={method.key}
                className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${
                  paymentMethods.includes(method.key)
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-blue-200"
                }`}
              >
                <input
                  type="checkbox"
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  checked={paymentMethods.includes(method.key)}
                  onChange={() => togglePaymentMethod(method.key)}
                />
                <span className="ml-3 font-medium text-gray-700">
                  {method.label}
                </span>
              </label>
            ))}
          </div>
        </div>
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

export default DeliveryPayment;
