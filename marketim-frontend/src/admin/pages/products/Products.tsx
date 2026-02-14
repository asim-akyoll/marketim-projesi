import React, { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, AlertTriangle, Check, X, Power, Upload } from "lucide-react";
import { uploadFile } from "../../../services/fileUploadService";
import {
  createAdminProduct,
  getAdminLowStockProducts,
  getAdminProducts,
  updateAdminProduct,
  type ProductResponse,
} from "../../services/productsService";
import {
  getActiveCategories,
  type CategoryResponse,
} from "../../services/categoriesService";
import {
  getAdminCategories,
  updateAdminCategory,
  toggleAdminCategoryActive,
  deleteAdminCategory,
  type CategoryResponse as AdminCategoryResponse,
} from "../../services/adminCategoriesService";
// ... inside CategoryManager component ...
const CategoryManager = () => {
  const [categories, setCategories] = useState<AdminCategoryResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  // Editing state
  const [isEditing, setIsEditing] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const didInit = React.useRef(false);

  useEffect(() => {
    if (!didInit.current) {
      didInit.current = true;
      loadAdminCategories();
    }
  }, []);

  const loadAdminCategories = async () => {
    setIsLoading(true);
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

    try {
      const data = await getAdminCategories();
      const sorted = [...data].sort((a, b) => {
        let indexA = CATEGORY_ORDER.indexOf(a.name);
        let indexB = CATEGORY_ORDER.indexOf(b.name);

        // If not found in the list, push to the end
        if (indexA === -1) indexA = 999;
        if (indexB === -1) indexB = 999;

        return indexA - indexB;
      });
      setCategories(sorted);
    } catch (error) {
      console.error("Kategoriler yüklenirken hata:", error);
    } finally {
      setIsLoading(false);
    }
  };



  const startEdit = (cat: AdminCategoryResponse) => {
    setIsEditing(cat.id);
    setEditName(cat.name);
  };

  const handleUpdate = async (id: number) => {
    try {
      await updateAdminCategory(id, { name: editName });
      setIsEditing(null);
      await loadAdminCategories();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleActive = async (id: number) => {
    try {
      await toggleAdminCategoryActive(id);
      await loadAdminCategories();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Bu kategoriyi silmek istediğinize emin misiniz?")) return;
    try {
      await deleteAdminCategory(id);
      await loadAdminCategories();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || "Silme işlemi başarısız.");
    }
  };

  return (
    <div className="space-y-6">
      {/* ... Add New Category Section (unchanged) ... */}
      {/* ... Add New Category Section removed ... */}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-600 text-sm">
            <tr>
              <th className="p-4 font-medium">Kategori</th>
              <th className="p-4 font-medium">Durum</th>
              <th className="p-4 font-medium text-right">İşlemler</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td className="p-4 text-gray-600" colSpan={3}>
                  Yükleniyor...
                </td>
              </tr>
            ) : (categories?.length ?? 0) === 0 ? (
              <tr>
                <td className="p-4 text-gray-600" colSpan={3}>
                  Kategori bulunamadı.
                </td>
              </tr>
            ) : (
              (categories ?? []).map((category) => (
                <tr key={category.id} className="hover:bg-gray-50">
                  <td className="p-4">
                    {isEditing === category.id ? (
                      <input
                        className="px-3 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                      />
                    ) : (
                      <span className="font-medium text-gray-800">
                        {category.name}
                      </span>
                    )}
                  </td>

                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        category.active
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {category.active ? "Aktif" : "Pasif"}
                    </span>
                  </td>

                  <td className="p-4 text-right flex justify-end gap-2">
                    {isEditing === category.id ? (
                      <button
                        onClick={() => handleUpdate(category.id)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded"
                        title="Kaydet"
                      >
                        <Check size={18} />
                      </button>
                    ) : (
                      <button
                        onClick={() => startEdit(category)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        title="Düzenle"
                      >
                        <Edit2 size={18} />
                      </button>
                    )}

                    <button
                      onClick={() => handleToggleActive(category.id)}
                      className={`p-2 rounded ${
                        category.active 
                            ? "text-orange-500 hover:bg-orange-50" 
                            : "text-green-500 hover:bg-green-50"
                      }`}
                      title={category.active ? "Pasife Al" : "Aktife Al"}
                    >
                      <Power size={18} />
                    </button>

                    <button
                      onClick={() => handleDelete(category.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                      title="Sil"
                    >
                      <Trash2 size={18} />
                    </button>

                    {isEditing === category.id && (
                      <button
                        onClick={() => setIsEditing(null)}
                        className="p-2 text-gray-500 hover:bg-gray-100 rounded"
                        title="İptal"
                      >
                        <X size={18} />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- Product Manager Component ---
const ProductManager = () => {
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | "all">(
    "all"
  );
  
  // Search & Pagination State
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const PAGE_SIZE = 15;

  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const didInit = React.useRef(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    categoryId: "",
    price: "",
    stock: "",
    imageUrl: "",
    unitLabel: "",
    barcode: "",
  });

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(0); // Reset to first page on new search
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: "",
      categoryId: categories[0]?.id ? String(categories[0].id) : "",
      price: "",
      stock: "",
      imageUrl: "",
      unitLabel: "",
      barcode: "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (product: any) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      categoryId: product.categoryId ? String(product.categoryId) : "",
      price: String(product.price ?? ""),
      stock: String(product.stock ?? ""),
      imageUrl: product.imageUrl || "",
      unitLabel: product.unitLabel ?? "",
      barcode: product.barcode ?? "",
    });
    setIsModalOpen(true);
  };

  const loadCategories = async () => {
    try {
      const data = await getActiveCategories();
      setCategories(data);
      setFormData((prev) => ({
        ...prev,
        categoryId: prev.categoryId || (data[0]?.id ? String(data[0].id) : ""),
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const res = await getAdminProducts({
        page: currentPage,
        size: PAGE_SIZE,
        sort: "id,desc",
        categoryId:
          selectedCategoryId === "all" ? undefined : selectedCategoryId,
        q: debouncedSearch || undefined,
      });
      setProducts(res.content);
      setTotalPages(res.totalPages);
      setTotalElements(res.totalElements);
    } catch (err) {
      console.error(err);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsUploading(true);
      try {
        let url = await uploadFile(e.target.files[0]);
        // Fallback: If returned URL is relative (starts with /), prepend the production backend URL.
        if (url.startsWith("/")) {
          url = "https://marketim-projesi.onrender.com" + url;
        }
        setFormData((prev) => ({ ...prev, imageUrl: url }));
      } catch (err) {
        console.error("Dosya yükleme hatası:", err);
        alert("Dosya yüklenirken bir hata oluştu.");
      } finally {
        setIsUploading(false);
      }
    }
  };

  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;
    loadCategories();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [selectedCategoryId, currentPage, debouncedSearch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      name: formData.name,
      description: null,
      imageUrl: formData.imageUrl || null,
      price: Number(formData.price),
      stock: Number(formData.stock),
      categoryId: Number(formData.categoryId),
      unitLabel: formData.unitLabel || null,
      barcode: formData.barcode || null,
    };

    try {
      if (editingProduct) {
        await updateAdminProduct(editingProduct.id, payload);
      } else {
        await createAdminProduct(payload);
      }
      setIsModalOpen(false);
      await loadProducts();
    } catch (err) {
      console.error(err);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Category Filter */}
          <select
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedCategoryId}
            onChange={(e) => {
              setSelectedCategoryId(
                e.target.value === "all" ? "all" : Number(e.target.value)
              );
              setCurrentPage(0); // Reset page on category change
            }}
          >
            <option value="all">Tüm Kategoriler</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
              {c.name}
              </option>
            ))}
          </select>

          {/* Search Input */}
          <div className="relative">
             <input 
                type="text"
                placeholder="Ürün ara..."
                className="px-4 py-2 pl-9 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
             />
             <div className="absolute left-3 top-2.5 text-gray-400 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
             </div>
          </div>

          {isLoading && (
            <span className="text-sm text-gray-500">Yükleniyor...</span>
          )}
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus size={20} /> Yeni Ürün Ekle
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-600 text-sm">
            <tr>
              <th className="p-4 font-medium">Ürün Adı</th>
              <th className="p-4 font-medium">Kategori</th>
              <th className="p-4 font-medium">Fiyat</th>
              <th className="p-4 font-medium">Stok</th>
              <th className="p-4 font-medium text-right">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.length === 0 && !isLoading ? (
               <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    Ürün bulunamadı.
                  </td>
               </tr>
            ) : (
                products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                    <td className="p-4 font-medium text-gray-900">
                    {product.name}
                    </td>
                    <td className="p-4 text-gray-600">
                    {product.categoryName ?? "-"}
                    </td>
                    <td className="p-4 text-gray-900">
                    ₺{Number(product.price).toLocaleString("tr-TR")}
                    </td>
                    <td className="p-4">
                    <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                        product.stock <= 10
                            ? "bg-red-100 text-red-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                    >
                        {product.stock}
                        {product.unitLabel ? ` (${product.unitLabel})` : ""} adet
                    </span>
                    </td>
                    <td className="p-4 flex justify-end gap-2">
                    <button
                        onClick={() => openEditModal(product)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                    >
                        <Edit2 size={18} />
                    </button>
                    </td>
                </tr>
                ))
            )}
          </tbody>
        </table>
        
        {/* Pagination Controls */}
        {products.length > 0 && (
            <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50">
               <div className="text-sm text-gray-600">
                  Toplam <strong>{totalElements}</strong> ürün, 
                  Sayfa <strong>{currentPage + 1}</strong> / {totalPages}
               </div>
               <div className="flex gap-2">
                  <button 
                     onClick={() => handlePageChange(currentPage - 1)}
                     disabled={currentPage === 0}
                     className="px-3 py-1 border border-gray-300 rounded hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                     Önceki
                  </button>
                  <button 
                     onClick={() => handlePageChange(currentPage + 1)}
                     disabled={currentPage >= totalPages - 1}
                     className="px-3 py-1 border border-gray-300 rounded hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                     Sonraki
                  </button>
               </div>
            </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800">
                {editingProduct ? "Ürün Düzenle" : "Yeni Ürün Ekle"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label htmlFor="productName" className="block text-sm font-medium text-gray-700 mb-1">
                  Ürün Adı
                </label>
                <input
                  id="productName"
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="flex gap-4 items-start">
                  <div className="w-24 h-24 border rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center relative group">
                    {formData.imageUrl ? (
                      <img
                        src={formData.imageUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Upload className="text-gray-400" size={24} />
                    )}
                     <input
                      id="productImage"
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={handleFileChange}
                      disabled={isUploading}
                    />
                    {isUploading && (
                       <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                       </div>
                    )}
                  </div>
                  <div className="flex-1">
                     <label htmlFor="productImage" className="block text-sm font-medium text-gray-700 mb-1">
                        Ürün Görseli
                      </label>
                      <p className="text-xs text-gray-500 mb-2">
                        Resmi kutuya sürükleyin veya tıklayarak seçin.
                      </p>
                  </div>
              </div>

              <div>
                <label htmlFor="productCategory" className="block text-sm font-medium text-gray-700 mb-1">
                  Kategori
                </label>
                <select
                  id="productCategory"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={formData.categoryId}
                  onChange={(e) =>
                    setFormData({ ...formData, categoryId: e.target.value })
                  }
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="productPrice" className="block text-sm font-medium text-gray-700 mb-1">
                    Fiyat (₺)
                  </label>
                  <input
                    id="productPrice"
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label htmlFor="productStock" className="block text-sm font-medium text-gray-700 mb-1">
                    Stok
                  </label>
                  <input
                    id="productStock"
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={formData.stock}
                    onChange={(e) =>
                      setFormData({ ...formData, stock: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label htmlFor="productUnit" className="block text-sm font-medium text-gray-700 mb-1">
                    Birim Yazısı
                  </label>
                  <input
                    id="productUnit"
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Örn: 1 kg, 500 ml, 2.5 L, 3 L, 15'li, Paket"
                    value={formData.unitLabel}
                    onChange={(e) =>
                      setFormData({ ...formData, unitLabel: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label htmlFor="productBarcode" className="block text-sm font-medium text-gray-700 mb-1">
                    Barkod
                  </label>
                  <input
                    id="productBarcode"
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Ürün barkod numarası (opsiyonel)"
                    value={formData.barcode}
                    onChange={(e) =>
                      setFormData({ ...formData, barcode: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Low Stock Component ---
const LowStockView = () => {
  const [lowStockProducts, setLowStockProducts] = useState<ProductResponse[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(false);
  const didFetch = React.useRef(false);

  useEffect(() => {
    if (didFetch.current) return;
    didFetch.current = true;

    const run = async () => {
      setIsLoading(true);
      try {
        const res = await getAdminLowStockProducts({
          threshold: 10,
          page: 0,
          size: 200,
        });
        setLowStockProducts(res.content);
      } catch (err) {
        console.error(err);
        setLowStockProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    run();
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle className="text-yellow-600 mt-0.5" size={20} />
        <div>
          <h4 className="font-bold text-yellow-800">Düşük Stok Uyarısı</h4>
          <p className="text-sm text-yellow-700 mt-1">
            Aşağıdaki ürünlerin stok miktarı kritik seviyenin (10 adet)
            altındadır.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-600 text-sm">
            <tr>
              <th className="p-4 font-medium">Ürün Adı</th>
              <th className="p-4 font-medium">Kategori</th>
              <th className="p-4 font-medium">Mevcut Stok</th>
              <th className="p-4 font-medium">Durum</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td className="p-4 text-gray-600" colSpan={4}>
                  Yükleniyor...
                </td>
              </tr>
            ) : lowStockProducts.length === 0 ? (
              <tr>
                <td className="p-4 text-gray-600" colSpan={4}>
                  Kritik stok seviyesinde ürün bulunamadı.
                </td>
              </tr>
            ) : (
              lowStockProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-900">
                    {product.name}
                  </td>
                  <td className="p-4 text-gray-600">
                    {product.categoryName ?? "-"}
                  </td>
                  <td className="p-4">
                    <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">
                      {product.stock}
                      {product.unitLabel ? ` (${product.unitLabel})` : ""} adet
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">
                      Stok Takviyesi Gerekli
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- Main Page ---
export default function Products() {
  const [activeTab, setActiveTab] = useState("categories");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Ürün Yönetimi</h2>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab("categories")}
          className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${
            activeTab === "categories"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Kategori Yönetimi
        </button>
        <button
          onClick={() => setActiveTab("products")}
          className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${
            activeTab === "products"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Ürün Yönetimi
        </button>
        <button
          onClick={() => setActiveTab("lowStock")}
          className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${
            activeTab === "lowStock"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Düşük Stok
        </button>
      </div>

      {/* Content */}
      {activeTab === "categories" && <CategoryManager />}
      {activeTab === "products" && <ProductManager />}
      {activeTab === "lowStock" && <LowStockView />}
    </div>
  );
}
