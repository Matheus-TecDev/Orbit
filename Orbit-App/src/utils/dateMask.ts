export function maskBirthDate(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  const day = digits.slice(0, 2);
  const month = digits.slice(2, 4);
  const year = digits.slice(4, 8);

  if (digits.length <= 2) {
    return day;
  }

  if (digits.length <= 4) {
    return `${day}/${month}`;
  }

  return `${day}/${month}/${year}`;
}

export function parseBirthDateToApi(value: string): string | null {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value.trim());
  if (!match) {
    return null;
  }

  const [, dayText, monthText, yearText] = match;
  const day = Number.parseInt(dayText, 10);
  const month = Number.parseInt(monthText, 10);
  const year = Number.parseInt(yearText, 10);
  const parsed = new Date(year, month - 1, day);

  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    return null;
  }

  return `${yearText}-${monthText}-${dayText}`;
}

export function formatDateToBirthDate(value: Date): string {
  const day = String(value.getDate()).padStart(2, "0");
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const year = String(value.getFullYear());
  return `${day}/${month}/${year}`;
}

export function parseApiDateToDate(value: string): Date | null {
  const apiDate = parseBirthDateToApi(value);
  if (!apiDate) {
    return null;
  }

  const parsed = new Date(`${apiDate}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function getAgeFromBirthDate(value: string): number | null {
  const apiDate = parseBirthDateToApi(value);
  if (!apiDate) {
    return null;
  }

  const birthDate = new Date(`${apiDate}T00:00:00`);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  const hasNotHadBirthday =
    monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate());

  if (hasNotHadBirthday) {
    age -= 1;
  }

  return age;
}

export function isAdultBirthDate(value: string, minAge = 18): boolean {
  const age = getAgeFromBirthDate(value);
  return age !== null && age >= minAge;
}
