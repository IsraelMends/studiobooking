import { useState, useEffect } from 'react';
import { Alert } from 'react-native';

import { useSettings } from '~/store/settings';
import { useAuth } from '~/store/auth';
import { fetchDayBookings } from '~/services/bookings';
import { buildAvailableSlots } from '~/utils/dates';
import { 
  toLocalDateString, 
  isPastDate, 
  isToday, 
  nowHHMM, 
  hhmmToMin, 
  toHHMM 
} from '~/utils/schedule';

export const useScheduleData = () => {
  const { settings, blocks, load } = useSettings();
  const { profile } = useAuth();

  const today = toLocalDateString();
  const [date, setDate] = useState<string>(today);
  const [available, setAvailable] = useState<string[]>([]);
  const [dayBookings, setDayBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    load().finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    const loadData = async () => {
      if (!settings || isPastDate(date)) {
        setAvailable([]);
        setDayBookings([]);
        return;
      }
      if (!profile?.organization_id) {
        setAvailable([]);
        setDayBookings([]);
        return;
      }

      setIsLoading(true);
      try {
        const raw = await fetchDayBookings(date, profile.organization_id);
        const b = (raw ?? []).filter((x: any) => x?.start_time && x?.end_time);

        setDayBookings(b);

        const mapped = b.map((x: any) => ({
          id: x.id,
          userId: x.user_id,
          date: x.date,
          startTime: toHHMM(x.start_time),
          endTime: toHHMM(x.end_time),
          bufferUntil: x.buffer_until ? toHHMM(x.buffer_until) : undefined,
          status: x.status,
          createdAt: x.created_at,
        }));

        let av = buildAvailableSlots(
          date,
          settings.openTime,
          settings.closeTime,
          mapped as any,
          blocks as any
        ) as string[];

        const occupied = mapped.filter((m: any) =>
  ['active', 'confirmed'].includes(m.status)
);

av = av.filter(slot =>
  !occupied.some(o => slot >= o.startTime && slot < o.endTime)
);

        if (isToday(date)) {
          const nowM = hhmmToMin(nowHHMM());
          av = av.filter((t) => hhmmToMin(t) >= nowM);
        }

        setAvailable(av);
      } catch (error) {
        console.error('Erro ao carregar dados do dia:', error);
        Alert.alert('Erro', 'Falha ao carregar horários. Tente novamente.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [date, settings, blocks, profile?.organization_id]);

  return {
    date,
    setDate,
    available,
    setAvailable,
    dayBookings,
    setDayBookings,
    isLoading,
    today,
    profile,
  };
};