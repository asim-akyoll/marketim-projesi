import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import { toast } from "react-hot-toast";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await authService.register(formData);
      toast.success("Kayıt başarılı! Giriş yapabilirsiniz.");
      navigate("/login");
    } catch (error: any) {
      console.error(error);
      toast.error(
        "Kayıt başarısız. " + (error.response?.data?.message || "Bir hata oluştu")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">
            Kayıt Ol
          </h1>
          <p className="text-slate-500">
            KöşeBaşı Market ailesine katılın
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
            <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Ad Soyad
            </label>
            <input
              type="text"
              required
              value={formData.fullName}
              onChange={(e) =>
                setFormData({ ...formData, fullName: e.target.value })
              }
              className="w-full h-11 px-4 rounded-lg border border-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 transition outline-none"
              placeholder="Adınız Soyadınız"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              E-posta Adresi
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full h-11 px-4 rounded-lg border border-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 transition outline-none"
              placeholder="ornek@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Telefon Numarası
            </label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              className="w-full h-11 px-4 rounded-lg border border-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 transition outline-none"
              placeholder="0555 555 55 55"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Şifre
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="w-full h-11 px-4 rounded-lg border border-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 transition outline-none"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition shadow-sm hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed mt-4"
          >
            {loading ? "Kayıt Yapılıyor..." : "Kayıt Ol"}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-slate-500">
          Zaten hesabınız var mı?{" "}
          <Link
            to="/login"
            className="font-semibold text-green-600 hover:text-green-700 hover:underline"
          >
            Giriş Yap
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
