import { calculateNextOccurrence, CalendarEvent } from './event-logic';

describe('calculateNextOccurrence', () => {
  it('should return null for non-recurring events', () => {
    const event: CalendarEvent = {
      title: 'One-time event',
      startDate: new Date('2024-01-01T10:00:00Z'),
      recurring: null,
    };
    expect(calculateNextOccurrence(event)).toBeNull();
  });

  it('should calculate the next daily occurrence', () => {
    const event: CalendarEvent = {
      title: 'Daily meeting',
      startDate: new Date('2024-01-01T10:00:00Z'),
      recurring: 'daily',
    };
    const nextOccurrence = calculateNextOccurrence(event);
    expect(nextOccurrence).toEqual(new Date('2024-01-02T10:00:00Z'));
  });

  it('should calculate the next weekly occurrence', () => {
    const event: CalendarEvent = {
      title: 'Weekly sync',
      startDate: new Date('2024-01-01T10:00:00Z'),
      recurring: 'weekly',
    };
    const nextOccurrence = calculateNextOccurrence(event);
    expect(nextOccurrence).toEqual(new Date('2024-01-08T10:00:00Z'));
  });

  it('should calculate the next monthly occurrence', () => {
    const event: CalendarEvent = {
      title: 'Monthly review',
      startDate: new Date('2024-01-15T10:00:00Z'),
      recurring: 'monthly',
    };
    const nextOccurrence = calculateNextOccurrence(event);
    expect(nextOccurrence).toEqual(new Date('2024-02-15T10:00:00Z'));
  });

  // This test demonstrates a known limitation of the simple monthly logic.
  it('should handle monthly recurrence across year end', () => {
    const event: CalendarEvent = {
      title: 'End of year party',
      startDate: new Date('2023-12-15T18:00:00Z'),
      recurring: 'monthly',
    };
    const nextOccurrence = calculateNextOccurrence(event);
    expect(nextOccurrence).toEqual(new Date('2024-01-15T18:00:00Z'));
  });
});
