import { supabase } from '~/lib/supabase';
import { toCSV } from '~/utils/csv';

function pad(n:number){ return n < 10 ? '0'+n : ''+n; }

export async function fetchBookingsByMonth(year: number, month: number){
  const start = `${year}-${pad(month)}-01`;
  const endMonth = month === 12 ? 1 : (month+1);
  const endYear = month === 12 ? (year+1) : year;
  const end = `${endYear}-${pad(endMonth)}-01`;

  // Busca reservas do mês
  const bookingsRes = await supabase
    .from('bookings')
    .select('id,date,start_time,end_time,buffer_until,status,created_at,user_id')
    .gte('date', start)
    .lt('date', end)
    .order('date', { ascending: true })
    .order('start_time', { ascending: true });

  if (bookingsRes.error) throw bookingsRes.error;
  const bookings = bookingsRes.data ?? [];

  if (bookings.length === 0) return [];

  // Busca user_ids únicos
  const userIds = Array.from(new Set(bookings.map((b) => b.user_id)));

  // Busca perfis separadamente (contorna limitações de RLS em JOINs)
  const profilesRes = await supabase
    .from('profiles')
    .select('id, name, email')
    .in('id', userIds);

  // Monta mapa de perfis
  const profilesMap: Record<string, { id: string; name: string | null; email: string | null }> = {};
  if (profilesRes.data) {
    profilesRes.data.forEach((p) => {
      profilesMap[p.id] = p;
    });
  }

  // Une os dados (mantém formato esperado pelo bookingsToCSV)
  return bookings.map((booking) => ({
    ...booking,
    user: profilesMap[booking.user_id] ?? null,
  }));
}

export function bookingsToCSV(rows: any[]){
  const mapped = rows.map(r => ({
    id: r.id,
    date: r.date,
    start_time: r.start_time,
    end_time: r.end_time,
    buffer_until: r.buffer_until,
    status: r.status,
    user_name: r.user?.name ?? '',
    user_email: r.user?.email ?? '',
    created_at: r.created_at
  }));
  return toCSV(mapped);
}
