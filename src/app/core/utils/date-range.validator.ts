export function validateDateRange(
  startDate?: string,
  endDate?: string,
): { valid: boolean; message?: string } {
  if (!startDate && !endDate) return { valid: true };
  if (startDate && endDate && endDate < startDate) {
    return { valid: false, message: 'End date cannot be before start date.' };
  }
  return { valid: true };
}
