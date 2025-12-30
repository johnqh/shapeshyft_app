import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { ThemeProvider, useTheme } from './ThemeContext';

// Mock the external dependencies
vi.mock('@sudobility/components', () => ({
  createSimpleStorage: () => {
    const store: Record<string, string> = {};
    return {
      getItem: (key: string) => store[key] ?? null,
      setItem: (key: string, value: string) => { store[key] = value; },
      removeItem: (key: string) => { delete store[key]; },
    };
  },
}));

vi.mock('@sudobility/di', () => ({
  storage: {},
}));

vi.mock('@sudobility/types', () => ({
  Theme: {
    LIGHT: 'light',
    DARK: 'dark',
    SYSTEM: 'system',
  },
  FontSize: {
    SMALL: 'small',
    MEDIUM: 'medium',
    LARGE: 'large',
  },
}));

// Test component that uses theme context
function TestComponent() {
  const { theme, fontSize, setTheme, setFontSize } = useTheme();

  return (
    <div>
      <div data-testid="theme">{theme}</div>
      <div data-testid="fontSize">{fontSize}</div>
      <button onClick={() => setTheme('dark' as typeof theme)}>Set Dark</button>
      <button onClick={() => setTheme('light' as typeof theme)}>Set Light</button>
      <button onClick={() => setFontSize('large' as typeof fontSize)}>Set Large Font</button>
      <button onClick={() => setFontSize('small' as typeof fontSize)}>Set Small Font</button>
    </div>
  );
}

describe('ThemeContext', () => {
  beforeEach(() => {
    // Reset document classes
    document.documentElement.classList.remove('light', 'dark', 'font-small', 'font-medium', 'font-large');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('provides default theme values', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId('theme')).toHaveTextContent('light');
    expect(screen.getByTestId('fontSize')).toHaveTextContent('medium');
  });

  it('allows changing theme to dark', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    act(() => {
      screen.getByText('Set Dark').click();
    });

    expect(screen.getByTestId('theme')).toHaveTextContent('dark');
  });

  it('allows changing theme to light', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    act(() => {
      screen.getByText('Set Dark').click();
    });

    act(() => {
      screen.getByText('Set Light').click();
    });

    expect(screen.getByTestId('theme')).toHaveTextContent('light');
  });

  it('allows changing font size', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    act(() => {
      screen.getByText('Set Large Font').click();
    });

    expect(screen.getByTestId('fontSize')).toHaveTextContent('large');
  });

  it('applies theme class to document', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(document.documentElement.classList.contains('light')).toBe(true);

    act(() => {
      screen.getByText('Set Dark').click();
    });

    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.documentElement.classList.contains('light')).toBe(false);
  });

  it('applies font size class to document', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(document.documentElement.classList.contains('font-medium')).toBe(true);

    act(() => {
      screen.getByText('Set Large Font').click();
    });

    expect(document.documentElement.classList.contains('font-large')).toBe(true);
    expect(document.documentElement.classList.contains('font-medium')).toBe(false);
  });

  it('throws error when useTheme is used outside provider', () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useTheme must be used within a ThemeProvider');

    consoleSpy.mockRestore();
  });
});
