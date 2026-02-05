import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authService } from "../services/authService";
import { isAdminFromToken } from "../utils/jwt";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Clear stale checkout data (address, payment method) when landing on login page
  // This prevents previous user's data from leaking into a new guest session
  React.useEffect(() => {
    localStorage.removeItem("deliveryAddress");
    localStorage.removeItem("paymentMethod");
    localStorage.removeItem("profile");
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      setLoading(true);

      const token = await authService.login(email, password);

      if (isAdminFromToken(token)) {
        navigate("/admin/dashboard", { replace: true });
        return;
      }

      navigate("/", { replace: true });
    } catch (err: any) {
      let msg = err?.response?.data?.message || "Giriş başarısız.";
      if (msg === "Bad credentials") {
        msg = "E-posta veya şifre hatalı.";
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-white rounded-2xl shadow-sm border p-8">
        <h1 className="text-2xl font-semibold mb-2">Giriş Yap</h1>
        <p className="text-gray-500 mb-6">
          Devam etmek için hesabına giriş yap.
        </p>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              E-posta veya Kullanıcı Adı
            </label>
            <input
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="ornek@gmail.com veya kullaniciadi"
              autoComplete="username"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Şifre
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••"
              autoComplete="current-password"
            />
          </div>

          <button
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 text-white py-3 font-medium hover:bg-blue-700 transition disabled:opacity-60"
          >
            {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
          </button>
        </form>

        <div className="mt-6 text-sm text-gray-600">
          Hesabın yok mu?{" "}
          <Link to="/register" className="text-blue-600 hover:underline">
            Üye ol
          </Link>
          <span className="text-gray-400"> (opsiyonel)</span>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100 text-center">
          <Link 
            to="/" 
            className="text-sm font-medium text-slate-500 hover:text-slate-800 transition flex items-center justify-center gap-1 group"
          >
            Üye olmadan devam et 
            <span className="group-hover:translate-x-0.5 transition-transform">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
