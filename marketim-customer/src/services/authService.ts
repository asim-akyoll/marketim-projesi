import http from "./http";

export type LoginRequest = { email: string; password: string };
export type LoginResponse = { token: string };

export const login = async (payload: LoginRequest): Promise<string> => {
  const res = await http.post<LoginResponse>("/api/auth/login", payload);
  return res.data.token;
};

export type RegisterRequest = {
  fullName: string;
  email: string;
  password: string;
  phone: string;
};

export const register = async (payload: RegisterRequest) => {
  const res = await http.post("/api/auth/register", payload);
  return res.data;
};
