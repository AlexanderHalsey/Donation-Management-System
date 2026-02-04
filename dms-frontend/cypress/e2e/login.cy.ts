describe('Login', () => {
  const errorMessage = '.q-field--error .q-field__bottom .q-field__messages'
  it('should require authentication', () => {
    cy.visit('/login')
    cy.get('button[type="submit"]').should('be.visible').click()
    cy.get(errorMessage)
      .should('have.length', 2)
      .each((el) => {
        cy.wrap(el).should('have.text', 'Obligatoire')
      })
  })
  it('should give error if username password incorrect', () => {
    cy.visit('/login')
    cy.get('input[name="username"]').type('wronguser')
    cy.get('input[name="password"]').type('wrongpassword')
    cy.mockLogin(true)
    cy.get('button[type="submit"]').should('be.visible').click()
    cy.get(errorMessage)
      .should('have.length', 2)
      .each((el) => {
        cy.wrap(el).should('have.text', 'Nom d’utilisateur ou mot de passe incorrect')
      })
  })
  it('should login successfully with correct credentials', () => {
    cy.visit('/login')
    cy.get('input[name="username"]').type('correctuser')
    cy.get('input[name="password"]').type('correctpassword')
    cy.mockLogin()
    cy.get('button[type="submit"]').should('be.visible').click()
    cy.location('pathname').should('include', '/dashboard')
  })
})
