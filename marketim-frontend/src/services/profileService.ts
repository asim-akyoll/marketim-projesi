import http from "./http";

export type Profile = {
  fullName: string;
  phone: string;
  address: string;
  username?: string;
};

const LS_KEY = "profile";

function readLocal(): Profile {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return { fullName: "", phone: "", address: "", username: "" };
    const p = JSON.parse(raw);
    return {
      fullName: String(p.fullName ?? ""),
      phone: String(p.phone ?? ""),
      address: String(p.address ?? ""),
      username: p.username || "",
    };
  } catch {
    return { fullName: "", phone: "", address: "", username: "" };
  }
}

function writeLocal(profile: Profile) {
  localStorage.setItem(LS_KEY, JSON.stringify(profile));
}

export const profileService = {
  /**
   * Backend varsa: GET /api/users/me
   * Yoksa: localStorage'dan döner
   */
  async getMe(): Promise<Profile> {
    try {
      const res = await http.get("/api/users/me");
      // Beklenen shape: { fullName, phone, address, username } (senin backend'e göre uyarlanır)
      const data = res.data ?? {};
      const profile: Profile = {
        fullName: String(data.fullName ?? data.name ?? ""),
        phone: String(data.phone ?? ""),
        address: String(data.address ?? data.deliveryAddress ?? ""),
        username: data.username || "",
      };
      writeLocal(profile); // cache
      return profile;
    } catch {
      return readLocal();
    }
  },

  /**
   * Backend varsa: PUT /api/users/me
   * Yoksa: localStorage'ı günceller
   */
  async updateMe(payload: Profile): Promise<Profile> {
    // önce local'a yaz (UI hızlı tepki versin)
    writeLocal(payload);

    try {
      const res = await http.put("/api/users/me", payload);
      const data = res.data ?? payload;
      const saved: Profile = {
        fullName: String(data.fullName ?? payload.fullName),
        phone: String(data.phone ?? payload.phone),
        address: String(data.address ?? payload.address),
        username: data.username || payload.username || "",
      };
      writeLocal(saved);
      return saved;
    } catch {
      // backend yoksa da sorun değil, local ile devam
      return payload;
    }
  },
};
