import { addMinutes, format, isBefore, isAfter, parse, parseISO } from 'date-fns';
import type { Booking, Block } from '~/types/models';

const HHmm = 'HH:mm';

export function buildDaySlots(dateISO: string, openTime: string, closeTime: string){
  const slots: string[] = [];
  const date = parseISO(dateISO);
  let cur = parse(`${format(date, 'yyyy-MM-dd')} ${openTime.slice(0,5)}`, 'yyyy-MM-dd HH:mm', new Date());
  const endLimit = parse(`${format(date, 'yyyy-MM-dd')} ${closeTime.slice(0,5)}`, 'yyyy-MM-dd HH:mm', new Date());
  while (isBefore(addMinutes(cur, 60), addMinutes(endLimit, 1))){
    slots.push(format(cur, HHmm));
    cur = addMinutes(cur, 60);
  }
  return slots;
}

export function conflictsWithBooking(slotStart: Date, b: Booking){
  const d = b.date;
  const start = parse(`${d} ${b.startTime.slice(0,5)}`, 'yyyy-MM-dd HH:mm', new Date());
  const bufferEnd = parse(`${d} ${b.bufferUntil.slice(0,5)}`, 'yyyy-MM-dd HH:mm', new Date());
  const slotEnd = addMinutes(slotStart, 60);
  const overlaps = isBefore(slotStart, bufferEnd) && isAfter(slotEnd, start);
  return overlaps;
}

export function isBlocked(slotStart: Date, blocks: Block[], dateISO: string){
  const yyyyMMdd = format(parseISO(dateISO), 'yyyy-MM-dd');
  for (const bl of blocks){
    if (bl.date !== yyyyMMdd) continue;
    if (!bl.start && !bl.finish) return true;
    const s = (bl.start ?? '00:00').slice(0,5);
    const e = (bl.finish ?? '23:59').slice(0,5);
    const start = parse(`${yyyyMMdd} ${s}`, 'yyyy-MM-dd HH:mm', new Date());
    const end = parse(`${yyyyMMdd} ${e}`, 'yyyy-MM-dd HH:mm', new Date());
    if (isAfter(slotStart, addMinutes(start, -1)) && isBefore(slotStart, addMinutes(end, 1))) return true;
  }
  return false;
}

export function buildAvailableSlots(dateISO: string, openTime: string, closeTime: string, bookings: Booking[], blocks: Block[]){
  const base = buildDaySlots(dateISO, openTime, closeTime);
  const available: string[] = [];
  for (const hhmm of base){
    const slotStart = parse(`${dateISO} ${hhmm}`, 'yyyy-MM-dd HH:mm', new Date());
    const hasConflict = bookings.some(b => conflictsWithBooking(slotStart, b));
    const blocked = isBlocked(slotStart, blocks, dateISO);
    if (!hasConflict && !blocked) available.push(hhmm);
  }
  return available;
}
