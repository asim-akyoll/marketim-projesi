import { Plus, Image as ImageIcon, X } from "lucide-react";
import type { Product } from "../../types";
import { useMemo, useState } from "react";

type Props = {
  product: Product;
  onAdd: () => void;
};

const formatTry = (value: number) =>
  new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 2,
  }).format(value);

export default function ProductCard({ product, onAdd }: Props) {
  const [imgFailed, setImgFailed] = useState(false);

  // Boş string / null / undefined / hata aldı -> placeholder
  const shouldShowImage = useMemo(() => {
    const url = (product as any).imageUrl as string | undefined;
    return Boolean(url && url.trim().length > 0) && !imgFailed;
  }, [product, imgFailed]);

  const isOutOfStock = product.stock <= 0;

  return (
    <div
      className={`bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col ${
        isOutOfStock ? "opacity-60 grayscale pointer-events-none" : ""
      }`}
    >
      <div className="relative">
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/10 z-10 flex items-center justify-center">
            <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded shadow-sm">
              TÜKENDİ
            </span>
          </div>
        )}
        {shouldShowImage ? (
          <img
            src={(product as any).imageUrl}
            alt={product.name}
            className="w-full h-44 object-cover"
            loading="lazy"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <div className="w-full h-44 bg-gray-100 flex items-center justify-center">
            <div className="flex flex-col items-center text-gray-400">
              <ImageIcon className="w-8 h-8" />
              <span className="text-xs mt-1">Görsel yok</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <div className="flex-1">
          <div className="font-semibold text-gray-900">{product.name}</div>
          {(product as any).unitLabel && (
            <div className="text-sm text-gray-500">
              {(product as any).unitLabel}
            </div>
          )}
        </div>

        <div className="mt-3 flex items-end justify-between">
          <div className="text-lg font-bold text-green-600">
            {formatTry(Number(product.price))}
          </div>

          <button
            onClick={onAdd}
            disabled={isOutOfStock}
            className={`h-11 w-11 rounded-full flex items-center justify-center transition ${
              isOutOfStock
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-green-50 text-green-700 hover:bg-green-100"
            }`}
            aria-label={isOutOfStock ? "Tükendi" : "Sepete ekle"}
            title={isOutOfStock ? "Tükendi" : "Sepete ekle"}
          >
            {isOutOfStock ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
