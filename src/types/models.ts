export type Role = 'admin' | 'user';

export type BookingStatus = 'active' | 'canceled';

export type Booking = {
  id: string;
  userId: string;
  date: string;
  startTime: string;
  endTime: string;
  bufferUntil: string;
  status: BookingStatus;
  createdAt: string;
  roomId?: string;
  kind?: string;
  cancelReason?: string | null;
};

export type Block = { date: string; start?: string; finish?: string; reason?: string };

export type Settings = {
  id: 'global';
  openTime: string;
  closeTime: string;
  cancelPolicyHours: number;
};
