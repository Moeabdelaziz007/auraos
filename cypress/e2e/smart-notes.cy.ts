describe('SmartNotes App', () => {
  beforeEach(() => {
    cy.visit('/mcp-tools');
  });

  it('should create, edit, and delete a note', () => {
    const initialNoteContent = 'This is a new note created during an E2E test.';
    const updatedNoteContent = 'This note has been updated.';

    // --- CREATE ---
    cy.get('textarea[data-testid="note-input"]').type(initialNoteContent);
    cy.get('button[data-testid="save-note-button"]').click();
    cy.get('[data-testid="notes-list"]').should('contain', initialNoteContent);

    // --- UPDATE ---
    cy.contains('[data-testid="note-item"]', initialNoteContent)
      .find('[data-testid="edit-button"]')
      .click();
    cy.get('textarea[data-testid="note-input"]').clear().type(updatedNoteContent);
    cy.get('button[data-testid="save-note-button"]').click();
    cy.get('[data-testid="notes-list"]').should('contain', updatedNoteContent);
    cy.get('[data-testid="notes-list"]').should('not.contain', initialNoteContent);

    // --- DELETE ---
    cy.contains('[data-testid="note-item"]', updatedNoteContent)
      .find('[data-testid="delete-button"]')
      .click();
    cy.get('[data-testid="notes-list"]').should('not.contain', updatedNoteContent);
  });

  it('should measure local save latency', () => {
    const noteContent = 'A note to measure performance.';
    const startTime = performance.now();

    cy.get('textarea[data-testid="note-input"]').type(noteContent);
    cy.get('button[data-testid="save-note-button"]').click();

    cy.get('[data-testid="notes-list"]').should('contain', noteContent).then(() => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      cy.log(`Local save action took ${duration.toFixed(2)} ms`);
      // In a real scenario, you might assert that this is below a certain threshold.
      expect(duration).to.be.lessThan(500); // Example threshold
    });
  });

  it('should handle rapid updates (last-write-wins)', () => {
    const firstContent = 'First update.';
    const finalContent = 'Final update, this should be the result.';

    // Create an initial note
    cy.get('textarea[data-testid="note-input"]').type('Initial state');
    cy.get('button[data-testid="save-note-button"]').click();
    cy.get('[data-testid="notes-list"]').should('contain', 'Initial state');

    // Simulate two quick updates without waiting for UI feedback between them
    cy.contains('[data-testid="note-item"]', 'Initial state').find('[data-testid="edit-button"]').click();
    cy.get('textarea[data-testid="note-input"]').clear().type(firstContent);
    cy.get('button[data-testid="save-note-button"]').click();

    cy.contains('[data-testid="note-item"]', firstContent).find('[data-testid="edit-button"]').click();
    cy.get('textarea[data-testid="note-input"]').clear().type(finalContent);
    cy.get('button[data-testid="save-note-button"]').click();

    // Verify that the final content is what persists
    cy.get('[data-testid="notes-list"]').should('contain', finalContent);
    cy.get('[data-testid="notes-list"]').should('not.contain', firstContent);
  });
});
