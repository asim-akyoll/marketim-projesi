import http from "./http";

type LoginResponse = {
  token: string;
};

export const authService = {
  async login(email: string, password: string) {
    const res = await http.post<LoginResponse>("/api/auth/login", {
      email,
      password,
    });

    const token = res.data.token;
    localStorage.setItem("token", token);

    return token;
  },

  async register(data: { fullName: string; email: string; password: string; phone: string }) {
    await http.post("/api/auth/register", data);
  },

  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("deliveryAddress");
    localStorage.removeItem("paymentMethod");
    localStorage.removeItem("profile");
  },

  getToken() {
    return localStorage.getItem("token");
  },

  isLoggedIn() {
    return Boolean(localStorage.getItem("token"));
  },
};
