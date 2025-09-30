export function pad(n: number) {
  return String(n).padStart(2, '0');
}

export function toLocalDateString(d = new Date()) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function isPastDate(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const selected = new Date(y, m - 1, d, 0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return selected < today;
}

export function isToday(dateStr: string) {
  return dateStr === toLocalDateString();
}

export function nowHHMM() {
  const now = new Date();
  return `${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

export function toHHMM(t?: string | null) {
  if (!t) return undefined as any;
  return t.slice(0, 5);
}

export function hhmmToMin(hhmm: string) {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

export function calculateEndTime(startTime: string, durationMinutes: number = 60) {
  const [h, m] = startTime.split(':').map(Number);
  let endH = h;
  let endM = m + durationMinutes;
  if (endM >= 60) {
    endH += Math.floor(endM / 60);
    endM = endM % 60;
  }
  return `${pad(endH)}:${pad(endM)}`;
}

export function calculateBufferTime(startTime: string, totalMinutes: number = 70) {
  const [h, m] = startTime.split(':').map(Number);
  let bufferH = h;
  let bufferM = m + totalMinutes;
  if (bufferM >= 60) {
    bufferH += Math.floor(bufferM / 60);
    bufferM = bufferM % 60;
  }
  return `${pad(bufferH)}:${pad(bufferM)}`;
}