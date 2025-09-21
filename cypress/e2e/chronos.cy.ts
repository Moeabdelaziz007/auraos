describe('Chronos App', () => {
  beforeEach(() => {
    // Visit the calendar page
    cy.visit('/chronos'); // Assuming the calendar is at this route
  });

  it('should create a calendar event from a mocked travel API response', () => {
    // Mock the API endpoint for travel bookings
    cy.intercept('GET', '/api/travel/bookings', {
      statusCode: 200,
      body: [
        {
          type: 'flight',
          departure: 'LAX',
          destination: 'JFK',
          departureTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
          arrivalTime: new Date(Date.now() + 28 * 60 * 60 * 1000).toISOString(),
        },
      ],
    }).as('getTravelBookings');

    // Assuming there is a button to import travel plans
    cy.get('[data-testid="import-travel-button"]').click();

    // Wait for the API call to be made
    cy.wait('@getTravelBookings');

    // Verify that a new event appears in the calendar view
    // This assumes the event title is created from the booking data.
    cy.get('[data-testid="calendar-view"]').should('contain', 'Flight to JFK');
  });
});
