import { useEffect, useMemo, useState } from "react";
import {
  getAdminOrders,
  getAdminOrderDetail,
} from "../../services/ordersService";
import type {
  OrderAdminListItem,
  OrderAdminDetailResponse,
  OrderStatus,
} from "../../services/ordersService";
import { updateAdminOrderStatus } from "../../services/ordersService";

import {
  Search,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
} from "lucide-react";

const statusLabel = (s: OrderStatus) => {
  switch (s) {
    case "PENDING":
      return "Bekliyor";
    case "DELIVERED":
      return "Teslim Edildi";
    case "CANCELLED":
      return "İptal Edildi";
    default:
      return s;
  }
};

const statusClass = (s: OrderStatus) => {
  switch (s) {
    case "DELIVERED":
      return "bg-green-100 text-green-700";
    case "PENDING":
      return "bg-yellow-100 text-yellow-700";
    case "CANCELLED":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

const filterUiToBackendStatus = (ui: string): OrderStatus | undefined => {
  if (ui === "Bekliyor") return "PENDING";
  if (ui === "Teslim Edildi") return "DELIVERED";
  if (ui === "İptal Edildi") return "CANCELLED";
  return undefined; // "Tümü"
};

const Orders = () => {
  const [filterStatus, setFilterStatus] = useState("Tümü");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof OrderAdminListItem | "customerName" | "address";
    direction: "asc" | "desc";
  } | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // LIST
  const [orders, setOrders] = useState<OrderAdminListItem[]>([]);
  const [listLoading, setListLoading] = useState(false);

  // DETAIL
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [orderDetail, setOrderDetail] =
    useState<OrderAdminDetailResponse | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setListLoading(true);
      try {
        // Şimdilik ilk sayfayı çekiyoruz (backend pagination ayrı bir adımda)
        const page = await getAdminOrders({ page: 0, size: 50 });
        setOrders(page.content ?? []);
      } catch (e) {
        console.error("ADMIN ORDERS FETCH ERROR:", e);
        setOrders([]);
      } finally {
        setListLoading(false);
      }
    })();
  }, []);

  const filteredOrders = useMemo(() => {
    let result = [...orders];

    // Status filter (UI => backend enum)
    if (filterStatus !== "Tümü") {
      const backendStatus = filterUiToBackendStatus(filterStatus);
      if (backendStatus) {
        result = result.filter((o) => o.status === backendStatus);
      }
    }

    // Search
    if (searchTerm.trim()) {
      const term = searchTerm.trim().toLowerCase();
      result = result.filter((o) => {
        const idMatch = String(o.id).includes(term);
        const nameMatch = (o.customerName ?? "").toLowerCase().includes(term);
        return idMatch || nameMatch;
      });
    }

    // Sorting
    if (sortConfig) {
      const { key, direction } = sortConfig;
      result.sort((a: any, b: any) => {
        const av = a[key] ?? "";
        const bv = b[key] ?? "";
        if (av < bv) return direction === "asc" ? -1 : 1;
        if (av > bv) return direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [orders, filterStatus, searchTerm, sortConfig]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredOrders.length / itemsPerPage)
  );
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (key: any) => {
    let direction: "asc" | "desc" = "asc";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "asc"
    ) {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const openDetail = async (id: number) => {
    setSelectedOrderId(id);
    setOrderDetail(null);
    setDetailLoading(true);

    try {
      const detail = await getAdminOrderDetail(id);
      setOrderDetail(detail);
    } catch (e) {
      console.error("ADMIN ORDER DETAIL FETCH ERROR:", e);
      setOrderDetail(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const updateStatus = async (newStatus: OrderStatus) => {
    if (selectedOrderId == null) return;

    try {
      setDetailLoading(true);

      await updateAdminOrderStatus(selectedOrderId, newStatus);

      // 1) Modal içini güncelle
      setOrderDetail((prev) => (prev ? { ...prev, status: newStatus } : prev));

      // 2) Listeyi güncelle
      setOrders((prev) =>
        prev.map((o) =>
          o.id === selectedOrderId ? { ...o, status: newStatus } : o
        )
      );
    } catch (e) {
      console.error("STATUS UPDATE ERROR:", e);
      alert("Durum güncellenemedi. Console’u kontrol et.");
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => {
    setSelectedOrderId(null);
    setOrderDetail(null);
    setDetailLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Siparişler</h2>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Müşteri veya Sipariş No ara..."
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg p-1">
            {["Tümü", "Bekliyor", "Teslim Edildi", "İptal Edildi"].map(
              (status) => (
                <button
                  key={status}
                  onClick={() => {
                    setFilterStatus(status);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    filterStatus === status
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {status}
                </button>
              )
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-600 text-sm">
              <tr>
                <th
                  className="p-4 font-medium cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("id")}
                >
                  <div className="flex items-center gap-2">
                    Sipariş No <ArrowUpDown size={14} />
                  </div>
                </th>

                <th
                  className="p-4 font-medium cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("customerName")}
                >
                  <div className="flex items-center gap-2">
                    Müşteri <ArrowUpDown size={14} />
                  </div>
                </th>

                <th
                  className="p-4 font-medium cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("totalAmount")}
                >
                  <div className="flex items-center gap-2">
                    Tutar <ArrowUpDown size={14} />
                  </div>
                </th>

                <th
                  className="p-4 font-medium cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("address")}
                >
                  <div className="flex items-center gap-2">
                    Adres <ArrowUpDown size={14} />
                  </div>
                </th>

                <th className="p-4 font-medium">Durum</th>

                <th
                  className="p-4 font-medium cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("createdAt")}
                >
                  <div className="flex items-center gap-2">
                    Tarih <ArrowUpDown size={14} />
                  </div>
                </th>

                <th className="p-4 font-medium text-right">İşlemler</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {listLoading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">
                    Yükleniyor...
                  </td>
                </tr>
              ) : paginatedOrders.length > 0 ? (
                paginatedOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="p-4 text-sm font-medium text-gray-900">
                      {order.id}
                    </td>

                    <td className="p-4 text-sm text-gray-600">
                      {order.customerName ?? "-"}
                    </td>

                    <td className="p-4 text-sm font-medium text-gray-900">
                      ₺{Number(order.totalAmount ?? 0).toLocaleString("tr-TR")}
                    </td>

                    <td
                      className="p-4 text-sm text-gray-500 max-w-xs truncate"
                      title={order.address ?? "-"}
                    >
                      {order.address ?? "-"}
                    </td>

                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium inline-block ${statusClass(
                          order.status
                        )}`}
                      >
                        {statusLabel(order.status)}
                      </span>
                    </td>

                    <td className="p-4 text-sm text-gray-500">
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleString("tr-TR")
                        : "-"}
                    </td>

                    <td className="p-4 text-right">
                      <button
                        onClick={() => openDetail(order.id)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Detayları Gör"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">
                    Sipariş bulunamadı.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-sm text-gray-500">
              Toplam {filteredOrders.length} siparişten{" "}
              {(currentPage - 1) * itemsPerPage + 1}-
              {Math.min(currentPage * itemsPerPage, filteredOrders.length)}{" "}
              arası gösteriliyor
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={20} />
              </button>

              <span className="text-sm font-medium text-gray-700">
                Sayfa {currentPage} / {totalPages}
              </span>

              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ORDER DETAIL MODAL (backend’den) */}
      {selectedOrderId !== null && (
        <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="text-xl font-bold text-gray-800">
                Sipariş Detayı #{selectedOrderId}
              </h3>
              <button
                onClick={closeDetail}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {detailLoading ? (
                <div className="text-center text-gray-500 py-10">
                  Yükleniyor...
                </div>
              ) : !orderDetail ? (
                <div className="text-center text-red-600 py-10">
                  Detay alınamadı. Console’u kontrol et.
                </div>
              ) : (
                <>
                  {/* Status & Date */}
                  <div className="flex flex-wrap gap-4 justify-between items-center bg-gray-50 p-4 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">
                        Sipariş Tarihi
                      </p>
                      <p className="font-medium text-gray-900">
                        {orderDetail.createdAt
                          ? new Date(orderDetail.createdAt).toLocaleString(
                              "tr-TR"
                            )
                          : "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Durum</p>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium inline-block ${statusClass(
                          orderDetail.status
                        )}`}
                      >
                        {statusLabel(orderDetail.status)}
                      </span>
                    </div>
                  </div>

                  {/* Status Update */}
                  <div className="bg-white border border-gray-100 rounded-lg p-4">
                    <p className="text-sm text-gray-500 mb-3">Durum Güncelle</p>

                    <div className="flex flex-wrap gap-2">
                      <button
                        disabled={detailLoading || !orderDetail}
                        onClick={() => updateStatus("PENDING")}
                        className={`px-3 py-2 rounded-lg text-sm font-medium border ${
                          orderDetail?.status === "PENDING"
                            ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                            : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                        } disabled:opacity-50`}
                      >
                        Bekliyor
                      </button>

                      <button
                        disabled={detailLoading || !orderDetail}
                        onClick={() => updateStatus("DELIVERED")}
                        className={`px-3 py-2 rounded-lg text-sm font-medium border ${
                          orderDetail?.status === "DELIVERED"
                            ? "bg-green-100 text-green-700 border-green-200"
                            : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                        } disabled:opacity-50`}
                      >
                        Teslim Edildi
                      </button>

                      <button
                        disabled={detailLoading || !orderDetail}
                        onClick={() => updateStatus("CANCELLED")}
                        className={`px-3 py-2 rounded-lg text-sm font-medium border ${
                          orderDetail?.status === "CANCELLED"
                            ? "bg-red-100 text-red-700 border-red-200"
                            : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                        } disabled:opacity-50`}
                      >
                        İptal Edildi
                      </button>
                    </div>

                    <p className="text-xs text-gray-400 mt-3">
                      Not: Backend kuralı gereği bazı geçişler engellenebilir
                      (örn CANCELLED → DELIVERED).
                    </p>
                  </div>

                  {/* Customer Info */}
                  <div>
                    <h4 className="font-bold text-gray-800 mb-3 border-b pb-2">
                      Müşteri Bilgileri
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Müşteri Adı</p>
                        <p className="font-medium text-gray-900">
                          {orderDetail.customerName}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Teslimat Adresi</p>
                        <p className="font-medium text-gray-900">
                          {orderDetail.address}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div>
                    <h4 className="font-bold text-gray-800 mb-3 border-b pb-2">
                      Sipariş İçeriği
                    </h4>
                    <div className="space-y-3 max-h-[260px] overflow-auto pr-2">
                      {orderDetail.items?.map((item, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center text-xs font-bold text-gray-500">
                              {item.quantity}x
                            </div>
                            <div className="flex flex-col">
                              <span className="text-gray-800">
                                {item.productName}
                              </span>

                              {item.unitLabel && (
                                <span className="text-xs text-gray-500">
                                  {item.unitLabel}
                                </span>
                              )}
                            </div>
                          </div>
                          <span className="font-medium text-gray-900">
                            ₺{Number(item.lineTotal).toLocaleString("tr-TR")}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Total */}
                  <div className="flex justify-end pt-4 border-t border-gray-100">
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Toplam Tutar</p>
                      <p className="text-2xl font-bold text-blue-600">
                        ₺
                        {Number(orderDetail.totalAmount).toLocaleString(
                          "tr-TR"
                        )}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-xl flex justify-end gap-3">
              <button
                onClick={closeDetail}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              >
                Kapat
              </button>

              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                onClick={() => alert("Yazdırma işlemi başlatılıyor...")}
                disabled={detailLoading || !orderDetail}
              >
                Yazdır
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
