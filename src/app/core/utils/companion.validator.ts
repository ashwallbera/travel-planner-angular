import type { CompanionBreakdown } from '../models';

export interface CompanionValidation {
  valid: boolean;
  message?: string;
}

export function validateCompanions(
  companions: CompanionBreakdown,
  travelerCount: number,
): CompanionValidation {
  const sum = companions.adults + companions.seniors + companions.children;
  if (sum > travelerCount) {
    return {
      valid: false,
      message: `Companion breakdown (${sum}) cannot exceed total travelers (${travelerCount}).`,
    };
  }
  if (companions.adults < 1) {
    return { valid: false, message: 'At least one adult is required (including yourself).' };
  }
  return { valid: true };
}
