import { Link } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";

const OrderSuccess = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <div className="bg-white rounded-2xl shadow-sm border p-10 text-center">
        <div className="flex justify-center mb-4">
          <CheckCircle2 className="w-16 h-16 text-green-600" />
        </div>

        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          Siparişiniz alındı 🎉
        </h1>

        <p className="text-gray-600 mb-8">
          Siparişiniz başarıyla oluşturuldu. En kısa sürede hazırlayıp teslim
          edeceğiz.
        </p>

        <div className="flex items-center justify-center">
          <Link
            to="/"
            className="px-6 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition font-medium"
          >
            Alışverişe Devam Et
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
