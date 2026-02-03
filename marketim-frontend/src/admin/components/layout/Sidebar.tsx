import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getAdminLowStockProducts } from "../../services/productsService";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  LogOut,
  Truck,
  Clock,
  Store,
  FileText,
  X,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  AlertTriangle,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  toggleCollapse: () => void;
}

const Sidebar = ({
  isOpen,
  onClose,
  isCollapsed,
  toggleCollapse,
}: SidebarProps) => {
  const navigate = useNavigate();
  const [lowStockCount, setLowStockCount] = useState(0);

  useEffect(() => {
    getAdminLowStockProducts({ page: 0, size: 1 })
      .then((res) => {
        setLowStockCount(res.totalElements);
      })
      .catch((err) => console.error("Low stock warnings fetch error:", err));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  };

  const navItems = [
    {
      path: "dashboard",
      icon: <LayoutDashboard size={20} />,
      label: "Dashboard",
    },
    { path: "orders", icon: <ShoppingCart size={20} />, label: "Siparişler" },
    { path: "products", icon: <Package size={20} />, label: "Ürün Yönetimi" },
    { path: "customers", icon: <Users size={20} />, label: "Müşteriler" },
  ];

  const settingItems = [
    {
      path: "settings/store-info",
      icon: <Store size={20} />,
      label: "Mağaza Bilgileri",
    },
    {
      path: "settings/delivery-payment",
      icon: <Truck size={20} />,
      label: "Teslimat & Ödeme",
    },
    {
      path: "settings/operations",
      icon: <Clock size={20} />,
      label: "Operasyon & Saatler",
    },
    {
      path: "settings/content",
      icon: <FileText size={20} />,
      label: "İçerik Yönetimi",
    },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed inset-y-0 left-0 z-50 bg-slate-900 text-white flex flex-col 
        transition-all duration-300 ease-in-out transform 
        ${isOpen ? "translate-x-0" : "-translate-x-full"} 
        lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen
        ${isCollapsed ? "lg:w-20" : "lg:w-64"}
        w-64
      `}
      >
        <div
          className={`p-6 border-b border-slate-800 flex items-center ${
            isCollapsed ? "justify-center" : "justify-between"
          }`}
        >
          {!isCollapsed && (
            <h1 className="text-2xl font-bold text-blue-500 whitespace-nowrap">
              Admin Panel
            </h1>
          )}
          {isCollapsed && (
            <h1 className="text-xl font-bold text-blue-500">AP</h1>
          )}

          <button
            onClick={onClose}
            className="lg:hidden text-slate-400 hover:text-white"
          >
            <X size={24} />
          </button>

          <button
            onClick={toggleCollapse}
            className={`hidden lg:block text-slate-400 hover:text-white transition-colors ${
              isCollapsed
                ? "absolute -right-3 top-8 bg-slate-800 rounded-full p-1 border border-slate-700 shadow-md z-50"
                : ""
            }`}
          >
            {isCollapsed ? (
              <ChevronRight size={16} />
            ) : (
              <ChevronLeft size={24} />
            )}
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto overflow-x-hidden custom-scrollbar">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => window.innerWidth < 1024 && onClose()}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors whitespace-nowrap relative ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                } ${isCollapsed ? "justify-center px-2" : ""}`
              }
              title={isCollapsed ? item.label : ""}
            >
              <div className="relative">
                 {item.icon}
                 {/* Collapsed Mode Badge */}
                 {isCollapsed && item.path === "products" && lowStockCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500 border-2 border-slate-900"></span>
                 )}
              </div>
              
              {!isCollapsed && (
                  <div className="flex flex-1 justify-between items-center">
                      <span>{item.label}</span>
                      {/* Expanded Mode Badge */}
                      {item.path === "products" && lowStockCount > 0 && (
                          <div className="ml-2 animate-pulse text-red-500" title={`${lowStockCount} ürün kritik stokta`}>
                              <AlertTriangle size={20} fill="currentColor" color="white" />
                          </div>
                      )}
                  </div>
              )}
            </NavLink>
          ))}

          <div className="pt-4 pb-2">
            {!isCollapsed && (
              <div className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 whitespace-nowrap">
                Ayarlar
              </div>
            )}
            {isCollapsed && <div className="h-px bg-slate-800 my-2 mx-2"></div>}

            {settingItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => window.innerWidth < 1024 && onClose()}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors whitespace-nowrap ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  } ${isCollapsed ? "justify-center px-2" : ""}`
                }
                title={isCollapsed ? item.label : ""}
              >
                {item.icon}
                {!isCollapsed && <span>{item.label}</span>}
              </NavLink>
            ))}
          </div>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <a
            href="/"
            className={`flex items-center gap-3 px-4 py-3 w-full text-blue-400 hover:bg-slate-800 hover:text-blue-300 rounded-lg transition-colors whitespace-nowrap mb-2 ${
              isCollapsed ? "justify-center px-2" : ""
            }`}
            title={isCollapsed ? "Siteye Git" : ""}
          >
            <ExternalLink size={20} />
            {!isCollapsed && <span>Siteye Git</span>}
          </a>

          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 px-4 py-3 w-full text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg transition-colors whitespace-nowrap ${
              isCollapsed ? "justify-center px-2" : ""
            }`}
            title={isCollapsed ? "Çıkış Yap" : ""}
          >
            <LogOut size={20} />
            {!isCollapsed && <span>Çıkış Yap</span>}
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
