import { describe, expect, it } from 'vitest';
import { sanitizeNextPath } from './paths';

describe('sanitizeNextPath', () => {
  it('accepts valid local absolute paths', () => {
    expect(sanitizeNextPath('/today?view=full#focus')).toBe('/today?view=full#focus');
  });

  it('rejects absolute urls', () => {
    expect(sanitizeNextPath('https://evil.example/phish')).toBe('/inbox');
  });

  it('rejects relative paths', () => {
    expect(sanitizeNextPath('today')).toBe('/inbox');
  });

  it('rejects paths containing backslashes', () => {
    expect(sanitizeNextPath('/today\\malicious')).toBe('/inbox');
  });
});
