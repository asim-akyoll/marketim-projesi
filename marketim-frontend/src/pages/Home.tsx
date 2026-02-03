import { useEffect, useMemo, useState, useRef, useLayoutEffect } from "react";
import { ChevronLeft } from "lucide-react";
import { getCategories } from "../services/categoriesService";
import { getProducts } from "../services/productsService";
import type { Category, Product } from "../types";
import { useCart } from "../context/CartContext";
import CustomerHeader from "../components/customer/CustomerHeader";
import ProductCard from "../components/customer/ProductCard";
import CustomerFooter from "../components/customer/CustomerFooter";
import HeroSection from "../components/customer/HeroSection";
import CategoryGrid from "../components/customer/CategoryGrid";

const Home = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(
    undefined
  );
  const [sort, setSort] = useState<string>("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isViewAll, setIsViewAll] = useState(false);
  const { addToCart } = useCart();

  const productsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const CATEGORY_ORDER = [
      "Meyve & Sebze",
      "Atıştırmalık",
      "Su & İçecek",
      "Süt Ürünleri",
      "Kahvaltılık",
      "Fırından",
      "Dondurma",
      "Temel Gıda",
      "Pratik Yemek",
      "Et, Tavuk & Balık",
      "Dondurulmuş",
      "Fit & Form",
      "Kişisel Bakım",
      "Ev Bakım",
      "Evcil Hayvan",
      "Ev & Yaşam",
      "Bebek",
      "Cinsel Sağlık",
    ];

    getCategories()
      .then((data) => {
        const sorted = [...data].sort((a, b) => {
          let indexA = CATEGORY_ORDER.indexOf(a.name);
          let indexB = CATEGORY_ORDER.indexOf(b.name);

          // If not found in the list, push to the end
          if (indexA === -1) indexA = 999;
          if (indexB === -1) indexB = 999;

          return indexA - indexB;
        });
        setCategories(sorted);
      })
      .catch(console.error);
  }, []);

  // Scroll to top whenever view changes (Category selection, Search, Pagination)
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [selectedCategory, search, page, sort, isViewAll]);

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, search, page, sort]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await getProducts(selectedCategory, search, page, 9, sort);
      setProducts(data.content);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const title = useMemo(() => {
    if (!selectedCategory) return "Tüm Ürünler";
    const cat = categories.find((c) => c.id === selectedCategory);
    return cat?.name ?? "Ürünler";
  }, [categories, selectedCategory]);

  const handleStartShopping = () => {
    setIsViewAll(true);
    setPage(0);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <CustomerHeader
        search={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(0);
        }}
        onLogoClick={() => {
            setSelectedCategory(undefined);
            setSearch("");
            setIsViewAll(false);
            setPage(0);
        }}
      />
      
      {!selectedCategory && !search && !isViewAll ? (
        <>
            <HeroSection onStartShopping={handleStartShopping} />
            <CategoryGrid onSelectCategory={(name) => {
                const cat = categories.find(c => c.name === name);
                if (cat) {
                    setSelectedCategory(cat.id);
                    setIsViewAll(false);
                }
            }} />
        </>
      ) : (
        <div className="max-w-6xl mx-auto px-4 py-6" ref={productsRef}>
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <aside className="hidden md:block col-span-12 md:col-span-3">
            <div className="bg-white border border-slate-100 rounded-2xl p-4 sticky top-[84px] shadow-sm">
              <div className="flex items-center justify-between mb-3">
                  <div className="text-lg font-bold text-slate-800">
                    Kategoriler
                  </div>
                  {/* Back Button */}
                  <button 
                    onClick={() => {
                        setSelectedCategory(undefined);
                        setIsViewAll(false);
                        setSearch("");
                        setPage(0);
                    }}
                    className="text-xs text-slate-500 hover:text-green-600 underline"
                  >
                    Vitrini Göster
                  </button>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => {
                    setSelectedCategory(undefined);
                    setIsViewAll(true);
                    setPage(0);
                  }}
                  className={`w-full text-left px-4 py-2 rounded-lg font-medium transition text-sm ${
                    !selectedCategory
                      ? "bg-green-50 text-green-700"
                      : "bg-white hover:bg-slate-50 text-slate-600 border border-transparent hover:border-slate-200"
                  }`}
                >
                  Tüm Ürünler
                </button>

                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      setIsViewAll(false);
                      setPage(0);
                    }}
                    className={`w-full text-left px-4 py-2 rounded-lg font-medium transition text-sm ${
                      selectedCategory === cat.id
                        ? "bg-green-50 text-green-700"
                        : "bg-white hover:bg-slate-50 text-slate-600 border border-transparent hover:border-slate-200"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Main */}
          <main className="col-span-12 md:col-span-9">
             {/* Mobile Back Button */}
             <button 
                onClick={() => {
                    setSelectedCategory(undefined);
                    setIsViewAll(false);
                    setSearch("");
                    setPage(0);
                }}
                className="md:hidden flex items-center gap-1 text-slate-500 hover:text-slate-800 mb-4 transition-colors"
             >
                <ChevronLeft size={20} />
                <span className="text-sm font-medium">Kategorilere Dön</span>
             </button>

            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="text-2xl font-extrabold text-slate-900">
                  {title}
                </div>
                <div className="text-sm text-slate-500 mt-1">
                  {loading
                    ? "Ürünler yükleniyor..."
                    : `${products.length} ürün listeleniyor`}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-slate-600">Sıralama:</span>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="h-10 pl-3 pr-8 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm"
                >
                  <option value="">Varsayılan</option>
                  <option value="price,asc">En Düşük Fiyat</option>
                  <option value="price,desc">En Yüksek Fiyat</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="py-20 text-center text-slate-500">
                <div className="animate-spin w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                Ürünler yükleniyor...
              </div>
            ) : products.length === 0 ? (
              <div className="py-20 text-center">
                <div className="text-lg font-bold text-slate-900">
                  {selectedCategory
                    ? "Bu kategoride ürün yok"
                    : "Ürün bulunamadı"}
                </div>

                <div className="text-sm text-slate-500 mt-2">
                  {selectedCategory
                    ? "Farklı bir kategori seçebilir veya aramayı temizleyebilirsiniz."
                    : "Arama terimini değiştirip tekrar deneyebilirsiniz."}
                </div>

                {(selectedCategory || search) && (
                  <div className="mt-6 flex items-center justify-center gap-3">
                    {search && (
                      <button
                        onClick={() => {
                          setSearch("");
                          setPage(0);
                        }}
                        className="h-10 px-5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition"
                      >
                        Aramayı temizle
                      </button>
                    )}

                    {selectedCategory && (
                      <button
                        onClick={() => {
                          setSelectedCategory(undefined);
                          setPage(0);
                        }}
                        className="h-10 px-5 rounded-full bg-green-600 text-white hover:bg-green-700 transition shadow-sm"
                      >
                        Tüm ürünler
                      </button>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAdd={() => addToCart(product)}
                  />
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-10">
                <button
                  disabled={page === 0}
                  onClick={() => setPage((p) => p - 1)}
                  className="h-10 px-4 rounded-full border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 text-slate-700 transition"
                >
                  Önceki
                </button>

                <span className="text-sm text-slate-600 font-medium">
                  Sayfa {page + 1} / {totalPages}
                </span>

                <button
                  disabled={page === totalPages - 1}
                  onClick={() => setPage((p) => p + 1)}
                  className="h-10 px-4 rounded-full border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 text-slate-700 transition"
                >
                  Sonraki
                </button>
              </div>
            )}
          </main>
        </div>
        </div>
      )}

      <CustomerFooter />
    </div>
  );
};

export default Home;
