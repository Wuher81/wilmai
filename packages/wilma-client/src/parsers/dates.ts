export function parseWilmaTimestamp(value: unknown): Date {
  if (value === null || value === undefined) {
    return new Date();
  }

  if (typeof value === "number") {
    return new Date(value * 1000);
  }

  const text = String(value)
    .trim()
    .toLowerCase()
    .replace("klo", "")
    .replace("julkaistu", "")
    .trim();

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const rel: Record<string, number> = {
    "tänään": 0,
    "eilen": 1,
    today: 0,
    yesterday: 1,
    idag: 0,
    "i dag": 0,
    "igår": 1,
    "i går": 1,
  };

  for (const [kw, daysAgo] of Object.entries(rel)) {
    if (text.includes(kw)) {
      const base = new Date(today);
      base.setDate(base.getDate() - daysAgo);
      const timeMatch = /(\d{1,2})[:.](\d{2})/.exec(text);
      if (timeMatch) {
        const h = Number(timeMatch[1]);
        const m = Number(timeMatch[2]);
        base.setHours(h, m, 0, 0);
      }
      return base;
    }
  }

  for (const fmt of ["dateTime", "dateOnly"]) {
    if (fmt === "dateTime") {
      const match = /^(\d{1,2})\.(\d{1,2})\.(\d{4})\s+(\d{1,2}):(\d{2})$/.exec(text);
      if (match) {
        const [, d, m, y, h, mi] = match.map(Number);
        return new Date(y, m - 1, d, h, mi, 0, 0);
      }
    } else {
      const match = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec(text);
      if (match) {
        const [, d, m, y] = match.map(Number);
        return new Date(y, m - 1, d);
      }
    }
  }

  const shortMatch = /^(\d{1,2})\.(\d{1,2})\.$/.exec(text);
  if (shortMatch) {
    const [, dStr, mStr] = shortMatch;
    const day = Number(dStr);
    const month = Number(mStr);
    const candidate = new Date(now.getFullYear(), month - 1, day);
    const sixMonthsAhead = new Date(today);
    sixMonthsAhead.setDate(sixMonthsAhead.getDate() + 180);
    if (candidate > sixMonthsAhead) {
      candidate.setFullYear(candidate.getFullYear() - 1);
    }
    return candidate;
  }

  return now;
}
