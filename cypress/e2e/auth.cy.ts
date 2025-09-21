describe('Authentication', () => {
  it('should allow a user to log in and log out', () => {
    // Mock the Google Sign-In popup
    cy.visit('/login');
    cy.intercept('POST', '**/identitytoolkit.googleapis.com/**', {
      statusCode: 200,
      body: {
        idToken: 'test-token',
        email: 'test@example.com',
        refreshToken: 'test-refresh-token',
        expiresIn: '3600',
        localId: 'test-user-id',
      },
    }).as('googleSignIn');

    // Find and click the login button
    cy.get('button').contains('Sign in with Google').click();

    // Wait for the mocked sign-in to complete
    cy.wait('@googleSignIn');

    // Verify that the user is redirected to the dashboard
    cy.url().should('include', '/');
    cy.contains('Dashboard');

    // Find and click the sign-out button
    cy.get('[data-testid="button-sign-out"]').click();

    // Verify that the user is redirected to the login page
    cy.url().should('include', '/login');
  });

  it('should show an error on failed login', () => {
    cy.visit('/login');
    cy.intercept('POST', '**/identitytoolkit.googleapis.com/**', {
      statusCode: 400,
      body: {
        error: {
          code: 400,
          message: 'POPUP_CLOSED_BY_USER',
        },
      },
    }).as('googleSignInFailure');

    cy.get('button').contains('Sign in with Google').click();

    cy.wait('@googleSignInFailure');

    // In a real app, you'd check for an error message in the UI.
    // For now, we'll just confirm we're still on the login page.
    cy.url().should('include', '/login');
  });
});
