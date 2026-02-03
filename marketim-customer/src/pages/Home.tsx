import React, { useEffect, useState } from "react";
import { getCategories } from "../services/categoriesService";
import { getProducts } from "../services/productsService";
import { Category, Product } from "../types";
import { useCart } from "../context/CartContext";
import { Search, Plus } from "lucide-react";

const Home = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(
    undefined
  );
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    getCategories().then(setCategories).catch(console.error);
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, search, page]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await getProducts(selectedCategory, search, page);
      setProducts(data.content);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    fetchProducts();
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 p-4">
      {/* Sidebar / Categories */}
      <div className="w-full md:w-1/4 space-y-2">
        <h2 className="text-xl font-bold mb-4">Categories</h2>
        <button
          onClick={() => {
            setSelectedCategory(undefined);
            setPage(0);
          }}
          className={`block w-full text-left px-4 py-2 rounded ${
            !selectedCategory
              ? "bg-blue-600 text-white"
              : "bg-gray-100 hover:bg-gray-200"
          }`}
        >
          All Products
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              setSelectedCategory(cat.id);
              setPage(0);
            }}
            className={`block w-full text-left px-4 py-2 rounded ${
              selectedCategory === cat.id
                ? "bg-blue-600 text-white"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {/* Search */}
        <div className="mb-6">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
          </form>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-10">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            No products found.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="border rounded-lg p-4 flex flex-col justify-between bg-white shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="mb-4">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-48 object-cover rounded-md mb-4"
                  />
                  <h3 className="font-semibold text-lg">{product.name}</h3>
                  {product.unitLabel && (
                    <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {product.unitLabel}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xl font-bold text-blue-600">
                    ${product.price.toFixed(2)}
                  </span>
                  <button
                    onClick={() => addToCart(product)}
                    className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8 gap-2">
            <button
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
              className="px-4 py-2 border rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-4 py-2">
              Page {page + 1} of {totalPages}
            </span>
            <button
              disabled={page === totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
              className="px-4 py-2 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
