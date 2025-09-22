import { supabase } from '~/lib/supabase';

export async function fetchDayBookings(dateISO: string){
  const { data, error } = await supabase.from('bookings')
    .select('*')
    .eq('date', dateISO)
    .eq('status','active')
    .order('start_time', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function createBooking(userId: string, dateISO: string, startHHmm: string, selectedDevices: string[]){
  const { data, error } = await supabase.rpc('create_booking', {
    p_user_id: userId,
    p_date: dateISO,
    p_start: startHHmm + ':00'
  });
  if (error) throw error;
  return data;
}

export async function cancelBooking(bookingId: string, role: 'admin' | 'user', startsAtISO: string, cancelPolicyHours: number){
  if (role === 'user') {
    const start = new Date(startsAtISO);
    const now = new Date();
    const diffHours = (start.getTime() - now.getTime())/36e5;
    if (diffHours < cancelPolicyHours) {
      throw new Error('POLICY');
    }
  }
  const { error } = await supabase.from('bookings').update({ status: 'canceled' }).eq('id', bookingId);
  if (error) throw error;
}
