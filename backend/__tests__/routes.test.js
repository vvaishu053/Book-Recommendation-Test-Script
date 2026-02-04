describe('Route Files', () => {
  test('authRoutes should be loaded', () => {
    const authRoutes = require('../routes/authRoutes');
    expect(authRoutes).toBeDefined();
  });

  test('bookRoutes should be loaded', () => {
    const bookRoutes = require('../routes/bookRoutes');
    expect(bookRoutes).toBeDefined();
  });

  test('recommendationRoutes should be loaded', () => {
    const recommendationRoutes = require('../routes/recommendationRoutes');
    expect(recommendationRoutes).toBeDefined();
  });
});
