import { Database } from './database.types';

// Extract database table types
export type LockerState = Database['public']['Tables']['locker_state']['Row'];
export type CountryState = Database['public']['Tables']['country_states']['Row'];
export type AuditLogEntry = Database['public']['Tables']['audit_log']['Row'];
export type Payment = Database['public']['Tables']['payments']['Row'];

// Request interfaces for admin operations
export interface CountryUpdate {
  countryCode: string;
  mode: 'increment' | 'absolute';
  value: number;
  note?: string;
}

export interface EnergyUpdate {
  mode: 'increment' | 'absolute';
  value: number;
  note?: string;
}

// Re-export database types
export type { Database } from './database.types';
