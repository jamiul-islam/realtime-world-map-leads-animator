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
            className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-left text-white hover:bg-slate-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            {selectedCountry
              ? `${COUNTRY_NAMES[selectedCountry]} (${selectedCountry})`
              : 'Choose a country...'}
          </button>

          {isDropdownOpen && (
            <div className="absolute z-10 w-full mt-2 bg-slate-800 border border-slate-600 rounded-lg shadow-xl max-h-64 overflow-hidden">
              <div className="p-2 border-b border-slate-700">
                <input
                  type="text"
                  placeholder="Search countries..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  autoFocus
                />
              </div>
              <div className="overflow-y-auto max-h-48">
                {filteredCountries.map((country) => (
                  <button
                    key={country.code}
                    type="button"
                    onClick={() => handleCountrySelect(country.code)}
                    className="w-full px-4 py-2 text-left text-white hover:bg-slate-700 transition-colors duration-150"
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
          <div className="mt-2 p-3 bg-slate-700/30 rounded-lg border border-slate-600/50">
            <p className="text-xs text-slate-400 mb-1">Current State:</p>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-white">
                Activation Count: <span className="text-cyan-400 font-semibold">{currentCountryState.activation_count}</span>
              </span>
              <span className="text-white">
                Glow Band: <span className="text-amber-400 font-semibold">{currentCountryState.glow_band}</span>
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
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              setMode('increment');
              setValidationError('');
            }}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              mode === 'increment'
                ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30'
                : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
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
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              mode === 'absolute'
                ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30'
                : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
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
          className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
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
          className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
        />
        <p className="text-xs text-slate-400 mt-1">
          {note.length}/500 characters
        </p>
      </div>

      {/* Validation Error */}
      {validationError && (
        <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
          <p className="text-sm text-red-400">{validationError}</p>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 disabled:from-slate-600 disabled:to-slate-600 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-cyan-500/30 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Updating...' : 'Update Country'}
      </button>
    </form>
  );
}
