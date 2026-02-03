import { Link, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { authService } from "../services/authService";
import { isAdminFromToken } from "../utils/jwt";
import { ordersService } from "../services/ordersService";
import type { MyOrderDto, OrderStatus } from "../services/ordersService";
import { profileService } from "../services/profileService";
import type { Profile } from "../services/profileService";
import { LogOut, Shield, User, Pencil, Save, X } from "lucide-react";

function safeDecodeJwt(token: string) {
  try {
    const payloadPart = token.split(".")[1];
    const json = atob(payloadPart.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decodeURIComponent(escape(json)));
  } catch {
    return null;
  }
}

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

const formatTry = (value: number) =>
  new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 2,
  }).format(value);

export default function Account() {
  const navigate = useNavigate();
  const token = authService.getToken();

  if (!token) {
    window.location.replace("/login");
    return null;
  }

  const payload = safeDecodeJwt(token);
  const isAdmin = isAdminFromToken(token);
  const email = payload?.email || payload?.sub || payload?.username || "—";

  // PROFILE
  const [profile, setProfile] = useState<Profile>({
    fullName: "",
    phone: "",
    address: "",
  });
  const [draft, setDraft] = useState<Profile>({
    fullName: "",
    phone: "",
    address: "",
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);

  // ORDERS
  const [orders, setOrders] = useState<MyOrderDto[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  const handleLogout = () => {
    authService.logout();
    navigate("/login", { replace: true });
  };

  useEffect(() => {
    (async () => {
      setProfileLoading(true);
      setProfileError(null);
      try {
        const p = await profileService.getMe();
        // JWT içinde name varsa ve profil boşsa dolduralım (opsiyonel)
        const jwtName = String(payload?.name ?? "");
        const merged: Profile = {
          fullName: p.fullName || jwtName || "",
          phone: p.phone || "",
          address: p.address || "",
        };
        setProfile(merged);
        setDraft(merged);
      } catch (e: any) {
        setProfileError("Profil bilgileri alınamadı.");
      } finally {
        setProfileLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    (async () => {
      setLoadingOrders(true);
      setOrdersError(null);
      try {
        const data = await ordersService.my();
        setOrders((data ?? []).slice(0, 5));
      } catch (e: any) {
        setOrders([]);
        setOrdersError(e?.response?.data?.message || "Siparişler alınamadı.");
      } finally {
        setLoadingOrders(false);
      }
    })();
  }, []);

  const canSave = useMemo(() => {
    const same =
      profile.fullName === draft.fullName &&
      profile.phone === draft.phone &&
      profile.address === draft.address;

    const hasAny =
      draft.fullName.trim() || draft.phone.trim() || draft.address.trim();

    return editMode && !same && hasAny && !profileSaving;
  }, [editMode, profile, draft, profileSaving]);

  const onEdit = () => {
    setDraft(profile);
    setEditMode(true);
    setProfileError(null);
  };

  const onCancel = () => {
    setDraft(profile);
    setEditMode(false);
    setProfileError(null);
  };

  const onSave = async () => {
    setProfileSaving(true);
    setProfileError(null);
    try {
      const saved = await profileService.updateMe(draft);
      setProfile(saved);
      setDraft(saved);
      setEditMode(false);
    } catch {
      setProfileError("Kaydedilemedi. Tekrar deneyin.");
    } finally {
      setProfileSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
          {/* HEADER */}
          <div className="flex items-start justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-green-100 to-green-50 flex items-center justify-center shadow-inner">
                <User className="w-7 h-7 text-green-700" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 tracking-tight">
                  Hesabım
                </div>
                <div className="text-sm text-gray-500 font-medium">
                  {email}
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="group h-11 px-5 rounded-xl border border-red-100 bg-red-50 text-red-700 font-medium hover:bg-red-600 hover:text-white hover:border-red-600 flex items-center gap-2 transition-all duration-200"
            >
              <LogOut className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
              Çıkış Yap
            </button>
          </div>

          {profileError && (
            <div className="mb-6 bg-red-50 rounded-xl border border-red-100 p-4 text-sm text-red-700 font-medium flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-red-500"></div>
              {profileError}
            </div>
          )}

          {/* PROFILE CARD */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
             
             {/* Card Header */}
             <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                    Profil Bilgileri
                </h3>
                {!editMode && (
                    <button
                        onClick={onEdit}
                        className="text-sm font-semibold text-green-700 hover:text-green-800 hover:bg-green-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
                        disabled={profileLoading}
                    >
                        <Pencil className="w-3.5 h-3.5" />
                        Düzenle
                    </button>
                )}
             </div>

             <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* First Name */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Ad Soyad</label>
                        {profileLoading ? (
                            <div className="h-11 bg-gray-50 rounded-xl animate-pulse" />
                        ) : editMode ? (
                            <input
                            value={draft.fullName}
                            onChange={(e) =>
                                setDraft((d) => ({ ...d, fullName: e.target.value }))
                            }
                            className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all font-medium"
                            placeholder="Ad Soyad"
                            />
                        ) : (
                            <div className="h-11 flex items-center text-lg font-medium text-gray-900">
                                {profile.fullName || "—"}
                            </div>
                        )}
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Telefon</label>
                        {profileLoading ? (
                            <div className="h-11 bg-gray-50 rounded-xl animate-pulse" />
                        ) : editMode ? (
                            <input
                            value={draft.phone}
                            onChange={(e) =>
                                setDraft((d) => ({ ...d, phone: e.target.value }))
                            }
                            className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all font-medium"
                            placeholder="05xx xxx xx xx"
                            />
                        ) : (
                            <div className="h-11 flex items-center text-lg font-medium text-gray-900">
                                {profile.phone || "—"}
                            </div>
                        )}
                    </div>

                    {/* Address */}
                    <div className="md:col-span-2">
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Adres</label>
                        {profileLoading ? (
                            <div className="h-24 bg-gray-50 rounded-xl animate-pulse" />
                        ) : editMode ? (
                            <textarea
                            value={draft.address}
                            onChange={(e) =>
                                setDraft((d) => ({ ...d, address: e.target.value }))
                            }
                            rows={3}
                            className="w-full p-4 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all font-medium resize-none"
                            placeholder="Açık adresiniz..."
                            />
                        ) : (
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-gray-700 font-medium leading-relaxed">
                                {profile.address || "Henüz adres girilmemiş."}
                            </div>
                        )}
                    </div>
                </div>

                {/* EDIT ACTIONS */}
                {editMode && (
                    <div className="mt-8 flex items-center justify-end gap-3 pt-6 border-t border-gray-100 animate-fade-in">
                        <button
                            onClick={onCancel}
                            className="h-11 px-6 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 hover:text-gray-900 transition-colors flex items-center gap-2"
                            disabled={profileSaving}
                        >
                            <X className="w-4 h-4" />
                            İptal
                        </button>

                        <button
                            onClick={onSave}
                            className="h-11 px-8 rounded-xl bg-green-600 text-white font-medium hover:bg-green-700 hover:shadow-lg hover:shadow-green-600/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            disabled={!canSave}
                        >
                            <Save className="w-4 h-4" />
                            {profileSaving ? "Kaydediliyor..." : "Kaydet"}
                        </button>
                    </div>
                )}
             </div>
          </div>

          {/* QUICK ACTIONS */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              to="/"
              className="h-12 rounded-xl bg-green-600 text-white hover:bg-green-700 flex items-center justify-center font-medium transition-transform active:scale-95"
            >
              Alışverişe Dön
            </Link>

            <Link
              to="/cart"
              className="h-12 rounded-xl border border-gray-200 bg-white text-gray-900 hover:bg-gray-50 hover:border-gray-300 flex items-center justify-center font-medium transition-all"
            >
              Sepete Git
            </Link>

            {isAdmin && (
              <Link
                to="/admin/dashboard"
                className="col-span-2 md:col-span-1 h-12 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 flex items-center gap-2 justify-center font-medium transition-colors"
              >
                <Shield className="w-5 h-5" />
                Admin
              </Link>
            )}
          </div>

          {/* ORDERS */}
          <div className="mt-12">
            <div className="flex items-center gap-3 mb-6">
                <div className="h-8 w-1 rounded-full bg-green-500"></div>
                <h2 className="text-xl font-bold text-gray-900">Geçmiş Siparişlerim</h2>
            </div>

            {loadingOrders ? (
              <div className="space-y-3">
                 {[1,2,3].map(i => <div key={i} className="h-20 bg-gray-50 rounded-2xl animate-pulse" />)}
              </div>
            ) : ordersError ? (
              <div className="bg-red-50 rounded-2xl border border-red-100 p-6 text-center text-red-600 font-medium">
                {ordersError}
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-gray-50 rounded-2xl border border-dashed border-gray-200 p-10 text-center">
                 <div className="text-4xl mb-3">🛍️</div>
                 <h3 className="text-lg font-semibold text-gray-900 mb-1">Henüz siparişiniz yok</h3>
                 <p className="text-gray-500">Verdiğiniz siparişler burada listelenecek.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {orders.map((o) => (
                  <div
                    key={o.id}
                    className="group bg-white rounded-2xl border border-gray-100 p-5 hover:border-green-200 hover:shadow-md transition-all duration-200 flex flex-wrap items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-gray-50 flex items-center justify-center text-lg font-bold text-gray-400 group-hover:bg-green-50 group-hover:text-green-600 transition-colors">
                            #{o.id}
                        </div>
                        <div>
                            <div className="font-bold text-gray-900 mb-0.5">
                                Sipariş #{o.id}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                                <span>{new Date(o.createdAt).toLocaleDateString("tr-TR")}</span>
                                <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                <span>{new Date(o.createdAt).toLocaleTimeString("tr-TR", {hour: '2-digit', minute:'2-digit'})}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                         <div className={`px-3 py-1 rounded-full text-xs font-bold border ${o.status === 'DELIVERED' ? 'bg-green-100 text-green-700 border-green-200' : o.status === 'CANCELLED' ? 'bg-red-100 text-red-700 border-red-200' : 'bg-orange-100 text-orange-700 border-orange-200'}`}>
                             {statusLabel(o.status)}
                         </div>
                         <div className="text-xl font-bold text-gray-900 tabular-nums">
                            {formatTry(Number(o.totalAmount))}
                         </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* /ORDERS */}
        </div>
      </div>
    </div>
  );
}
