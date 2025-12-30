import { describe, it, expect } from 'vitest';
import { SUPPORTED_LANGUAGES, isLanguageSupported, CONSTANTS } from './constants';

describe('constants', () => {
  describe('SUPPORTED_LANGUAGES', () => {
    it('contains expected languages', () => {
      expect(SUPPORTED_LANGUAGES).toContain('en');
      expect(SUPPORTED_LANGUAGES).toContain('es');
      expect(SUPPORTED_LANGUAGES).toContain('fr');
      expect(SUPPORTED_LANGUAGES).toContain('de');
      expect(SUPPORTED_LANGUAGES).toContain('ja');
      expect(SUPPORTED_LANGUAGES).toContain('ko');
      expect(SUPPORTED_LANGUAGES).toContain('zh');
      expect(SUPPORTED_LANGUAGES).toContain('zh-hant');
    });

    it('has exactly 16 supported languages', () => {
      expect(SUPPORTED_LANGUAGES).toHaveLength(16);
    });
  });

  describe('isLanguageSupported', () => {
    it('returns true for all supported languages', () => {
      for (const lang of SUPPORTED_LANGUAGES) {
        expect(isLanguageSupported(lang)).toBe(true);
      }
    });

    it('returns false for unsupported languages', () => {
      expect(isLanguageSupported('invalid')).toBe(false);
      expect(isLanguageSupported('xx')).toBe(false);
      expect(isLanguageSupported('EN')).toBe(false); // case sensitive
      expect(isLanguageSupported('')).toBe(false);
      expect(isLanguageSupported('english')).toBe(false);
    });

    it('is case sensitive', () => {
      expect(isLanguageSupported('en')).toBe(true);
      expect(isLanguageSupported('EN')).toBe(false);
      expect(isLanguageSupported('En')).toBe(false);
    });
  });

  describe('CONSTANTS', () => {
    it('has required navigation items', () => {
      expect(CONSTANTS.NAV_ITEMS).toBeDefined();
      expect(CONSTANTS.NAV_ITEMS.length).toBeGreaterThan(0);

      const labels = CONSTANTS.NAV_ITEMS.map(item => item.label);
      expect(labels).toContain('home');
      expect(labels).toContain('dashboard');
    });

    it('has company info', () => {
      expect(CONSTANTS.COMPANY_NAME).toBe('Sudobility');
      expect(CONSTANTS.APP_NAME).toBeDefined();
    });
  });
});
