import { CountryUpdate, EnergyUpdate } from '@/types';

/**
 * Calculate the glow band for a country based on its activation count.
 * 
 * Glow bands:
 * - Band 0 (Off): activation_count = 0
 * - Band 1 (Warm): activation_count = 1-2
 * - Band 2 (Bright): activation_count = 3-5
 * - Band 3 (Radiant): activation_count >= 6
 * 
 * @param activationCount - The number of activations for a country
 * @returns The glow band (0-3)
 */
export function calculateGlowBand(activationCount: number): number {
  if (activationCount === 0) return 0;
  if (activationCount <= 2) return 1;
  if (activationCount <= 5) return 2;
  return 3; // activationCount >= 6
}

/**
 * Validate a country update request.
 * 
 * Rules:
 * - Country code must be a valid 2-letter ISO code
 * - Value must be non-negative
 * - For increment mode, value must be positive
 * 
 * @param update - The country update to validate
 * @returns Object with isValid flag and optional error message
 */
export function validateCountryUpdate(update: CountryUpdate): { 
  isValid: boolean; 
  error?: string 
} {
  // Validate country code format (2-letter ISO alpha-2)
  if (!update.countryCode || !/^[A-Z]{2}$/i.test(update.countryCode)) {
    return {
      isValid: false,
      error: 'Invalid country code. Must be a 2-letter ISO code.'
    };
  }

  // Validate value is a number
  if (typeof update.value !== 'number' || isNaN(update.value)) {
    return {
      isValid: false,
      error: 'Value must be a valid number.'
    };
  }

  // Validate non-negative for absolute mode
  if (update.mode === 'absolute' && update.value < 0) {
    return {
      isValid: false,
      error: 'Activation count cannot be negative.'
    };
  }

  // Validate positive for increment mode
  if (update.mode === 'increment' && update.value <= 0) {
    return {
      isValid: false,
      error: 'Increment value must be positive.'
    };
  }

  return { isValid: true };
}

/**
 * Validate an energy update request.
 * 
 * Rules:
 * - Value must be within 0-100 range for absolute mode
 * - Value must be positive for increment mode
 * - Cannot increment if already unlocked
 * 
 * @param update - The energy update to validate
 * @param currentPercentage - Current energy percentage
 * @param isUnlocked - Whether the locker is already unlocked
 * @returns Object with isValid flag and optional error message
 */
export function validateEnergyUpdate(
  update: EnergyUpdate,
  currentPercentage: number,
  isUnlocked: boolean
): { 
  isValid: boolean; 
  error?: string 
} {
  // Block increments if already unlocked
  if (update.mode === 'increment' && isUnlocked) {
    return {
      isValid: false,
      error: 'Cannot increment energy after unlock. The locker is already unlocked.'
    };
  }

  // Validate value is a number
  if (typeof update.value !== 'number' || isNaN(update.value)) {
    return {
      isValid: false,
      error: 'Value must be a valid number.'
    };
  }

  // Validate absolute mode range
  if (update.mode === 'absolute') {
    if (update.value < 0 || update.value > 100) {
      return {
        isValid: false,
        error: 'Energy percentage must be between 0 and 100.'
      };
    }
  }

  // Validate increment mode
  if (update.mode === 'increment') {
    if (update.value <= 0) {
      return {
        isValid: false,
        error: 'Increment value must be positive.'
      };
    }

    // Check if increment would exceed 100 (will be capped, but warn)
    const newPercentage = currentPercentage + update.value;
    if (newPercentage > 100) {
      // This is allowed but will be capped at 100
      // Not returning an error, just noting for logging
    }
  }

  return { isValid: true };
}

/**
 * Detect if the energy percentage update crosses the 100% unlock threshold.
 * 
 * @param currentPercentage - Current energy percentage
 * @param newPercentage - New energy percentage after update
 * @returns True if this update triggers the unlock
 */
export function shouldUnlock(currentPercentage: number, newPercentage: number): boolean {
  return currentPercentage < 100 && newPercentage >= 100;
}
