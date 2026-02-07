import { Link, useLocation } from "react-router-dom";
import { Search, ShoppingCart, User, Truck, ShoppingBag, Smartphone, ArrowDown } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useState, useRef, useEffect } from "react";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { publicSettingsService } from "../../services/publicSettingsService";
import { authService } from "../../services/authService";
import toast from "react-hot-toast";

import { isShopOpen } from "../../utils/timeUtils";

type Props = {
  search: string;
  onSearchChange: (v: string) => void;
  onLogoClick?: () => void;
};

export default function CustomerHeader({ search, onSearchChange, onLogoClick }: Props) {
  const { cart } = useCart();
  const location = useLocation();
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [estimatedTime, setEstimatedTime] = useState<string>("");
  const [minAmount, setMinAmount] = useState<number>(0);
  const [deliveryFee, setDeliveryFee] = useState<number>(0);
  const [openingTime, setOpeningTime] = useState<string>("09:00");
  const [closingTime, setClosingTime] = useState<string>("22:00");

  const [storeName, setStoreName] = useState<string>("Marketim");

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Check if event was already caught globally
    if ((window as any).deferredPrompt) {
      setDeferredPrompt((window as any).deferredPrompt);
    }

    const handler = (e: any) => {
      e.preventDefault();
      (window as any).deferredPrompt = e; // Persist globally
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      toast.error("Uygulamayı yüklemek için tarayıcı menüsünden 'Ana ekrana ekle' seçeneğini kullanın.", {
        duration: 5000,
      });
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      (window as any).deferredPrompt = null;
    }
  };

  useEffect(() => {
    publicSettingsService.get().then((res) => {
      if (res.storeName) setStoreName(res.storeName);
      if (res.estimatedDeliveryMinutes) {
        setEstimatedTime(res.estimatedDeliveryMinutes);
      }
      if (res.minOrderAmount) setMinAmount(res.minOrderAmount);
      if (res.deliveryFeeFixed) setDeliveryFee(res.deliveryFeeFixed);
      if (res.openingTime) setOpeningTime(res.openingTime);
      if (res.closingTime) setClosingTime(res.closingTime);
    });
  }, []);

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-2 md:px-4 py-3 flex items-center gap-2 md:gap-4">
        <Link 
          to="/" 
          onClick={() => onLogoClick?.()}
          className="font-extrabold text-lg md:text-xl tracking-tight text-green-600 shrink-0"
        >
          {storeName}
        </Link>

        <div className="flex-1 min-w-0">
          <div className="relative">
            <Search className="absolute left-2.5 md:left-3 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-slate-400" />
            <input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Ara..."
              className="w-full h-9 md:h-11 pl-8 md:pl-10 pr-3 md:pr-4 rounded-full border border-slate-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-sm md:text-base text-slate-700 placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-slate-50 text-slate-700 rounded-full border border-slate-200 text-sm font-medium whitespace-nowrap">
             <div className={`w-2 h-2 rounded-full ${isShopOpen(openingTime, closingTime) ? 'bg-green-500' : 'bg-red-500'}`}></div>
             <span>{openingTime} - {closingTime}</span>
        </div>

        {/* Combine Delivery Time & Fee */}
        <div className="hidden lg:flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 text-orange-700 rounded-full border border-orange-100 text-sm font-medium" title="Minimum Sepet Tutarı">
                <ShoppingBag className="w-4 h-4" />
                <span className="text-xs text-orange-600/80">Min:</span>
                <span>{minAmount} TL</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full border border-blue-100 text-sm font-medium" title="Tahmini Teslimat Süresi ve Ücreti">
                 <Truck className="w-4 h-4" />
                 <span>{estimatedTime ? `${estimatedTime} dk` : ""}</span>
                 {estimatedTime && <span className="text-blue-300">|</span>}
                 <span>{deliveryFee === 0 ? "Ücretsiz" : `${deliveryFee} TL`}</span>
            </div>
        </div>

        <div className="flex items-center gap-1 md:gap-2 shrink-0">
          <Link
            to="/cart"
            className={`relative h-9 w-9 md:h-11 md:w-11 rounded-full border flex items-center justify-center hover:bg-slate-50 transition ${
              isActive("/cart") ? "border-green-500 bg-green-50" : "border-slate-200"
            }`}
            aria-label="Sepet"
            title="Sepet"
          >
            <ShoppingCart className={`w-4 h-4 md:w-5 md:h-5 ${isActive("/cart") ? "text-green-700" : "text-slate-700"}`} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[1.25rem] h-5 px-1 rounded-full bg-green-600 text-white text-xs flex items-center justify-center border-2 border-white">
                {cartCount}
              </span>
            )}
          </Link>

          <div className="relative flex items-center" ref={dropdownRef}>
            <button
              onClick={handleInstallClick}
              className="flex items-center justify-center w-9 h-9 md:w-11 md:h-11 mr-1 md:mr-2 rounded-full border border-slate-200 hover:bg-green-50 text-green-600 transition shadow-sm animate-pulse group"
              title="Uygulamayı Yükle"
            >
              <div className="relative flex items-center justify-center">
                <Smartphone className="w-5 h-5 md:w-6 md:h-6 stroke-[1.5]" />
                <ArrowDown className="absolute w-2.5 h-2.5 md:w-3 md:h-3 stroke-[2.5] pt-0.5" />
              </div>
            </button>
            <button
              onClick={() => setOpen((v) => !v)}
              className={`flex items-center justify-center w-9 h-9 md:w-11 md:h-11 rounded-full border border-slate-200 hover:bg-slate-50 transition ${
                 open ? "bg-slate-100 ring-2 ring-slate-100" : "bg-white"
              }`}
              title="Hesabım"
            >
              <User className={`w-4 h-4 md:w-5 md:h-5 ${open ? "text-slate-900" : "text-slate-700"}`} />
            </button>

            {open && (
              <div className="absolute right-0 top-12 md:top-14 w-48 bg-white border border-slate-100 rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-4 py-3 border-b border-slate-50 bg-slate-50/50">
                   <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Hesabım</p>
                </div>
                <button
                  onClick={() => {
                    navigate("/account");
                    setOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-slate-50 text-sm text-slate-700 font-medium transition-colors"
                >
                  Profilim
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 hover:bg-red-50 text-sm text-red-600 flex items-center gap-2 font-medium transition-colors border-t border-slate-50"
                >
                  <LogOut className="w-4 h-4" />
                  Çıkış Yap
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
