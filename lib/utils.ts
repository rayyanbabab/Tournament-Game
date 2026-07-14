import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getTournamentStatus(tournament: any, approvedCount?: number) {
  if (tournament.status === 'cancelled') return 'cancelled';

  const now = new Date();
  const start = new Date(tournament.start_date);
  const end = new Date(tournament.end_date);
  const deadline = new Date(tournament.registration_deadline);

  if (now > end) return 'completed';
  if (now >= start && now <= end) return 'ongoing';

  // Slot penuh → tutup pendaftaran
  if (approvedCount !== undefined && approvedCount >= tournament.max_teams) {
    return 'registration_closed';
  }

  if (now >= deadline && now < start) return 'registration_closed';
  return 'upcoming';
}
