import React, { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";
import { Trash2, Plus, Minus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { createOrder } from "../services/ordersService";

const Cart = () => {
  const formatPrice = (price: number) => `${price.toFixed(2)} ₺`;

  const {
    cart,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    totalAmount,
    clearCart,
  } = useCart();

  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [deliveryAddress, setDeliveryAddress] = useState(() => {
    return localStorage.getItem("deliveryAddress") ?? "";
  });

  const [paymentMethod, setPaymentMethod] = useState(() => {
    return localStorage.getItem("paymentMethod") ?? "";
  });

  const [formError, setFormError] = useState<{
    deliveryAddress?: string;
    paymentMethod?: string;
    general?: string;
  }>({});

  // Persist: kullanıcı yazdıkça kaydet
  useEffect(() => {
    localStorage.setItem("deliveryAddress", deliveryAddress);
  }, [deliveryAddress]);

  useEffect(() => {
    localStorage.setItem("paymentMethod", paymentMethod);
  }, [paymentMethod]);

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    setFormError({});

    const nextErrors: any = {};

    if (!deliveryAddress.trim()) {
      nextErrors.deliveryAddress = "Teslimat adresi zorunludur.";
    }

    if (!paymentMethod) {
      nextErrors.paymentMethod = "Ödeme yöntemi seçilmelidir.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setFormError(nextErrors);
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        deliveryAddress: deliveryAddress.trim(),
        paymentMethod, // backend enum: "CASH" | "CARD"
        items: cart.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
      };

      await createOrder(payload);

      // başarılı olunca temizle
      clearCart();
      localStorage.removeItem("deliveryAddress");
      localStorage.removeItem("paymentMethod");
      setDeliveryAddress("");
      setPaymentMethod("");
      navigate("/order-success");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Sipariş oluşturulamadı.";
      setFormError({ general: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-3xl mx-auto py-20 px-4 text-center">
        <div className="bg-white rounded-xl shadow-sm p-10">
          <div className="text-6xl mb-4">🛒</div>

          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            Sepetiniz boş
          </h2>

          <p className="text-gray-500 mb-6">
            Sepetinizde henüz ürün bulunmuyor. Hemen alışverişe
            başlayabilirsiniz.
          </p>

          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
          >
            Alışverişe Başla
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-6">🛒 Sepetim</h1>
      {formError.general && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {formError.general}
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {cart.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-4 border-b last:border-b-0"
          >
            <div className="flex items-center gap-4">
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-16 h-16 object-cover rounded"
              />
              <div>
                <h3 className="font-semibold">{item.name}</h3>
                {item.unitLabel && (
                  <p className="text-sm text-gray-500">{item.unitLabel}</p>
                )}
                <p className="text-blue-600 font-medium">
                  {formatPrice(item.price)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => decreaseQuantity(item.id)}
                  className="w-8 h-8 flex items-center justify-center rounded-full border
               hover:bg-gray-100 transition text-lg font-medium"
                  aria-label="Azalt"
                >
                  −
                </button>

                <span className="min-w-[24px] text-center font-medium">
                  {item.quantity}
                </span>

                <button
                  onClick={() => increaseQuantity(item.id)}
                  className="w-8 h-8 flex items-center justify-center rounded-full border
               hover:bg-gray-100 transition text-lg font-medium"
                  aria-label="Arttır"
                >
                  +
                </button>
              </div>

              <div className="text-right w-24">
                <p className="font-bold">
                  {formatPrice(item.price * item.quantity)}
                </p>
              </div>

              <button
                onClick={() => removeFromCart(item.id)}
                className="text-red-500 hover:text-red-700 p-2"
                disabled={isSubmitting}
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}

        {/* Address */}
        <div className="p-6 border-t bg-white">
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            🚚 Teslimat Adresi
          </label>

          <div className="relative">
            <textarea
              value={deliveryAddress}
              onChange={(e) => {
                setDeliveryAddress(e.target.value);
                setFormError((prev) => ({
                  ...prev,
                  deliveryAddress: undefined,
                  general: undefined,
                }));
              }}
              rows={4}
              placeholder="Adresinizi detaylı yazın (Mahalle, cadde, no, daire, tarif)..."
              className="w-full rounded-xl border border-gray-200 bg-gray-50 p-4 pr-12
                 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                 text-gray-900 placeholder:text-gray-400"
              disabled={isSubmitting}
            />
            {formError.deliveryAddress && (
              <p className="mt-2 text-sm text-red-600">
                {formError.deliveryAddress}
              </p>
            )}
          </div>

          <p className="mt-2 text-xs text-gray-500">
            Siparişinizi hızlı teslim edebilmemiz için mümkün olduğunca detaylı
            yazın.
          </p>

          {/* Payment Method */}
          <div className="mt-6">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
              💳 Ödeme Yöntemleri
            </div>
            {formError.paymentMethod && (
              <p className="mb-3 text-sm text-red-600">
                {formError.paymentMethod}
              </p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* CASH */}
              <button
                type="button"
                onClick={() => {
                  setPaymentMethod("CASH");
                  setFormError((prev) => ({
                    ...prev,
                    paymentMethod: undefined,
                    general: undefined,
                  }));
                }}
                disabled={isSubmitting}
                className={[
                  "w-full rounded-xl border p-4 text-left transition",
                  "hover:shadow-sm",
                  paymentMethod === "CASH"
                    ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                    : "border-gray-200 bg-white",
                  isSubmitting ? "opacity-60 cursor-not-allowed" : "",
                ].join(" ")}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={[
                      "h-5 w-5 rounded border flex items-center justify-center",
                      paymentMethod === "CASH"
                        ? "bg-red-500 border-red-500 text-white"
                        : "bg-white border-gray-300",
                    ].join(" ")}
                  >
                    {paymentMethod === "CASH" ? "✓" : ""}
                  </span>

                  <div className="flex flex-col">
                    <span className="font-semibold text-gray-900">
                      Kapıda Nakit Ödeme
                    </span>
                    <span className="text-xs text-gray-500">
                      Ödeme teslimatta alınır
                    </span>
                  </div>
                </div>
              </button>

              {/* CARD */}
              <button
                type="button"
                onClick={() => {
                  setPaymentMethod("CARD");
                  setFormError((prev) => ({
                    ...prev,
                    paymentMethod: undefined,
                    general: undefined,
                  }));
                }}
                disabled={isSubmitting}
                className={[
                  "w-full rounded-xl border p-4 text-left transition",
                  "hover:shadow-sm",
                  paymentMethod === "CARD"
                    ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                    : "border-gray-200 bg-white",
                  isSubmitting ? "opacity-60 cursor-not-allowed" : "",
                ].join(" ")}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={[
                      "h-5 w-5 rounded border flex items-center justify-center",
                      paymentMethod === "CARD"
                        ? "bg-red-500 border-red-500 text-white"
                        : "bg-white border-gray-300",
                    ].join(" ")}
                  >
                    {paymentMethod === "CARD" ? "✓" : ""}
                  </span>

                  <div className="flex flex-col">
                    <span className="font-semibold text-gray-900">
                      Kapıda Kredi Kartı
                    </span>
                    <span className="text-xs text-gray-500">POS ile ödeme</span>
                  </div>
                </div>
              </button>

              {/* IBAN / Havale (şimdilik disabled) */}
              <button
                type="button"
                disabled
                className="w-full rounded-xl border border-gray-200 bg-white p-4 text-left opacity-50 cursor-not-allowed"
                title="Yakında"
              >
                <div className="flex items-center gap-3">
                  <span className="h-5 w-5 rounded border border-gray-300 bg-white" />
                  <div className="flex flex-col">
                    <span className="font-semibold text-gray-900">
                      IBAN / Havale
                    </span>
                    <span className="text-xs text-gray-500">Yakında</span>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Total */}
        <div className="p-6 bg-gray-50 flex justify-between items-center">
          <span className="text-xl font-semibold">Toplam:</span>
          <span className="text-2xl font-bold text-blue-600">
            {formatPrice(totalAmount)}
          </span>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-4">
        <Link to="/" className="px-6 py-3 border rounded-lg hover:bg-gray-50">
          Alışverişe Devam Et
        </Link>

        <button
          onClick={handleCheckout}
          disabled={isSubmitting}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Sipariş oluşturuluyor" : "Siparişi Tamamla"}
        </button>
      </div>
    </div>
  );
};

export default Cart;
