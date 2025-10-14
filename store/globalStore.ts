import { create } from 'zustand';
import { LockerState, CountryState } from '@/types';
import { supabase } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface ToastMessage {
  type: 'success' | 'error' | 'info';
  message: string;
  id: string;
}

interface UIState {
  isLoading: boolean;
  error: string | null;
  toast: ToastMessage | null;
  hoveredCountry: string | null;
}

interface GlobalStore {
  // Locker state
  lockerState: LockerState | null;
  
  // Country states (Map for efficient lookups)
  countryStates: Map<string, CountryState>;
  
  // UI state
  ui: UIState;
  
  // Realtime connection state
  realtimeChannels: RealtimeChannel[];
  isRealtimeConnected: boolean;
  pollingInterval: NodeJS.Timeout | null;
  
  // Actions
  setLockerState: (state: LockerState) => void;
  updateCountryState: (countryCode: string, state: CountryState) => void;
  setCountryStates: (states: CountryState[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  showToast: (message: Omit<ToastMessage, 'id'>) => void;
  dismissToast: () => void;
  setHoveredCountry: (countryCode: string | null) => void;
  
  // Data fetching and subscriptions
  fetchInitialData: () => Promise<void>;
  subscribeToRealtime: () => void;
  unsubscribeFromRealtime: () => void;
  startPolling: () => void;
  stopPolling: () => void;
}

export const useGlobalStore = create<GlobalStore>((set, get) => ({
  // Initial state
  lockerState: null,
  countryStates: new Map(),
  ui: {
    isLoading: false,
    error: null,
    toast: null,
    hoveredCountry: null,
  },
  realtimeChannels: [],
  isRealtimeConnected: false,
  pollingInterval: null,
  
  // Actions
  setLockerState: (state) => set({ lockerState: state }),
  
  updateCountryState: (countryCode, state) =>
    set((prev) => {
      const newMap = new Map(prev.countryStates);
      newMap.set(countryCode, state);
      return { countryStates: newMap };
    }),
  
  setCountryStates: (states) =>
    set({
      countryStates: new Map(states.map((state) => [state.country_code, state])),
    }),
  
  setLoading: (loading) =>
    set((prev) => ({
      ui: { ...prev.ui, isLoading: loading },
    })),
  
  setError: (error) =>
    set((prev) => ({
      ui: { ...prev.ui, error },
    })),
  
  showToast: (message) =>
    set((prev) => ({
      ui: {
        ...prev.ui,
        toast: {
          ...message,
          id: `toast-${Date.now()}-${Math.random()}`,
        },
      },
    })),
  
  dismissToast: () =>
    set((prev) => ({
      ui: { ...prev.ui, toast: null },
    })),
  
  setHoveredCountry: (countryCode) =>
    set((prev) => ({
      ui: { ...prev.ui, hoveredCountry: countryCode },
    })),
  
  // Fetch initial data from Supabase
  fetchInitialData: async () => {
    const { setLoading, setError, setLockerState, setCountryStates } = get();
    
    try {
      setLoading(true);
      setError(null);
      
      // Fetch locker state
      const { data: lockerData, error: lockerError } = await supabase
        .from('locker_state')
        .select('*')
        .single();
      
      if (lockerError) throw lockerError;
      if (lockerData) setLockerState(lockerData);
      
      // Fetch all country states
      const { data: countryData, error: countryError } = await supabase
        .from('country_states')
        .select('*')
        .order('country_code');
      
      if (countryError) throw countryError;
      if (countryData) setCountryStates(countryData);
      
    } catch (error) {
      console.error('Error fetching initial data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  },
  
  // Subscribe to Realtime changes
  subscribeToRealtime: () => {
    const { setLockerState, updateCountryState, startPolling } = get();
    
    // Subscribe to locker_state changes
    const lockerChannel = supabase
      .channel('locker_state_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'locker_state',
        },
        (payload) => {
          if (payload.new) {
            setLockerState(payload.new as LockerState);
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          set({ isRealtimeConnected: true });
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          set({ isRealtimeConnected: false });
          // Start polling fallback if Realtime fails
          startPolling();
        }
      });
    
    // Subscribe to country_states changes
    const countryChannel = supabase
      .channel('country_states_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'country_states',
        },
        (payload) => {
          if (payload.new) {
            const countryState = payload.new as CountryState;
            updateCountryState(countryState.country_code, countryState);
          }
        }
      )
      .subscribe();
    
    set({ realtimeChannels: [lockerChannel, countryChannel] });
    
    // Set up connection health check (10s heartbeat timeout)
    const healthCheckInterval = setInterval(() => {
      const state = get();
      if (!state.isRealtimeConnected) {
        startPolling();
      }
    }, 10000);
    
    // Store interval for cleanup
    set({ pollingInterval: healthCheckInterval as any });
  },
  
  // Unsubscribe from Realtime
  unsubscribeFromRealtime: () => {
    const { realtimeChannels, pollingInterval } = get();
    
    realtimeChannels.forEach((channel) => {
      supabase.removeChannel(channel);
    });
    
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }
    
    set({ 
      realtimeChannels: [], 
      isRealtimeConnected: false,
      pollingInterval: null 
    });
  },
  
  // Start polling fallback (60s interval)
  startPolling: () => {
    const { pollingInterval, fetchInitialData } = get();
    
    // Don't start if already polling
    if (pollingInterval) return;
    
    const interval = setInterval(() => {
      fetchInitialData();
    }, 60000); // 60 seconds
    
    set({ pollingInterval: interval as any });
  },
  
  // Stop polling
  stopPolling: () => {
    const { pollingInterval } = get();
    
    if (pollingInterval) {
      clearInterval(pollingInterval);
      set({ pollingInterval: null });
    }
  },
}));
