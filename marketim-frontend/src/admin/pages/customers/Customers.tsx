import { useEffect, useMemo, useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  User,
  Search,
  X,
  ShoppingBag,
} from "lucide-react";
import {
  getAdminCustomers,
  getAdminCustomerOrders,
  type AdminCustomerResponse,
  type CustomerOrderAdminListResponse,
} from "../../services/customersService";

const mapOrderStatusLabel = (status: string) => {
  if (status === "DELIVERED") return "Teslim Edildi";
  if (status === "PREPARING") return "Hazırlanıyor";
  if (status === "PENDING") return "Bekliyor";
  if (status === "CANCELLED") return "İptal Edildi";
  return status;
};

const normalize = (s: string) => (s || "").trim().toLocaleLowerCase("tr-TR");

const matchesPrefixSearch = (fullName: string, query: string) => {
  const q = normalize(query);
  if (!q) return true;

  // "Test User" -> ["test", "user"]
  const tokens = normalize(fullName).split(/\s+/).filter(Boolean);
  // sadece kelime başlangıcı
  return tokens.some((t) => t.startsWith(q));
};

const Customers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [customers, setCustomers] = useState<AdminCustomerResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [selectedCustomer, setSelectedCustomer] =
    useState<AdminCustomerResponse | null>(null);

  const [ordersLoading, setOrdersLoading] = useState(false);
  const [customerOrders, setCustomerOrders] = useState<
    CustomerOrderAdminListResponse[]
  >([]);

  const loadCustomers = async () => {
    setIsLoading(true);
    try {
      // ✅ Backend'e q göndermiyoruz (substring arama istemiyoruz)
      // UI bozulmasın diye yüksek size ile tek seferde çekiyoruz
      const res = await getAdminCustomers({
        page: 0,
        size: 200,
      });
      setCustomers(res.content ?? []);
    } catch (err) {
      console.error(err);
      setCustomers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const openCustomerDetail = async (customer: AdminCustomerResponse) => {
    setSelectedCustomer(customer);
    setOrdersLoading(true);
    setCustomerOrders([]);
    try {
      const res = await getAdminCustomerOrders({
        customerId: customer.id,
        page: 0,
        size: 5,
        sort: "createdAt,desc",
      });
      setCustomerOrders(res.content ?? []);
    } catch (err) {
      console.error(err);
      setCustomerOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  const filteredCustomers = useMemo(() => {
    const q = normalize(searchTerm);
    if (!q) return customers;

    return customers.filter((c) => {
      const fullName =
        c.fullName?.trim() || `${c.firstName ?? ""} ${c.lastName ?? ""}`.trim();

      // ✅ İsim/Soyisim prefix (kelime başı) arama
      if (matchesPrefixSearch(fullName, q)) return true;

      // (Opsiyonel ama mantıklı) Email prefix arama
      if (normalize(c.email).startsWith(q)) return true;

      // Telefon prefix arama (istersen kalsın)
      if (c.phone && normalize(c.phone).startsWith(q)) return true;

      return false;
    });
  }, [customers, searchTerm]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Müşteriler</h2>

        <div className="relative w-full sm:w-64">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Müşteri ara..."
            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {isLoading && <div className="text-sm text-gray-500">Yükleniyor...</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomers.length > 0 ? (
          filteredCustomers.map((customer) => (
            <div
              key={customer.id}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                  <User size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">
                    {customer.fullName ||
                      `${customer.firstName} ${customer.lastName}`}
                  </h3>
                  <span className="text-xs text-gray-500">
                    Müşteri ID: #{customer.id}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-gray-600 text-sm">
                  <Mail size={16} className="text-gray-400" />
                  <span>{customer.email}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600 text-sm">
                  <Phone size={16} className="text-gray-400" />
                  <span>{customer.phone || "-"}</span>
                </div>
                <div className="flex items-start gap-3 text-gray-600 text-sm">
                  <MapPin size={16} className="text-gray-400 mt-0.5" />
                  <span>{customer.address || "-"}</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end">
                <button
                  onClick={() => openCustomerDetail(customer)}
                  className="text-sm text-blue-600 font-medium hover:text-blue-700"
                >
                  Detayları Gör
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-gray-500">
            Müşteri bulunamadı.
          </div>
        )}
      </div>

      {/* Customer Detail Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="text-xl font-bold text-gray-800">
                Müşteri Detayı
              </h3>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-8">
              {/* Customer Info */}
              <div className="flex items-start gap-6">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 flex-shrink-0">
                  <User size={40} />
                </div>
                <div className="space-y-2">
                  <h4 className="text-2xl font-bold text-gray-900">
                    {selectedCustomer.fullName ||
                      `${selectedCustomer.firstName} ${selectedCustomer.lastName}`}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Mail size={16} /> {selectedCustomer.email}
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone size={16} /> {selectedCustomer.phone || "-"}
                    </div>
                    <div className="flex items-center gap-2 sm:col-span-2">
                      <MapPin size={16} /> {selectedCustomer.address || "-"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Order History */}
              <div>
                <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <ShoppingBag className="text-blue-600" size={20} />
                  Sipariş Geçmişi
                </h4>

                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-600 text-sm">
                      <tr>
                        <th className="p-4 font-medium">Sipariş No</th>
                        <th className="p-4 font-medium">Tarih</th>
                        <th className="p-4 font-medium">Tutar</th>
                        <th className="p-4 font-medium">Durum</th>
                        <th className="p-4 font-medium">Ürün Sayısı</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {ordersLoading ? (
                        <tr>
                          <td
                            colSpan={5}
                            className="p-8 text-center text-gray-500"
                          >
                            Yükleniyor...
                          </td>
                        </tr>
                      ) : customerOrders.length > 0 ? (
                        customerOrders.map((order) => {
                          const label = mapOrderStatusLabel(order.status);
                          const itemsCount = order.itemsCount ?? 0;

                          return (
                            <tr key={order.id} className="hover:bg-gray-50">
                              <td className="p-4 text-sm font-medium text-gray-900">
                                {order.id}
                              </td>
                              <td className="p-4 text-sm text-gray-500">
                                {order.createdAt
                                  ? new Date(order.createdAt).toLocaleString(
                                      "tr-TR"
                                    )
                                  : "-"}
                              </td>
                              <td className="p-4 text-sm font-medium text-gray-900">
                                ₺
                                {Number(order.totalAmount).toLocaleString(
                                  "tr-TR"
                                )}
                              </td>
                              <td className="p-4">
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-medium inline-block
                                  ${
                                    label === "Teslim Edildi"
                                      ? "bg-green-100 text-green-700"
                                      : label === "Hazırlanıyor"
                                      ? "bg-orange-100 text-orange-700"
                                      : label === "İptal Edildi"
                                      ? "bg-red-100 text-red-700"
                                      : "bg-yellow-100 text-yellow-700"
                                  }`}
                                >
                                  {label}
                                </span>
                              </td>
                              <td className="p-4 text-sm text-gray-500">
                                {itemsCount} Ürün
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td
                            colSpan={5}
                            className="p-8 text-center text-gray-500"
                          >
                            Bu müşteriye ait sipariş bulunmamaktadır.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-xl flex justify-end">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
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

export default Customers;
