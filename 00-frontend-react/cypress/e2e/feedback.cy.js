describe('Speaking feedback', () => {
  const lessonId = '123';
  const endpoint = `/api/incorrectphonemes/feedback-summary?lessonResultId=${lessonId}`;

  beforeEach(() => {
    cy.intercept('GET', '**/api/users/account', {
      body: { email: 'learner@example.com', name: 'Learner' },
    }).as('account');
    cy.intercept('GET', endpoint, { fixture: 'feedback.json' }).as('fetchFeedback');
    cy.visit(`/admin/features/feedback/${lessonId}`, {
      onBeforeLoad(win) {
        win.localStorage.setItem('access_token', 'cypress-token');
      },
    });
  });

  it('renders real session and question feedback, with no demo content', () => {
    cy.wait('@fetchFeedback');
    cy.contains('Speaking feedback').should('be.visible');
    cy.contains('Technology and Innovation').should('be.visible');
    cy.contains('Question feedback').should('be.visible');
    cy.get('article').should('have.length', 2);
    cy.contains('Cần luyện lại các âm').should('be.visible');
    cy.contains(/demo|sample data/i).should('not.exist');
    cy.contains('Speaking history').should('be.visible');
    cy.contains('Start speaking practice').should('be.visible');
  });

  it('shows a useful empty state when no detailed questions are saved', () => {
    cy.intercept('GET', endpoint, { body: { lessonInfo: null, questions: [], isDemo: false } }).as('emptyFeedback');
    cy.visit(`/admin/features/feedback/${lessonId}`);
    cy.wait('@emptyFeedback');
    cy.contains('No detailed feedback for this session').should('be.visible');
    cy.contains('Return to speaking history').should('have.attr', 'href', '/admin/features/speaking/history');
  });

  it('offers retry after an API error', () => {
    cy.intercept('GET', endpoint, { statusCode: 500, body: { message: 'Service unavailable' } }).as('failedFeedback');
    cy.visit(`/admin/features/feedback/${lessonId}`);
    cy.wait('@failedFeedback');
    cy.contains('Feedback unavailable').should('be.visible');
    cy.contains('Service unavailable').should('be.visible');
    cy.intercept('GET', endpoint, { fixture: 'feedback.json' }).as('retryFeedback');
    cy.contains('Try again').click();
    cy.wait('@retryFeedback');
    cy.contains('Question feedback').should('be.visible');
  });

  it('keeps question feedback readable on a mobile viewport', () => {
    cy.viewport(375, 812);
    cy.wait('@fetchFeedback');
    cy.get('body').should(($body) => {
      expect($body[0].scrollWidth).to.be.at.most(375);
    });
    cy.get('article').first().contains('Pronunciation points').should('be.visible');
    cy.contains('Cần luyện lại các âm').should('be.visible');
  });

  it('shows and hides the score chart', () => {
    cy.wait('@fetchFeedback');
    cy.contains('Show score chart').click();
    cy.contains('Question scores by session').should('be.visible');
    cy.contains('Hide score chart').click();
    cy.contains('Question scores by session').should('not.exist');
  });
});
