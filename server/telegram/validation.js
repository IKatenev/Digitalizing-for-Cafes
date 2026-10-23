export function normalisePhone(value) {
  if (typeof value !== "string" || !/^[+\d\s().-]{1,30}$/.test(value)) {
    return "";
  }
  const national = value.replace(/[\s().-]/g, "").replace(/^(?:\+44|0044)0?/, "0");
  return /^0[12378]\d{8,9}$/.test(national) ? `+44${national.slice(1)}` : "";
}

export function validateEnquiry(data) {
  if (!data || typeof data !== "object") {
    return null;
  }
  const name = typeof data.name === "string" ? data.name.trim() : "";
  const email = typeof data.email === "string" ? data.email.trim() : "";
  const phone = normalisePhone(data.phone);
  if (
    !name ||
    name.length > 100 ||
    [...name].some((character) => character.charCodeAt(0) < 32) ||
    email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    !phone ||
    data.agreement !== true
  ) {
    return null;
  }
  return { name, email, phone };
}
