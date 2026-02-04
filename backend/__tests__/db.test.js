const { db, dbRun, dbGet, dbAll } = require('../config/db');

describe('Database Configuration', () => {
  test('should export db instance', () => {
    expect(db).toBeDefined();
  });

  test('should export dbRun function', () => {
    expect(typeof dbRun).toBe('function');
  });

  test('should export dbGet function', () => {
    expect(typeof dbGet).toBe('function');
  });

  test('should export dbAll function', () => {
    expect(typeof dbAll).toBe('function');
  });
});
