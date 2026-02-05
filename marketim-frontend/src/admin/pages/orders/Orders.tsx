import { useEffect, useState, useCallback } from "react";
import { adminOrdersService } from "../../services/ordersService";
import type {
  OrderAdminListItem,
  OrderAdminDetailResponse,
  OrderStatus,
} from "../../services/ordersService";
import { reportService } from "../../services/reportService";
import type { ReportType } from "../../services/reportService";

import {
  Search,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  User,
  MapPin,
  Calendar,
  Package,
  CreditCard,
  Phone,
  Wallet,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import toast from "react-hot-toast";

// Helper for labels/colors
const statusLabel = (s: OrderStatus) => {
  switch (s) {
    case "PREPARING":
      return "Hazırlanıyor";
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
    case "PREPARING":
      return "bg-orange-100 text-orange-700";
    case "DELIVERED":
      return "bg-green-100 text-green-700";
    case "CANCELLED":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

// UI filter -> Backend Enum
const filterUiToBackendStatus = (ui: string): OrderStatus | undefined => {
  if (ui === "Hazırlanıyor") return "PREPARING";
  if (ui === "Teslim Edildi") return "DELIVERED";
  if (ui === "İptal Edildi") return "CANCELLED";
  return undefined; // "Tümü"
};

const Orders = () => {
  // Query State
  const [filterStatus, setFilterStatus] = useState("Tümü");
  const [searchTerm, setSearchTerm] = useState("");
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15; // User requested 15
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Sorting State
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  }>({ key: "createdAt", direction: "desc" }); // Default: Newest first

  // Data State
  const [orders, setOrders] = useState<OrderAdminListItem[]>([]);
  const [listLoading, setListLoading] = useState(false);

  // Detail Modal State
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [orderDetail, setOrderDetail] = useState<OrderAdminDetailResponse | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Report Menu
  const [showReportMenu, setShowReportMenu] = useState(false);

  // FETCH ORDERS (Server-Side Pagination)
  const fetchOrders = useCallback(async () => {
    setListLoading(true);
    try {
      const backendStatus = filterUiToBackendStatus(filterStatus);
      
      const res = await adminOrdersService.list({
        page: currentPage - 1, // backend 0-based
        size: itemsPerPage,
        status: backendStatus,
        q: searchTerm,
        sort: `${sortConfig.key},${sortConfig.direction}`
      });
      
      setOrders(res.content ?? []);
      setTotalPages(res.totalPages);
      setTotalElements(res.totalElements);
    } catch (e) {
      console.error("ADMIN ORDERS FETCH ERROR:", e);
      setOrders([]);
    } finally {
      setListLoading(false);
    }
  }, [currentPage, filterStatus, searchTerm, sortConfig]);

  // Refetch when params change
  useEffect(() => {
    // Debounce search a bit if needed, but for now direct call is fine or handled by useEffect deps
    const timer = setTimeout(() => {
      fetchOrders();
    }, 300); // 300ms debounce for typing
    return () => clearTimeout(timer);
  }, [fetchOrders]);


  // Handler: Report
  const handleReport = async (type: ReportType, range: 'today' | 'week' | 'month') => {
    try {

      // Re-fix logic slightly for cleaner dates:
      let start = new Date();
      if (range === 'today') start = new Date();
      if (range === 'week') start = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      if (range === 'month') start = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      const s = start.toISOString().split('T')[0];
      const e = new Date().toISOString().split('T')[0];

      await reportService.downloadReport(type, s, e);
      setShowReportMenu(false);
      toast.success("Rapor başarıyla indirildi.");
    } catch (err) {
      console.error("Report error", err);
      toast.error("Rapor oluşturulurken hata oluştu.");
    }
  };

  // Handler: Sort
  const handleSort = (key: string) => {
    setSortConfig((prev) => {
      // Toggle if same key, else default desc (or asc?)
      if (prev.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "desc" }; // default to desc for new columns often better for numbers/dates
    });
    setCurrentPage(1); // Reset to page 1
  };

  // Handler: Open/Close Detail
  const openDetail = async (id: number) => {
    setSelectedOrderId(id);
    setOrderDetail(null);
    setDetailLoading(true);
    try {
      const detail = await adminOrdersService.getById(id);
      setOrderDetail(detail);
    } catch (e) {
      console.error("ADMIN ORDER DETAIL FETCH ERROR:", e);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => {
    setSelectedOrderId(null);
    setOrderDetail(null);
  };

  // Handler: Status Update
  const updateStatus = async (newStatus: OrderStatus) => {
    if (selectedOrderId == null) return;
    
    // Optimistic UI update or wait? Let's use toast.promise for better UX
    const promise = adminOrdersService.updateStatus(selectedOrderId, newStatus);

    try {
      setDetailLoading(true);
      
      await toast.promise(promise, {
         loading: 'Durum güncelleniyor...',
         success: 'Sipariş durumu güncellendi!',
         error: 'Durum güncellenemedi.'
      });

      await promise; // Ensure it finished for state updates

      // 1) Update Modal
      setOrderDetail((prev) => prev ? { ...prev, status: newStatus } : prev);
      // 2) Update List
      setOrders((prev) => prev.map((o) => o.id === selectedOrderId ? { ...o, status: newStatus } : o));
    } catch (e) {
      console.error("STATUS UPDATE ERROR:", e);
      // Toast handled by promise
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Siparişler</h2>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {/* SEARCH */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Ara (Müşteri, Adres, ID)..."
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          {/* REPORT MENU */}
          <div className="relative">
             <button 
                onClick={() => setShowReportMenu(!showReportMenu)}
                className="flex items-center gap-2 h-10 px-4 bg-white border border-red-200 rounded-lg hover:bg-red-50 text-red-600 font-medium transition-colors shadow-sm"
             >
                <FileText size={18} />
                <span className="hidden sm:inline">Rapor</span>
             </button>
             {showReportMenu && (
                 <div className="absolute top-12 right-0 w-56 bg-white rounded-xl shadow-xl border border-gray-100 p-2 z-20 flex flex-col gap-1">
                    <div className="text-xs font-bold text-gray-400 px-3 py-2 uppercase">Sipariş Listeleri</div>
                    <button onClick={() => handleReport('ORDER', 'today')} className="text-left px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 rounded-lg">Bugünün Siparişleri</button>
                    <button onClick={() => handleReport('ORDER', 'week')} className="text-left px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 rounded-lg">Son 7 Gün</button>
                    <button onClick={() => handleReport('ORDER', 'month')} className="text-left px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 rounded-lg">Bu Ayın Siparişleri</button>
                    <div className="h-px bg-gray-100 my-1"></div>
                    <div className="text-xs font-bold text-gray-400 px-3 py-2 uppercase">Finansal</div>
                    <button onClick={() => handleReport('DAILY', 'today')} className="text-left px-3 py-2 text-sm text-gray-700 hover:bg-green-50 rounded-lg">Günlük Ciro Raporu</button>
                 </div>
             )}
          </div>

          {/* FILTER STATUS */}
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg p-1">
            {["Tümü", "Hazırlanıyor", "Teslim Edildi", "İptal Edildi"].map((status) => (
              <button
                key={status}
                onClick={() => {
                  setFilterStatus(status);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  filterStatus === status ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-600 text-sm">
              <tr>
                <th className="p-4 font-medium cursor-pointer" onClick={() => handleSort("id")}>
                  <div className="flex items-center gap-2">Sipariş No <ArrowUpDown size={14} /></div>
                </th>
                <th className="p-4 font-medium" >Müşteri</th>
                <th className="p-4 font-medium cursor-pointer" onClick={() => handleSort("totalAmount")}>
                  <div className="flex items-center gap-2">Tutar <ArrowUpDown size={14} /></div>
                </th>
                <th className="p-4 font-medium">Adres</th>
                <th className="p-4 font-medium">Durum</th>
                <th className="p-4 font-medium cursor-pointer" onClick={() => handleSort("createdAt")}>
                   <div className="flex items-center gap-2">Tarih <ArrowUpDown size={14} /></div>
                </th>
                <th className="p-4 font-medium text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {listLoading ? (
                <tr><td colSpan={7} className="p-8 text-center text-gray-500">Yükleniyor...</td></tr>
              ) : orders.length > 0 ? (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-sm font-medium text-gray-900">#{order.id}</td>
                    <td className="p-4 text-sm text-gray-600">{order.customerName ?? "-"}</td>
                    <td className="p-4 text-sm font-medium text-gray-900">₺{Number(order.totalAmount).toLocaleString("tr-TR")}</td>
                    <td className="p-4 text-sm text-gray-500 max-w-xs truncate" title={order.address}>{order.address ?? "-"}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium inline-block ${statusClass(order.status)}`}>
                        {statusLabel(order.status)}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-500">
                      {order.createdAt ? new Date(order.createdAt).toLocaleString("tr-TR") : "-"}
                    </td>
                    <td className="p-4 text-right">
                      <button onClick={() => openDetail(order.id)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={7} className="p-8 text-center text-gray-500">Sipariş bulunamadı.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-sm text-gray-500">
               Toplam {totalElements} sipariş, Sayfa {currentPage} / {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>

       {/* ORDER DETAIL MODAL */}
       {selectedOrderId !== null && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-100 flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10 transition-all">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center shadow-sm">
                  <Package className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Sipariş Detayı #{selectedOrderId}
                  </h3>
                  <p className="text-xs text-gray-500 font-medium">
                    Sipariş Bilgileri ve Yönetimi
                  </p>
                </div>
              </div>
              <button
                onClick={closeDetail}
                className="h-8 w-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-8 flex-1 overflow-y-auto">
              {detailLoading ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400 gap-3">
                  <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                  <span className="text-sm font-medium">Yükleniyor...</span>
                </div>
              ) : !orderDetail ? (
                <div className="text-center bg-red-50 rounded-xl p-6 border border-red-100 text-red-600">
                  <div className="font-bold mb-1">Detay alınamadı</div>
                  <div className="text-sm">Lütfen konsolu kontrol edin veya tekrar deneyin.</div>
                </div>
              ) : (
                <>
                  {/* Status & Date Card */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex flex-col gap-1 hover:border-gray-200 transition-colors">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                           <Calendar className="w-3.5 h-3.5" />
                           Sipariş Tarihi
                        </span>
                        <span className="text-gray-900 font-semibold text-lg">
                           {orderDetail.createdAt
                              ? new Date(orderDetail.createdAt).toLocaleDateString("tr-TR")
                              : "-"}
                           <span className="text-gray-400 text-sm font-medium ml-2">
                              {orderDetail.createdAt ? new Date(orderDetail.createdAt).toLocaleTimeString("tr-TR", {hour: '2-digit', minute:'2-digit'}) : ""}
                           </span>
                        </span>
                     </div>

                     <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex flex-col gap-1 hover:border-gray-200 transition-colors">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                           <CreditCard className="w-3.5 h-3.5" />
                           Durum
                        </span>
                        <div>
                           <span className={`px-3 py-1 rounded-full text-sm font-bold inline-flex items-center gap-1.5 ${statusClass(orderDetail.status)}`}>
                             <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                             {statusLabel(orderDetail.status)}
                           </span>
                        </div>
                     </div>
                  </div>

                  {/* Status Update Actions */}
                  <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                    <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="w-1 h-4 bg-orange-500 rounded-full"></span>
                        Durum Güncelle
                    </h4>
                    
                    {/* Warning for final statuses */}
                    {(orderDetail?.status === "DELIVERED" || orderDetail?.status === "CANCELLED") && (
                      <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <p className="text-sm text-amber-800 font-medium">
                          ⚠️ {orderDetail.status === "DELIVERED" 
                            ? "Teslim edilen siparişlerin durumu değiştirilemez." 
                            : "İptal edilen siparişlerin durumu değiştirilemez."}
                        </p>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <button
                        disabled={detailLoading || !orderDetail || orderDetail.status === "DELIVERED" || orderDetail.status === "CANCELLED"}
                        onClick={() => updateStatus("PREPARING")}
                        className={`relative overflow-hidden group flex flex-col items-center justify-center gap-2 h-24 rounded-xl border-2 transition-all duration-200 ${
                          orderDetail?.status === "PREPARING"
                            ? "bg-orange-50 border-orange-400 text-orange-700 shadow-sm ring-1 ring-orange-400"
                            : "bg-white border-gray-100 text-gray-500 hover:border-orange-200 hover:bg-orange-50/50 hover:text-orange-600"
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                         <div className={`p-2 rounded-full transition-colors ${orderDetail?.status === "PREPARING" ? "bg-orange-100" : "bg-gray-100 group-hover:bg-orange-100"}`}>
                            <Clock className={`w-5 h-5 ${orderDetail?.status === "PREPARING" ? "text-orange-600" : "text-gray-400 group-hover:text-orange-600"}`} />
                         </div>
                         <span className="font-semibold text-sm">Hazırlanıyor</span>
                         {orderDetail?.status === "PREPARING" && (
                            <div className="absolute top-2 right-2">
                                <span className="flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                                </span>
                            </div>
                         )}
                      </button>

                      <button
                        disabled={detailLoading || !orderDetail || orderDetail.status === "DELIVERED" || orderDetail.status === "CANCELLED"}
                        onClick={() => updateStatus("DELIVERED")}
                        className={`relative overflow-hidden group flex flex-col items-center justify-center gap-2 h-24 rounded-xl border-2 transition-all duration-200 ${
                          orderDetail?.status === "DELIVERED"
                            ? "bg-green-50 border-green-500 text-green-700 shadow-sm ring-1 ring-green-500"
                            : "bg-white border-gray-100 text-gray-500 hover:border-green-200 hover:bg-green-50/50 hover:text-green-600"
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                         <div className={`p-2 rounded-full transition-colors ${orderDetail?.status === "DELIVERED" ? "bg-green-100" : "bg-gray-100 group-hover:bg-green-100"}`}>
                            <CheckCircle2 className={`w-5 h-5 ${orderDetail?.status === "DELIVERED" ? "text-green-600" : "text-gray-400 group-hover:text-green-600"}`} />
                         </div>
                         <span className="font-semibold text-sm">Teslim Edildi</span>
                         {orderDetail?.status === "DELIVERED" && (
                            <div className="absolute top-2 right-2">
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                            </div>
                         )}
                      </button>

                      <button
                        disabled={detailLoading || !orderDetail || orderDetail.status === "DELIVERED" || orderDetail.status === "CANCELLED"}
                        onClick={() => updateStatus("CANCELLED")}
                        className={`relative overflow-hidden group flex flex-col items-center justify-center gap-2 h-24 rounded-xl border-2 transition-all duration-200 ${
                          orderDetail?.status === "CANCELLED"
                            ? "bg-red-50 border-red-400 text-red-700 shadow-sm ring-1 ring-red-400"
                            : "bg-white border-gray-100 text-gray-500 hover:border-red-200 hover:bg-red-50/50 hover:text-red-600"
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                         <div className={`p-2 rounded-full transition-colors ${orderDetail?.status === "CANCELLED" ? "bg-red-100" : "bg-gray-100 group-hover:bg-red-100"}`}>
                            <XCircle className={`w-5 h-5 ${orderDetail?.status === "CANCELLED" ? "text-red-600" : "text-gray-400 group-hover:text-red-600"}`} />
                         </div>
                         <span className="font-semibold text-sm">İptal Edildi</span>
                      </button>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div>
                    <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <User className="w-5 h-5 text-gray-400" />
                        Müşteri Bilgileri
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-blue-100 hover:shadow-sm transition-all">
                        <p className="text-xs text-gray-500 font-medium mb-1">Müşteri Adı</p>
                        <p className="font-semibold text-gray-900 text-lg">
                          {orderDetail.customerName ?? "Misafir"}
                        </p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-blue-100 hover:shadow-sm transition-all">
                        <p className="text-xs text-gray-500 font-medium mb-1 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            Teslimat Adresi
                        </p>
                        <p className="font-medium text-gray-900 leading-relaxed text-sm">
                          {orderDetail.deliveryAddress ?? orderDetail.address ?? "Adres girilmemiş"}
                        </p>
                      </div>

                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-blue-100 hover:shadow-sm transition-all">
                        <p className="text-xs text-gray-500 font-medium mb-1 flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            Telefon
                        </p>
                        <p className="font-medium text-gray-900 text-lg">
                          {orderDetail.contactPhone ?? "-"}
                        </p>
                      </div>

                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-blue-100 hover:shadow-sm transition-all">
                        <p className="text-xs text-gray-500 font-medium mb-1 flex items-center gap-1">
                            <Wallet className="w-3 h-3" />
                            Ödeme Yöntemi
                        </p>
                        <p className="font-medium text-gray-900 text-lg">
                          {orderDetail.paymentMethod === "CASH" ? "Kapıda Nakit" :
                           orderDetail.paymentMethod === "CARD" ? "Kapıda Kredi Kartı" :
                           orderDetail.paymentMethod === "IBAN" ? "IBAN / Havale" :
                           orderDetail.paymentMethod ?? "-"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div>
                    <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Package className="w-5 h-5 text-gray-400" />
                        Sipariş İçeriği
                    </h4>
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                        <div className="max-h-[300px] overflow-y-auto">
                            {orderDetail.items?.map((item, index) => (
                                <div
                                key={index}
                                className="flex justify-between items-center p-4 border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors"
                                >
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center text-sm font-bold text-gray-600 shadow-sm border border-gray-200">
                                    {item.quantity}x
                                    </div>
                                    <div className="flex flex-col">
                                    <span className="text-gray-900 font-semibold text-sm">
                                        {item.productName}
                                    </span>
                                    {item.unitLabel && (
                                        <span className="text-xs text-gray-500 font-medium bg-gray-100 px-1.5 py-0.5 rounded w-fit mt-0.5">
                                        {item.unitLabel}
                                        </span>
                                    )}
                                    </div>
                                </div>
                                <span className="font-bold text-gray-900 tabular-nums">
                                    ₺{Number(item.lineTotal).toLocaleString("tr-TR")}
                                </span>
                                </div>
                            ))}
                        </div>
                        <div className="bg-gray-50 p-4 border-t border-gray-200 flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-500">Ara Toplam</span>
                                <span className="text-sm font-medium text-gray-900">
                                    ₺{Number(orderDetail.totalAmount).toLocaleString("tr-TR")}
                                </span>
                            </div>
                            <div className="flex items-center justify-between pt-2 border-t border-gray-200/50">
                                <span className="text-base font-bold text-gray-900">Genel Toplam</span>
                                <span className="text-2xl font-extrabold text-blue-600 tracking-tight">
                                    ₺{Number(orderDetail.totalAmount ?? 0).toLocaleString("tr-TR")}
                                </span>
                            </div>
                        </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-end">
              <button
                onClick={closeDetail}
                className="h-11 px-8 bg-gray-900 text-white rounded-xl hover:bg-gray-800 font-medium transition-colors shadow-sm active:scale-95"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
