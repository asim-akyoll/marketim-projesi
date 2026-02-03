import { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";
import { Trash2, ChevronRight, ChevronLeft, CheckCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { createOrder } from "../services/ordersService";
import { profileService } from "../services/profileService";
import { publicSettingsService } from "../services/publicSettingsService";
import { authService } from "../services/authService";
import { isShopOpen } from "../utils/timeUtils";

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

  // Wizad Step: 1=Cart, 2=Details, 3=Payment
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [showClearCartConfirm, setShowClearCartConfirm] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [deliveryAddress, setDeliveryAddress] = useState(() => {
    return localStorage.getItem("deliveryAddress") ?? "";
  });

  const [paymentMethod, setPaymentMethod] = useState(() => {
    return localStorage.getItem("paymentMethod") ?? "";
  });

  const [contactPhone, setContactPhone] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [orderNote, setOrderNote] = useState("");

  const [formError, setFormError] = useState<{
    deliveryAddress?: string;
    contactPhone?: string;
    guestName?: string;
    guestEmail?: string;
    paymentMethod?: string;
    general?: string;
  }>({});

  const [minOrderAmount, setMinOrderAmount] = useState(0);
  const [deliveryFeeFixed, setDeliveryFeeFixed] = useState(0);
  const [deliveryFreeThreshold, setDeliveryFreeThreshold] = useState(0);
  const [ibanDetails, setIbanDetails] = useState<{
    fullName: string;
    iban: string;
  }>({ fullName: "", iban: "" });

  const [shopClosed, setShopClosed] = useState<{
    isClosed: boolean;
    message?: string;
  }>({ isClosed: false });

  const [enabledMethods, setEnabledMethods] = useState<string[]>(["CASH", "CARD", "IBAN"]);

  useEffect(() => {
    (async () => {
      try {
        const isLoggedIn = authService.isLoggedIn();
        if (isLoggedIn) {
            const profile = await profileService.getMe();
            // Use functional updates to check *current* state value, 
            // preventing overwrite if user typed while fetching
            if (profile.address) {
                setDeliveryAddress(prev => prev || profile.address);
            }
            if (profile.phone) {
                setContactPhone(prev => prev || profile.phone);
            }
        }
        
        const settings = await publicSettingsService.get();
        if (settings.minOrderAmount) {
          setMinOrderAmount(settings.minOrderAmount);
        }
        if (settings.deliveryFeeFixed) {
          setDeliveryFeeFixed(settings.deliveryFeeFixed);
        }
        if (settings.deliveryFreeThreshold) {
          setDeliveryFreeThreshold(settings.deliveryFreeThreshold);
        }
        if (settings.ibanNumber) {
          setIbanDetails({
            fullName: settings.ibanFullName || "",
            iban: settings.ibanNumber,
          });
        }

        // --- DYNAMIC PAYMENT METHODS ---
        const methods: string[] = [];
        if (settings.payOnDeliveryMethods) {
           // Backend sends "CASH", "CARD", "IBAN" based on Admin Panel choices
           if (settings.payOnDeliveryMethods.includes("CASH")) methods.push("CASH");
           if (settings.payOnDeliveryMethods.includes("CARD")) methods.push("CARD");
           if (settings.payOnDeliveryMethods.includes("IBAN")) methods.push("IBAN");
        }
        setEnabledMethods(methods);

        if (settings.workingHoursEnabled) {
          const open = isShopOpen(settings.openingTime, settings.closingTime);
          if (!open) {
            setShopClosed({
              isClosed: true,
              message: `Şu an kapalıyız. Çalışma saatleri: ${settings.openingTime} - ${settings.closingTime}`,
            });
          }
        }

      } catch {
        // ignore
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    localStorage.setItem("deliveryAddress", deliveryAddress);
  }, [deliveryAddress]);

  useEffect(() => {
    localStorage.setItem("paymentMethod", paymentMethod);
  }, [paymentMethod]);

  // Validation & Navigation
  const handleNextStep = () => {
    setFormError({});
    const errors: any = {};

    if (step === 1) {
      if (totalAmount < minOrderAmount) return; // Should be disabled anyway
      if (shopClosed.isClosed) return; // Should be disabled
      setStep(2);
      window.scrollTo(0, 0);
    } else if (step === 2) {
      if (!deliveryAddress.trim()) errors.deliveryAddress = "Teslimat adresi zorunludur.";
      if (!contactPhone.trim()) errors.contactPhone = "İletişim numarası zorunludur.";

      const isLoggedIn = authService.isLoggedIn();
      if (!isLoggedIn) {
          if (!guestName.trim()) errors.guestName = "Ad Soyad zorunludur.";
          if (!guestEmail.trim()) errors.guestEmail = "E-posta zorunludur.";
      }

      if (Object.keys(errors).length > 0) {
        setFormError(errors);
        return;
      }
      setStep(3);
      window.scrollTo(0, 0);
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep((prev) => (prev - 1) as 1 | 2 | 3);
      window.scrollTo(0, 0);
    }
  };

  const handleCheckout = async () => {
    setFormError({});
    const errors: any = {};
    if (!paymentMethod) errors.paymentMethod = "Ödeme yöntemi seçilmelidir.";

    if (Object.keys(errors).length > 0) {
      setFormError(errors);
      return;
    }

    try {
      setIsSubmitting(true);
      const isLoggedIn = authService.isLoggedIn();

      const payload = {
        deliveryAddress: deliveryAddress.trim(),
        paymentMethod,
        items: cart.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
        note: orderNote.trim(),
        contactPhone: contactPhone.trim(),
        guestName: !isLoggedIn ? guestName.trim() : undefined,
        guestEmail: !isLoggedIn ? guestEmail.trim() : undefined,
      };

      await createOrder(payload);

      clearCart();
      localStorage.removeItem("deliveryAddress");
      localStorage.removeItem("paymentMethod");
      setDeliveryAddress("");
      setPaymentMethod("");
      navigate("/order-success");
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Sipariş oluşturulamadı.";
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
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Sepetiniz boş</h2>
          <p className="text-gray-500 mb-6">Sepetinizde henüz ürün bulunmuyor.</p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition"
          >
            Alışverişe Başla
          </button>
        </div>
      </div>
    );
  }

  // Calculate Finals
  const isFreeDelivery = totalAmount >= deliveryFreeThreshold && deliveryFreeThreshold > 0;
  const currentDeliveryFee = isFreeDelivery ? 0 : deliveryFeeFixed;
  const finalTotal = totalAmount + currentDeliveryFee;

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Header / Steps Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">🛒 Sepetim</h1>
          {step === 1 && (
            <button
              onClick={() => setShowClearCartConfirm(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-full transition-colors"
            >
              <Trash2 size={16} />
              <span>Sepeti Temizle</span>
            </button>
          )}
        </div>

        {/* Steps Progress */}
        <div className="flex items-center justify-between relative px-4">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 -z-10"></div>
          <div 
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-green-600 -z-10 transition-all duration-300" 
            style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}
          ></div>
          
          {/* Step 1 */}
          <div className={`flex flex-col items-center gap-2 bg-slate-50 px-2 ${step >= 1 ? "text-green-600" : "text-gray-400"}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 ${step >= 1 ? "bg-green-600 text-white border-green-600" : "bg-white border-gray-300"}`}>
                {step > 1 ? <CheckCircle size={16} /> : "1"}
            </div>
            <span className="text-xs font-semibold">Sepet</span>
          </div>

          {/* Step 2 */}
          <div className={`flex flex-col items-center gap-2 bg-slate-50 px-2 ${step >= 2 ? "text-green-600" : "text-gray-400"}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 ${step >= 2 ? "bg-green-600 text-white border-green-600" : "bg-white border-gray-300"}`}>
                {step > 2 ? <CheckCircle size={16} /> : "2"}
            </div>
            <span className="text-xs font-semibold">Bilgiler</span>
          </div>

          {/* Step 3 */}
          <div className={`flex flex-col items-center gap-2 bg-slate-50 px-2 ${step >= 3 ? "text-green-600" : "text-gray-400"}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 ${step >= 3 ? "bg-green-600 text-white border-green-600" : "bg-white border-gray-300"}`}>
                3
            </div>
            <span className="text-xs font-semibold">Ödeme</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        
        {/* ----------- STEP 1: CART ITEMS ----------- */}
        {step === 1 && (
          <div className="animate-fade-in">
             {totalAmount < minOrderAmount && (
              <div className="bg-red-50 border-b border-red-100 p-4 text-red-700 text-sm font-medium">
                ⚠️ Minimum sipariş tutarı {minOrderAmount} TL'dir. Lütfen sepetinize ürün ekleyin.
              </div>
            )}
            {shopClosed.isClosed && (
              <div className="bg-orange-50 border-b border-orange-100 p-4 text-orange-800 text-sm font-medium">
                🕒 {shopClosed.message}
              </div>
            )}

            {cart.map((item) => (
              <div key={item.product.id} className="flex flex-col md:flex-row md:items-center p-4 border-b last:border-b-0 gap-4">
                {/* Product Info */}
                <div className="flex items-center gap-4 flex-1">
                  <img src={item.product.imageUrl} alt={item.product.name} className="w-20 h-20 md:w-16 md:h-16 object-cover rounded-lg bg-slate-100" />
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-semibold text-slate-900">{item.product.name}</h3>
                            {item.product.unitLabel && <p className="text-sm text-slate-500">{item.product.unitLabel}</p>}
                        </div>
                        {/* Mobile Trash (Top Right) */}
                        <button 
                            onClick={() => removeFromCart(item.product.id)} 
                            className="md:hidden -mr-2 p-2 text-slate-400 hover:text-red-500 active:text-red-600"
                            aria-label="Ürünü sil"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                    <p className="text-green-600 font-medium mt-1 md:hidden">{formatPrice(item.product.price)} / adet</p>
                    <p className="text-green-600 font-medium hidden md:block">{formatPrice(item.product.price)}</p>
                  </div>
                </div>

                {/* Actions Row (Mobile: Full Width / Desktop: Auto) */}
                <div className="flex items-center justify-between md:justify-end gap-0 md:gap-8 w-full md:w-auto">
                   
                   {/* Mobile Label (Quantity) */}
                   <span className="text-sm font-medium text-slate-500 md:hidden">Adet:</span>

                   <div className="flex items-center gap-1 md:gap-2">
                      {/* Controls */}
                      <div className="flex items-center bg-slate-100 rounded-lg p-1">
                        <button 
                            onClick={() => decreaseQuantity(item.product.id)} 
                            className="w-8 h-8 flex items-center justify-center rounded-md bg-white shadow-sm text-slate-600 hover:text-red-500 active:scale-95 transition font-bold"
                            aria-label="Azalt"
                        >
                            −
                        </button>
                        <span className="w-10 text-center font-semibold text-slate-700 text-sm md:text-base">{item.quantity}</span>
                        <button 
                            onClick={() => increaseQuantity(item.product.id)} 
                            className="w-8 h-8 flex items-center justify-center rounded-md bg-white shadow-sm text-slate-600 hover:text-green-600 active:scale-95 transition font-bold"
                            aria-label="Arttır"
                        >
                            +
                        </button>
                      </div>
                   </div>

                   <div className="text-right min-w-[5rem]">
                      <p className="text-xs text-slate-400 md:hidden">Toplam</p>
                      <p className="font-bold text-lg text-slate-900">{formatPrice(item.product.price * item.quantity)}</p>
                   </div>

                   {/* Desktop Trash */}
                   <button onClick={() => removeFromCart(item.product.id)} className="hidden md:block text-slate-400 hover:text-red-500 p-2 transition">
                        <Trash2 className="w-5 h-5" />
                   </button>
                </div>
              </div>
            ))}
            
            <div className="p-4 bg-gray-50 rounded-b-lg space-y-3">
                <div className="flex justify-between items-center text-gray-600">
                    <span>Ara Toplam:</span>
                    <span className="font-semibold">{formatPrice(totalAmount)}</span>
                </div>
                
                <div className="flex justify-between items-center text-gray-600">
                    <span>Teslimat Ücreti:</span>
                    <span className={isFreeDelivery ? "text-green-600 font-bold" : "font-semibold"}>
                        {isFreeDelivery ? "Ücretsiz" : formatPrice(deliveryFeeFixed)}
                    </span>
                </div>

                {deliveryFreeThreshold > 0 && !isFreeDelivery && (
                    <div className="text-xs text-orange-600 text-right">
                        {formatPrice(deliveryFreeThreshold - totalAmount)} daha ekle, teslimat bedava olsun!
                    </div>
                )}

                <div className="flex justify-between items-center text-xl pt-3 border-t">
                    <span className="font-semibold">Toplam:</span>
                    <span className="text-2xl font-bold text-green-600">{formatPrice(finalTotal)}</span>
                </div>
            </div>
          </div>
        )}

        {/* ----------- STEP 2: DETAILS ----------- */}
        {step === 2 && (
          <div className="animate-fade-in p-6 space-y-6">
             {/* Guest Info */}
             {!authService.isLoggedIn() && (
                <div className="space-y-4 border-b pb-6">
                   <div className="bg-blue-50 border border-blue-100 p-3 rounded-xl text-sm text-blue-800">
                       🔑 <strong>Misafir girişi</strong> ile devam ediyorsunuz.
                       Hesabınız varsa <a href="/login" className="underline font-bold">Giriş Yapın</a>.
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div>
                           <label className="block text-sm font-semibold text-gray-900 mb-2">Ad Soyad <span className="text-red-500">*</span></label>
                           <input
                               type="text"
                               className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 focus:ring-2 focus:ring-blue-500"
                               placeholder="Adınız Soyadınız"
                               value={guestName}
                               onChange={(e) => {
                                   setGuestName(e.target.value);
                                   setFormError(p => ({...p, guestName: undefined}));
                               }}
                           />
                           {formError.guestName && <p className="text-red-500 text-sm mt-1">{formError.guestName}</p>}
                       </div>
                       <div>
                           <label className="block text-sm font-semibold text-gray-900 mb-2">E-posta <span className="text-red-500">*</span></label>
                               <input
                               type="email"
                               className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 focus:ring-2 focus:ring-blue-500"
                               placeholder="ornek@email.com"
                               value={guestEmail}
                               onChange={(e) => {
                                   setGuestEmail(e.target.value);
                                   setFormError(p => ({...p, guestEmail: undefined}));
                               }}
                           />
                           {formError.guestEmail && <p className="text-red-500 text-sm mt-1">{formError.guestEmail}</p>}
                       </div>
                   </div>
                </div>
            )}

            {/* Address */}
            <div className="space-y-4">
               <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    🚚 Teslimat Adresi <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={deliveryAddress}
                    onChange={(e) => {
                      setDeliveryAddress(e.target.value);
                      setFormError((prev) => ({ ...prev, deliveryAddress: undefined }));
                    }}
                    rows={3}
                    placeholder="Mahalle, cadde, no, daire, tarif..."
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 p-4
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                       text-gray-900 placeholder:text-gray-400"
                  />
                  {formError.deliveryAddress && <p className="mt-2 text-sm text-red-600">{formError.deliveryAddress}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    📞 İletişim Numarası <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={contactPhone}
                    onChange={(e) => {
                      setContactPhone(e.target.value);
                      setFormError((prev) => ({ ...prev, contactPhone: undefined }));
                    }}
                    placeholder="05XX XXX XX XX"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3
                          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                          text-gray-900 placeholder:text-gray-400"
                  />
                  {formError.contactPhone && <p className="mt-2 text-sm text-red-600">{formError.contactPhone}</p>}
                </div>

                <div>
                   <label className="block text-sm font-semibold text-gray-900 mb-2">
                    🗒️ Sipariş Notu (İsteğe bağlı)
                   </label>
                   <textarea
                     className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                           text-gray-900 placeholder:text-gray-400 text-sm"
                     placeholder="Örn: Zili çalmayın..."
                     value={orderNote}
                     onChange={(e) => setOrderNote(e.target.value)}
                     rows={1}
                   ></textarea>
                </div>
            </div>
          </div>
        )}

        {/* ----------- STEP 3: PAYMENT & SUMMARY ----------- */}
        {step === 3 && (
            <div className="animate-fade-in p-6">
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  💳 Ödeme Yöntemleri
                </label>
                {formError.paymentMethod && <p className="mb-3 text-sm text-red-600">{formError.paymentMethod}</p>}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
                    {(enabledMethods.includes("CASH")) && (
                    <button
                        type="button"
                        onClick={() => { setPaymentMethod("CASH"); setFormError(p => ({...p, paymentMethod: undefined})); }}
                        className={`w-full rounded-xl border p-4 text-left transition hover:shadow-sm ${paymentMethod === "CASH" ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200" : "border-gray-200 bg-white"}`}
                    >
                        <div className="flex items-center gap-3">
                            <span className={`h-5 w-5 rounded border flex items-center justify-center ${paymentMethod === "CASH" ? "bg-red-500 border-red-500 text-white" : "bg-white border-gray-300"}`}>{paymentMethod === "CASH" ? "✓" : ""}</span>
                            <div>
                                <span className="font-semibold text-gray-900 block">Kapıda Nakit</span>
                                <span className="text-xs text-gray-500">Teslimatta ödeme</span>
                            </div>
                        </div>
                    </button>
                    )}

                    {(enabledMethods.includes("CARD")) && (
                     <button
                        type="button"
                        onClick={() => { setPaymentMethod("CARD"); setFormError(p => ({...p, paymentMethod: undefined})); }}
                        className={`w-full rounded-xl border p-4 text-left transition hover:shadow-sm ${paymentMethod === "CARD" ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200" : "border-gray-200 bg-white"}`}
                    >
                        <div className="flex items-center gap-3">
                            <span className={`h-5 w-5 rounded border flex items-center justify-center ${paymentMethod === "CARD" ? "bg-red-500 border-red-500 text-white" : "bg-white border-gray-300"}`}>{paymentMethod === "CARD" ? "✓" : ""}</span>
                            <div>
                                <span className="font-semibold text-gray-900 block">Kapıda Kredi Kartı</span>
                                <span className="text-xs text-gray-500">POS ile ödeme</span>
                            </div>
                        </div>
                    </button>
                    )}

                    {(enabledMethods.includes("IBAN")) && (
                    <button
                        type="button"
                        onClick={() => { setPaymentMethod("IBAN"); setFormError(p => ({...p, paymentMethod: undefined})); }}
                        className={`w-full rounded-xl border p-4 text-left transition hover:shadow-sm ${paymentMethod === "IBAN" ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200" : "border-gray-200 bg-white"}`}
                    >
                         <div className="flex items-center gap-3">
                            <span className={`h-5 w-5 rounded border flex items-center justify-center ${paymentMethod === "IBAN" ? "bg-red-500 border-red-500 text-white" : "bg-white border-gray-300"}`}>{paymentMethod === "IBAN" ? "✓" : ""}</span>
                            <div>
                                <span className="font-semibold text-gray-900 block">IBAN / Havale</span>
                                <span className="text-xs text-gray-500">Hesaba havale</span>
                            </div>
                        </div>
                    </button>
                    )}
                </div>
                 {/* IBAN seçildiyse detay göster */}
                {paymentMethod === "IBAN" && ibanDetails.iban && (
                <div className="mb-6 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
                    <div className="font-semibold mb-1">Banka Hesap Bilgileri:</div>
                    <div className="mb-1"><span className="font-medium">Alıcı:</span> {ibanDetails.fullName || "Marketim"}</div>
                    <div className="font-mono text-base font-bold select-all">{ibanDetails.iban}</div>
                    <div className="mt-2 text-xs text-blue-600">
                    * Lütfen açıklama kısmına <strong>isminizi</strong> yazınız.
                    </div>
                </div>
                )}

                {/* Summary */}
                <div className="bg-gray-50 p-4 rounded-xl space-y-3">
                     <div className="flex justify-between items-center text-gray-600">
                        <span>Ara Toplam:</span>
                        <span className="font-semibold">{formatPrice(totalAmount)}</span>
                    </div>
                     <div className="flex justify-between items-center text-gray-600">
                        <span>Teslimat Ücreti:</span>
                        <span className={isFreeDelivery ? "text-green-600 font-bold" : "font-semibold"}>
                            {isFreeDelivery ? "Ücretsiz" : formatPrice(deliveryFeeFixed)}
                        </span>
                    </div>
                    
                    {deliveryFreeThreshold > 0 && !isFreeDelivery && (
                        <div className="text-xs text-orange-600 text-right">
                          {formatPrice(deliveryFreeThreshold - totalAmount)} daha ekle, teslimat bedava olsun!
                        </div>
                    )}
                    
                     <div className="flex justify-between items-center text-xl pt-3 border-t">
                        <span className="font-semibold">Toplam:</span>
                        <span className="text-2xl font-bold text-green-600">{formatPrice(finalTotal)}</span>
                    </div>
                </div>

                 {formError.general && (
                    <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {formError.general}
                    </div>
                )}
            </div>
        )}
      </div>

      {/* ----------- ACTION BUTTONS ----------- */}
      <div className="mt-8 flex flex-col gap-3 md:flex-row md:justify-between">
         {/* LEFT BUTTON (Continue / Back) */}
         <div className="w-full md:w-auto order-2 md:order-1">
             {step === 1 && (
                 <Link to="/" className="flex items-center justify-center w-full md:w-auto px-6 py-3.5 border border-slate-300 rounded-xl hover:bg-slate-50 transition text-slate-700 font-semibold shadow-sm">
                     Alışverişe Devam Et
                 </Link>
             )}
             {step > 1 && (
                 <button 
                    onClick={handlePrevStep}
                    className="flex items-center justify-center w-full md:w-auto gap-2 px-6 py-3.5 border border-slate-300 rounded-xl hover:bg-slate-50 transition text-slate-700 font-semibold shadow-sm"
                 >
                     <ChevronLeft size={20} />
                     Geri
                 </button>
             )}
         </div>

         {/* RIGHT BUTTON (Next / Checkout) */}
         <div className="w-full md:w-auto order-1 md:order-2">
             {step < 3 && (
                 <button
                    onClick={handleNextStep}
                    disabled={step === 1 && (totalAmount < minOrderAmount || shopClosed.isClosed)}
                    className="flex items-center justify-center w-full md:w-auto gap-2 px-8 py-3.5 bg-green-600 text-white rounded-xl hover:bg-green-700 font-bold shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition transform active:scale-[0.98]"
                 >
                     Sonraki
                     <ChevronRight size={20} />
                 </button>
             )}
             {step === 3 && (
                 <button
                    onClick={handleCheckout}
                    disabled={isSubmitting}
                    className="flex items-center justify-center w-full md:w-auto px-8 py-3.5 bg-green-600 text-white rounded-xl hover:bg-green-700 font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition shadow-md hover:shadow-lg transform active:scale-[0.98]"
                 >
                    {isSubmitting ? "Sipariş Oluşturuluyor..." : "Siparişi Tamamla"}
                 </button>
             )}
         </div>
      </div>

      {/* Clear Cart Modal */}
      {showClearCartConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
               <div className="bg-red-50 p-3 rounded-full">
                  <Trash2 size={24} />
               </div>
               <h3 className="text-lg font-bold text-gray-900">Sepeti Temizle</h3>
            </div>
            
            <p className="text-gray-600">
              Sepetinizdeki tüm ürünler silinecek. Bu işlem geri alınamaz. Devam etmek istiyor musunuz?
            </p>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowClearCartConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
              >
                Vazgeç
              </button>
              <button
                onClick={() => {
                  clearCart();
                  setShowClearCartConfirm(false);
                }}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition"
              >
                Evet, Temizle
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Cart;
