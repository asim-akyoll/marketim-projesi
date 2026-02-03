import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Cart from "./pages/Cart";
import OrderSuccess from "./pages/OrderSuccess";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Account from "./pages/Account";
import Maintenance from "./pages/Maintenance";
import { useEffect, useState } from "react";
import { publicSettingsService } from "./services/publicSettingsService";
import { GlobalBanner } from "./components/GlobalBanner";

// ADMIN
import DashboardLayout from "./admin/components/layout/DashboardLayout";
import { SettingsProvider } from "./admin/context/SettingsContext";
import Dashboard from "./admin/pages/dashboard/Dashboard";
import Orders from "./admin/pages/orders/Orders";
import Products from "./admin/pages/products/Products";
import Customers from "./admin/pages/customers/Customers";
import Content from "./admin/pages/settings/Content";
import DeliveryPayment from "./admin/pages/settings/DeliveryPayment";
import Operations from "./admin/pages/settings/Operations";
import StoreInfo from "./admin/pages/settings/StoreInfo";
import RequireAdmin from "./admin/guards/RequireAdmin";

function App() {
  const [maintenance, setMaintenance] = useState<{
    enabled: boolean;
    message: string;
  }>({ enabled: false, message: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    publicSettingsService
      .get()
      .then((settings) => {
        if (settings.maintenanceModeEnabled) {
          setMaintenance({
            enabled: true,
            message: settings.maintenanceMessage,
          });
        }
      })
      .catch(() => {
        // ignore errors
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) return null; // or a spinner

  if (maintenance.enabled) {
    // Admin login bypass (optional, not implemented here for simplicity)
    // If you want admin to access, check if URL starts with /admin or logic
    const isAdmin = window.location.pathname.startsWith("/admin");
    if (!isAdmin) {
      return <Maintenance message={maintenance.message} />;
    }
  }

  return (
    <Routes>
      {/* CUSTOMER */}
      <Route
        path="*"
        element={
          <>
            <GlobalBanner />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/order-success" element={<OrderSuccess />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/account" element={<Account />} />
            </Routes>
          </>
        }
      />

      {/* ADMIN */}
      <Route path="/admin" element={<RequireAdmin />}>
        <Route
          element={
            <SettingsProvider>
              <DashboardLayout />
            </SettingsProvider>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="orders" element={<Orders />} />
          <Route path="products" element={<Products />} />
          <Route path="customers" element={<Customers />} />

          <Route path="settings">
            <Route index element={<Navigate to="content" replace />} />
            <Route path="content" element={<Content />} />
            <Route path="delivery-payment" element={<DeliveryPayment />} />
            <Route path="operations" element={<Operations />} />
            <Route path="store-info" element={<StoreInfo />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
