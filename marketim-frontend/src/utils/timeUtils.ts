export const isShopOpen = (openingTime: string, closingTime: string): boolean => {
  if (!openingTime || !closingTime) return true;

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const [openHour, openMinute] = openingTime.split(":").map(Number);
  const startMinutes = openHour * 60 + openMinute;

  const [closeHour, closeMinute] = closingTime.split(":").map(Number);
  const endMinutes = closeHour * 60 + closeMinute;

  // Case 1: Standard day (09:00 - 22:00)
  if (startMinutes < endMinutes) {
    return currentMinutes >= startMinutes && currentMinutes < endMinutes;
  }

  // Case 2: Past midnight (18:00 - 02:00)
  return currentMinutes >= startMinutes || currentMinutes < endMinutes;
};
