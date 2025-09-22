export interface CalendarEvent {
  title: string;
  startDate: Date;
  recurring: 'daily' | 'weekly' | 'monthly' | null;
}

// This is a simplified version for demonstration.
// A real implementation would need to handle many edge cases (e.g., month ends).
export const calculateNextOccurrence = (event: CalendarEvent): Date | null => {
  if (!event.recurring) {
    return null;
  }

  const nextDate = new Date(event.startDate);

  switch (event.recurring) {
    case 'daily':
      nextDate.setDate(nextDate.getDate() + 1);
      break;
    case 'weekly':
      nextDate.setDate(nextDate.getDate() + 7);
      break;
    case 'monthly':
      const originalDate = nextDate.getDate();
      nextDate.setMonth(nextDate.getMonth() + 1);
      // If the new date's day is not the same, it means we've rolled over.
      // For example, from Jan 31 to Feb 29 (or 28).
      if (nextDate.getDate() !== originalDate) {
        // This trick sets the date to the last day of the previous month.
        nextDate.setDate(0);
      }
      break;
    default:
      return null;
  }

  return nextDate;
};
