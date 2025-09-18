import { create } from 'zustand';
import { supabase } from '~/lib/supabase';
import type { Settings, Block } from '~/types/models';

interface S {
  settings: Settings | null;
  blocks: (Block & {id?: string})[];
  load: () => Promise<void>;
  save: (s: Partial<Settings>) => Promise<void>;
  addBlock: (b: Block) => Promise<void>;
  removeBlock: (id: string) => Promise<void>;
}

export const useSettings = create<S>((set, get) => ({
  settings: null,
  blocks: [],
  load: async () => {
    const s = await supabase.from('settings').select('*').eq('id','global').maybeSingle();
    const b = await supabase.from('blocks').select('*').order('date',{ascending:true});
    const settings = s.data ? {
      id: 'global',
      openTime: s.data.open_time,
      closeTime: s.data.close_time,
      cancelPolicyHours: s.data.cancel_policy_hours
    } as Settings : null;
    set({ settings, blocks: (b.data ?? []).map(x => ({ id: x.id, date: x.date, start: x.start, finish: x.finish, reason: x.reason })) });
  },
  save: async (s) => {
    const { error } = await supabase.from('settings').upsert({
      id: 'global',
      ...(s.openTime && { open_time: s.openTime }),
      ...(s.closeTime && { close_time: s.closeTime }),
      ...(typeof s.cancelPolicyHours === 'number' && { cancel_policy_hours: s.cancelPolicyHours })
    });
    if (error) throw error;
    await get().load();
  },
  addBlock: async (b) => {
    const { error } = await supabase.from('blocks').insert({
      date: b.date, start: b.start, finish: b.finish, reason: b.reason
    });
    if (error) throw error;
    await get().load();
  },
  removeBlock: async (id) => {
    const { error } = await supabase.from('blocks').delete().eq('id', id);
    if (error) throw error;
    await get().load();
  }
}));
