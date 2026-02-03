import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { publicSettingsService } from "../../services/publicSettingsService";

interface HeroSectionProps {
  onStartShopping: () => void;
}

const HeroSection = ({ onStartShopping }: HeroSectionProps) => {
  const [storeName, setStoreName] = useState("Marketim");

  useEffect(() => {
    publicSettingsService.get().then((res) => {
      if (res.storeName) setStoreName(res.storeName);
    });
  }, []);

  return (
    <div className="relative w-full h-[400px] mb-8 overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/hero-bg.png')" }}
      >
        {/* Overlay - Gradient for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-slate-900/60 to-transparent"></div>
      </div>

      {/* Content */}
      <div className="relative h-full max-w-6xl mx-auto px-4 flex flex-col justify-center text-white">
        <div className="max-w-2xl animate-fade-in-up">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 drop-shadow-md">
            <span className="text-green-400">{storeName}</span>'e Hoşgeldiniz
          </h1>
          <p className="text-lg md:text-xl text-slate-200 mb-8 leading-relaxed max-w-lg drop-shadow">
            Haftalık taze meyve sebze, kasap ve şarküteri ürünleri kapınıza gelsin. 
            En taze ürünler, en uygun fiyatlarla.
          </p>
          
          <button
            onClick={onStartShopping}
            className="group flex items-center gap-3 px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-full transition-all shadow-lg hover:shadow-green-500/30 transform hover:-translate-y-1"
          >
            Alışverişe Başla
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
