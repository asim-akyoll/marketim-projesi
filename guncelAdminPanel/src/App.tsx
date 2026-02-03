import { BrowserRouter, Routes, Route } from "react-router-dom";
import DashboardLayout from "./components/layout/DashboardLayout";
import Dashboard from "./pages/dashboard/Dashboard";
import Orders from "./pages/orders/Orders";
import Products from "./pages/products/Products";
import Customers from "./pages/customers/Customers";
import DeliveryPayment from "./pages/settings/DeliveryPayment";
import Operations from "./pages/settings/Operations";
import StoreInfo from "./pages/settings/StoreInfo";
import Content from "./pages/settings/Content";
import { SettingsProvider } from "./context/SettingsContext";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="orders" element={<Orders />} />
          <Route path="products" element={<Products />} />
          <Route path="customers" element={<Customers />} />

          <Route
            path="settings/*"
            element={
              <SettingsProvider>
                <Routes>
                  <Route path="store-info" element={<StoreInfo />} />
                  <Route
                    path="delivery-payment"
                    element={<DeliveryPayment />}
                  />
                  <Route path="operations" element={<Operations />} />
                  <Route path="content" element={<Content />} />
                </Routes>
              </SettingsProvider>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
