const decodePayload = (token: string) => {
  const base64Url = token.split(".")[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "===".slice((base64.length + 3) % 4); // padding
  return JSON.parse(decodeURIComponent(escape(window.atob(padded))));
};

const normalizeRoles = (raw: any): string[] => {
  if (!raw) return [];
  if (typeof raw === "string") return [raw];
  if (Array.isArray(raw)) {
    return raw
      .flatMap((x) => {
        if (typeof x === "string") return [x];
        if (x?.authority) return [x.authority];
        if (x?.role) return [x.role];
        return [];
      })
      .filter(Boolean);
  }
  return [];
};

export const isAdminFromToken = (token: string) => {
  try {
    const payload = decodePayload(token);

    const roles = [
      ...normalizeRoles(payload.roles),
      ...normalizeRoles(payload.authorities),
      ...normalizeRoles(payload.scope),
      ...normalizeRoles(payload.scopes),
      ...normalizeRoles(payload?.user?.roles),
    ];

    const roleStr = payload.role;

    return (
      roleStr === "ADMIN" ||
      roleStr === "ROLE_ADMIN" ||
      roles.includes("ADMIN") ||
      roles.includes("ROLE_ADMIN")
    );
  } catch {
    return false;
  }
};
