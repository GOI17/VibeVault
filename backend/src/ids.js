import { randomUUID } from 'node:crypto';

/**
 * Generate a new primary-key id for SQLite tables.
 * @returns {string}
 */
export function newId() {
  return randomUUID();
}
