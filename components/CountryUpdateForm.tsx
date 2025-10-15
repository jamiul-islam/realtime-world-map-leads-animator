'use client';

import { useState, useMemo } from 'react';
import { COUNTRY_NAMES } from '@/lib/countryNames';
import { useGlobalStore } from '@/store/globalStore';
import { CountryUpdate } from '@/types';

interface CountryUpdateFormProps {
  onSubmit: (update: CountryUpdate) => Promise<void>;
}

export default function CountryUpdateForm({ onSubmit }: CountryUpdateFormProps) {
  const { countryStates } = useGlobalStore();
  
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [mode, setMode] = useState<'increment' | 'absolute'>('increment');
  const [value, setValue] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string>('');

  // Get sorted country list
  const countryOptions = useMemo(() => {
    return Object.entries(COUNTRY_NAMES)
      .map(([code, name]) => ({ code, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  // Filter countries based on search
  const filteredCountries = useMemo(() => {
    if (!searchQuery) return countryOptions;
    const query = searchQuery.toLowerCase();
    return countryOptions.filter(
      (country) =>
        country.name.toLowerCase().includes(query) ||
        country.code.toLowerCase().includes(query)
    );
  }, [countryOptions, searchQuery]);

  // Get current country state
  const currentCountryState = selectedCountry
    ? countryStates.get(selectedCountry)
    : null;

  // Validate input
  const validateInput = (): string | null => {
    if (!selectedCountry) {
      return 'Please select a country';
    }

    const numValue = parseInt(value, 10);
    
    if (value === '' || isNaN(numValue)) {
      return 'Please enter a valid number';
    }

    if (mode === 'increment' && numValue <= 0) {
      return 'Increment value must be positive';
    }

    if (mode === 'absolute' && numValue < 0) {
      return 'Absolute value must be non-negative';
    }

    if (note.length > 500) {
      return 'Note must be 500 characters or less';
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const error = validateInput();
    if (error) {
      setValidationError(error);
      return;
    }

    setValidationError('');
    setIsSubmitting(true);

    try {
      await onSubmit({
        countryCode: selectedCountry,
        mode,
        value: parseInt(value, 10),
        note: note.trim() || undefined,
      });

      // Reset form on success
      setValue('');
      setNote('');
    } catch (error) {
      console.error('Error submitting country update:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCountrySelect = (code: string) => {
    setSelectedCountry(code);
    setSearchQuery('');
    setIsDropdownOpen(false);
    setValidationError('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Country Selector */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Select Country
        </label>
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full px-4 py-3 bg-slate-800/50 border border-cyan-500/30 rounded-xl text-left text-slate-100 hover:bg-slate-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50"
          >
            {selectedCountry
              ? `${COUNTRY_NAMES[selectedCountry]} (${selectedCountry})`
              : 'Choose a country...'}
          </button>

          {isDropdownOpen && (
            <div className="absolute z-10 w-full mt-2 bg-slate-900/95 backdrop-blur-xl border border-cyan-500/30 rounded-xl shadow-2xl shadow-cyan-500/20 max-h-64 overflow-hidden">
              <div className="p-2 border-b border-cyan-500/20">
                <input
                  type="text"
                  placeholder="Search countries..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-cyan-500/30 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  autoFocus
                />
              </div>
              <div className="overflow-y-auto max-h-48">
                {filteredCountries.map((country) => (
                  <button
                    key={country.code}
                    type="button"
                    onClick={() => handleCountrySelect(country.code)}
                    className="w-full px-4 py-2 text-left text-slate-100 hover:bg-cyan-500/10 transition-colors duration-150"
                  >
                    {country.name} ({country.code})
                  </button>
                ))}
                {filteredCountries.length === 0 && (
                  <div className="px-4 py-3 text-slate-400 text-sm">
                    No countries found
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Current Country State */}
        {currentCountryState && (
          <div className="mt-3 p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-xl">
            <p className="text-xs text-cyan-300 font-medium mb-2">Current State:</p>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-slate-300">
                Activation Count: <span className="text-cyan-400 font-semibold">{currentCountryState.activation_count}</span>
              </span>
              <span className="text-slate-300">
                Glow Band: <span className="text-purple-400 font-semibold">{currentCountryState.glow_band}</span>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Mode Toggle */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Update Mode
        </label>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => {
              setMode('increment');
              setValidationError('');
            }}
            className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
              mode === 'increment'
                ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg shadow-cyan-500/30'
                : 'bg-slate-800/50 border border-cyan-500/30 text-slate-300 hover:bg-slate-800'
            }`}
          >
            Increment
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('absolute');
              setValidationError('');
            }}
            className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
              mode === 'absolute'
                ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg shadow-cyan-500/30'
                : 'bg-slate-800/50 border border-cyan-500/30 text-slate-300 hover:bg-slate-800'
            }`}
          >
            Absolute Set
          </button>
        </div>
      </div>

      {/* Value Input */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          {mode === 'increment' ? 'Increment By' : 'Set To'}
        </label>
        <input
          type="number"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setValidationError('');
          }}
          placeholder={mode === 'increment' ? 'Enter positive number' : 'Enter non-negative number'}
          className="w-full px-4 py-3 bg-slate-800/50 border border-cyan-500/30 rounded-xl text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
          min={mode === 'increment' ? '1' : '0'}
        />
      </div>

      {/* Optional Note */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Note (Optional)
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Add a note about this update..."
          maxLength={500}
          rows={3}
          className="w-full px-4 py-3 bg-slate-800/50 border border-cyan-500/30 rounded-xl text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all resize-none"
        />
        <p className="text-xs text-slate-400 mt-1">
          {note.length}/500 characters
        </p>
      </div>

      {/* Validation Error */}
      {validationError && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
          <p className="text-sm text-red-300">{validationError}</p>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3 px-6 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 disabled:from-slate-600 disabled:to-slate-700 text-white font-semibold rounded-xl shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <svg
              className="animate-spin h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Updating...
          </span>
        ) : (
          'Update Country'
        )}
      </button>
    </form>
  );
}
