import React, { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, AlertTriangle, Check, X } from "lucide-react";
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
  createAdminCategory,
  updateAdminCategory,
  toggleAdminCategoryActive,
  type CategoryResponse as AdminCategoryResponse,
} from "../../services/adminCategoriesService";

// --- Category Manager Component ---
const CategoryManager = () => {
  const [categories, setCategories] = useState<AdminCategoryResponse[]>([]);
  const [isEditing, setIsEditing] = useState<number | null>(null);
  const [newCategory, setNewCategory] = useState("");
  const [editName, setEditName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Admin categories response normalize:
  // backend dto bazen content dışında bir alanla gelebilir (items/categories vb.)
  const extractCategoryArray = (res: any): AdminCategoryResponse[] => {
    if (!res) return [];
    if (Array.isArray(res)) return res;

    const arr =
      res.content ??
      res.items ??
      res.categories ??
      res.data ??
      res.result ??
      [];

    return Array.isArray(arr) ? arr : [];
  };

  const loadAdminCategories = async () => {
    setIsLoading(true);
    try {
      const res = await getAdminCategories({
        page: 0,
        size: 200,
        sort: "id",
        dir: "desc",
      });

      setCategories(extractCategoryArray(res));
    } catch (err) {
      console.error(err);
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAdminCategories();
  }, []);

  const handleAdd = async () => {
    if (!newCategory.trim()) return;
    try {
      await createAdminCategory({ name: newCategory.trim() });
      setNewCategory("");
      await loadAdminCategories();
    } catch (err) {
      console.error(err);
    }
  };

  const startEdit = (category: AdminCategoryResponse) => {
    setIsEditing(category.id);
    setEditName(category.name);
  };

  const handleUpdate = async (id: number) => {
    if (!editName.trim()) return;
    try {
      await updateAdminCategory(id, { name: editName.trim() });
      setIsEditing(null);
      setEditName("");
      await loadAdminCategories();
    } catch (err) {
      console.error(err);
    }
  };

  // UI'da "sil" vardı. Backend'de delete yok, toggle-active var.
  // Bu yüzden "sil" butonu -> kategori pasif/aktif toggle yapacak.
  const handleDelete = async (id: number) => {
    try {
      await toggleAdminCategoryActive(id);
      await loadAdminCategories();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-4">
          Yeni Kategori Ekle
        </h3>
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Kategori Adı"
            className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
          />
          <button
            onClick={handleAdd}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus size={20} /> Ekle
          </button>
        </div>
      </div>

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

                  <td className="p-4 text-right">
                    {isEditing === category.id ? (
                      <button
                        onClick={() => handleUpdate(category.id)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded"
                      >
                        <Check size={18} />
                      </button>
                    ) : (
                      <button
                        onClick={() => startEdit(category)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Edit2 size={18} />
                      </button>
                    )}

                    <button
                      onClick={() => handleDelete(category.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                      title="Aktif/Pasif"
                    >
                      <Trash2 size={18} />
                    </button>

                    {isEditing === category.id && (
                      <button
                        onClick={() => setIsEditing(null)}
                        className="p-2 text-gray-500 hover:bg-gray-100 rounded"
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
    unitLabel: "",
  });

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: "",
      categoryId: categories[0]?.id ? String(categories[0].id) : "",
      price: "",
      stock: "",
      unitLabel: "",
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
      unitLabel: product.unitLabel ?? "",
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
        page: 0,
        size: 200,
        sort: "id,desc",
        categoryId:
          selectedCategoryId === "all" ? undefined : selectedCategoryId,
      });
      setProducts(res.content);
    } catch (err) {
      console.error(err);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;
    loadCategories();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [selectedCategoryId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      name: formData.name,
      description: null,
      imageUrl: null,
      price: Number(formData.price),
      stock: Number(formData.stock),
      categoryId: Number(formData.categoryId),
      unitLabel: formData.unitLabel || null,
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <select
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedCategoryId}
            onChange={(e) =>
              setSelectedCategoryId(
                e.target.value === "all" ? "all" : Number(e.target.value)
              )
            }
          >
            <option value="all">Tüm Kategoriler</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
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
            {products.map((product) => (
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
            ))}
          </tbody>
        </table>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ürün Adı
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kategori
                </label>
                <select
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fiyat (₺)
                  </label>
                  <input
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stok
                  </label>
                  <input
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Birim Yazısı
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Örn: 1 kg, 500 ml, 2.5 L, 3 L, 15'li, Paket"
                    value={formData.unitLabel}
                    onChange={(e) =>
                      setFormData({ ...formData, unitLabel: e.target.value })
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
