export function toDate(date: string, time: string) {
  const clean = (time || '').split('+')[0];
  const hhmmss = clean.length >= 5 ? clean : `${clean}:00`;
  const [y, m, d] = date.split('-').map(Number);
  const [hh, mm, ss] = hhmmss.split(':').map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1, hh ?? 0, mm ?? 0, ss ?? 0, 0);
}

export function isCompleted(date: string, startTime: string) {
  const start = toDate(date, startTime);
  const endWithBuffer = new Date(start.getTime() + 70 * 60 * 1000);
  return new Date() >= endWithBuffer;
}