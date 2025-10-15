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
  
  // Actions
  setLockerState: (state) => set({ lockerState: state }),
  
  updateCountryState: (countryCode, state) =>
    set((prev) => {
      const newMap = new Map(prev.countryStates);
      newMap.set(countryCode, state);
      return { countryStates: newMap };
    }),
  
  setCountryStates: (states) => {
    // Memoize: only update if states have actually changed
    const currentStates = get().countryStates;
    const newMap = new Map(states.map((state) => [state.country_code, state]));
    
    // Check if any values have changed
    let hasChanged = currentStates.size !== newMap.size;
    if (!hasChanged) {
      for (const [code, state] of newMap) {
        const currentState = currentStates.get(code);
        if (!currentState || 
            currentState.activation_count !== state.activation_count ||
            currentState.glow_band !== state.glow_band ||
            currentState.last_updated !== state.last_updated) {
          hasChanged = true;
          break;
        }
      }
    }
    
    // Only update if changed
    if (hasChanged) {
      set({ countryStates: newMap });
    }
  },
  
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
    const { setLockerState, updateCountryState } = get();
    
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
  },
  
  // Unsubscribe from Realtime
  unsubscribeFromRealtime: () => {
    const { realtimeChannels } = get();
    
    realtimeChannels.forEach((channel) => {
      supabase.removeChannel(channel);
    });
    
    set({ 
      realtimeChannels: [], 
      isRealtimeConnected: false
    });
  },
}));
