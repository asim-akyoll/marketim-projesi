const decodePayload = (token: string) => {
  const base64Url = token.split(".")[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  return JSON.parse(decodeURIComponent(escape(window.atob(base64))));
};

export const isAdminFromToken = (token: string) => {
  try {
    const payload = decodePayload(token);

    const roles: string[] =
      payload.roles ||
      payload.authorities ||
      payload.authority ||
      payload?.user?.roles ||
      [];

    const roleStr: string | undefined = payload.role;

    return (
      roleStr === "ADMIN" ||
      roles.includes("ADMIN") ||
      roles.includes("ROLE_ADMIN")
    );
  } catch {
    return false;
  }
};
