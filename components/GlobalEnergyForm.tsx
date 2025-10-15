'use client';

import { useState } from 'react';
import { useGlobalStore } from '@/store/globalStore';
import { EnergyUpdate } from '@/types';

interface GlobalEnergyFormProps {
  onSubmit: (update: EnergyUpdate) => Promise<void>;
}

export default function GlobalEnergyForm({ onSubmit }: GlobalEnergyFormProps) {
  const { lockerState } = useGlobalStore();
  
  const [mode, setMode] = useState<'increment' | 'absolute'>('increment');
  const [incrementValue, setIncrementValue] = useState<string>('');
  const [absoluteValue, setAbsoluteValue] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string>('');

  const currentPercentage = lockerState?.energy_percentage ?? 0;
  const isUnlocked = lockerState?.is_unlocked ?? false;

  // Preset increment options
  const presetIncrements = [
    { label: '+1%', value: 1 },
    { label: '+2%', value: 2 },
    { label: '+5%', value: 5 },
    { label: '+10%', value: 10 },
  ];

  // Validate input
  const validateInput = (): string | null => {
    if (mode === 'increment') {
      // Check if unlocked
      if (isUnlocked) {
        return 'Unlock complete - no further increments allowed';
      }

      const numValue = parseInt(incrementValue, 10);
      
      if (incrementValue === '' || isNaN(numValue)) {
        return 'Please select or enter an increment value';
      }

      if (numValue <= 0) {
        return 'Increment value must be positive';
      }

      // Check if increment would exceed 100 (will be capped)
      if (currentPercentage + numValue > 100) {
        // This is allowed, but will be capped at 100
        return null;
      }
    } else {
      // Absolute mode
      const numValue = parseInt(absoluteValue, 10);
      
      if (absoluteValue === '' || isNaN(numValue)) {
        return 'Please enter an absolute value';
      }

      if (numValue < 0) {
        return 'Absolute value must be non-negative';
      }

      if (numValue > 100) {
        return 'Absolute value cannot exceed 100';
      }
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
      const value = mode === 'increment' 
        ? parseInt(incrementValue, 10)
        : parseInt(absoluteValue, 10);

      await onSubmit({
        mode,
        value,
        note: note.trim() || undefined,
      });

      // Reset form on success
      setIncrementValue('');
      setAbsoluteValue('');
      setNote('');
    } catch (error) {
      console.error('Error submitting energy update:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePresetClick = (value: number) => {
    setIncrementValue(value.toString());
    setMode('increment');
    setValidationError('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Current Energy Display */}
      <div className="p-6 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 rounded-xl">
        <p className="text-xs text-cyan-300 font-medium mb-2">Current Global Energy</p>
        <div className="flex items-baseline gap-2">
          <span className="text-5xl font-bold bg-gradient-to-r from-cyan-300 via-purple-300 to-cyan-400 bg-clip-text text-transparent">
            {currentPercentage}%
          </span>
          {isUnlocked && (
            <span className="text-2xl text-amber-400">🔓</span>
          )}
        </div>
        {isUnlocked && (
          <p className="text-xs text-amber-400 mt-2 font-medium">
            Unlock Complete
          </p>
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
            disabled={isUnlocked}
            className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
              mode === 'increment'
                ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg shadow-cyan-500/30'
                : 'bg-slate-800/50 border border-cyan-500/30 text-slate-300 hover:bg-slate-800'
            } ${isUnlocked ? 'opacity-50 cursor-not-allowed' : ''}`}
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

      {/* Increment Mode */}
      {mode === 'increment' && (
        <>
          {/* Preset Increments */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Preset Increments
            </label>
            <div className="grid grid-cols-4 gap-2">
              {presetIncrements.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => handlePresetClick(preset.value)}
                  disabled={isUnlocked}
                  className={`px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    incrementValue === preset.value.toString()
                      ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg shadow-cyan-500/30'
                      : 'bg-slate-800/50 border border-cyan-500/30 text-cyan-300 hover:bg-slate-800'
                  } ${isUnlocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Increment Input */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Or Enter Custom Increment
            </label>
            <input
              type="number"
              value={incrementValue}
              onChange={(e) => {
                setIncrementValue(e.target.value);
                setValidationError('');
              }}
              placeholder="Enter percentage to add"
              disabled={isUnlocked}
              className="w-full px-4 py-3 bg-slate-800/50 border border-cyan-500/30 rounded-xl text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              min="1"
            />
            {currentPercentage + parseInt(incrementValue || '0', 10) > 100 && incrementValue && (
              <p className="text-xs text-amber-400 mt-2">
                Note: Value will be capped at 100%
              </p>
            )}
          </div>
        </>
      )}

      {/* Absolute Mode */}
      {mode === 'absolute' && (
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Set Energy Percentage
          </label>
          <input
            type="number"
            value={absoluteValue}
            onChange={(e) => {
              setAbsoluteValue(e.target.value);
              setValidationError('');
            }}
            placeholder="Enter value (0-100)"
            className="w-full px-4 py-3 bg-slate-800/50 border border-cyan-500/30 rounded-xl text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
            min="0"
            max="100"
          />
        </div>
      )}

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

      {/* Unlock Blocking Message */}
      {isUnlocked && mode === 'increment' && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
          <p className="text-sm text-amber-300 font-medium">
            Unlock complete - no further increments allowed
          </p>
          <p className="text-xs text-amber-400 mt-1">
            Switch to Absolute Set mode if you need to adjust the value
          </p>
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
          'Update Global Energy'
        )}
      </button>
    </form>
  );
}
