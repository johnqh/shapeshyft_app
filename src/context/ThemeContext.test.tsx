import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { ThemeProvider, useTheme } from "./ThemeContext";

// Mock @sudobility/components with full theme implementation
vi.mock("@sudobility/components", async () => {
  const React = await import("react");

  const Theme = {
    LIGHT: "light",
    DARK: "dark",
    SYSTEM: "system",
  };

  const FontSize = {
    SMALL: "small",
    MEDIUM: "medium",
    LARGE: "large",
  };

  interface ThemeContextType {
    theme: string;
    fontSize: string;
    setTheme: (theme: string) => void;
    setFontSize: (fontSize: string) => void;
    resolvedTheme: string;
  }

  const ThemeContext = React.createContext<ThemeContextType | undefined>(
    undefined,
  );

  const useThemeMock = () => {
    const context = React.useContext(ThemeContext);
    if (!context) {
      throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
  };

  const ThemeProviderMock = ({
    children,
    themeStorageKey = "theme",
    fontSizeStorageKey = "fontSize",
    defaultTheme = "light",
    defaultFontSize = "medium",
  }: {
    children: React.ReactNode;
    themeStorageKey?: string;
    fontSizeStorageKey?: string;
    defaultTheme?: string;
    defaultFontSize?: string;
  }) => {
    const [theme, setThemeState] = React.useState(defaultTheme);
    const [fontSize, setFontSizeState] = React.useState(defaultFontSize);

    const setTheme = (newTheme: string) => {
      setThemeState(newTheme);
      localStorage.setItem(themeStorageKey, newTheme);
    };

    const setFontSize = (newFontSize: string) => {
      setFontSizeState(newFontSize);
      localStorage.setItem(fontSizeStorageKey, newFontSize);
    };

    React.useEffect(() => {
      const root = document.documentElement;
      root.classList.remove("light", "dark");
      root.classList.add(theme === "system" ? "light" : theme);
      root.classList.remove("font-small", "font-medium", "font-large");
      root.classList.add(`font-${fontSize}`);
    }, [theme, fontSize]);

    return React.createElement(
      ThemeContext.Provider,
      {
        value: { theme, fontSize, setTheme, setFontSize, resolvedTheme: theme },
      },
      children,
    );
  };

  return {
    ThemeProvider: ThemeProviderMock,
    useTheme: useThemeMock,
    Theme,
    FontSize,
  };
});

// Test component that uses theme context
function TestComponent() {
  const { theme, fontSize, setTheme, setFontSize } = useTheme();

  return (
    <div>
      <div data-testid="theme">{theme}</div>
      <div data-testid="fontSize">{fontSize}</div>
      <button onClick={() => setTheme("dark" as typeof theme)}>Set Dark</button>
      <button onClick={() => setTheme("light" as typeof theme)}>
        Set Light
      </button>
      <button onClick={() => setFontSize("large" as typeof fontSize)}>
        Set Large Font
      </button>
      <button onClick={() => setFontSize("small" as typeof fontSize)}>
        Set Small Font
      </button>
    </div>
  );
}

describe("ThemeContext", () => {
  beforeEach(() => {
    // Reset document classes
    document.documentElement.classList.remove(
      "light",
      "dark",
      "font-small",
      "font-medium",
      "font-large",
    );
    // Clear localStorage to ensure clean state
    localStorage.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("provides default theme values", () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>,
    );

    expect(screen.getByTestId("theme")).toHaveTextContent("light");
    expect(screen.getByTestId("fontSize")).toHaveTextContent("medium");
  });

  it("allows changing theme to dark", () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>,
    );

    act(() => {
      screen.getByText("Set Dark").click();
    });

    expect(screen.getByTestId("theme")).toHaveTextContent("dark");
  });

  it("allows changing theme to light", () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>,
    );

    act(() => {
      screen.getByText("Set Dark").click();
    });

    act(() => {
      screen.getByText("Set Light").click();
    });

    expect(screen.getByTestId("theme")).toHaveTextContent("light");
  });

  it("allows changing font size", () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>,
    );

    act(() => {
      screen.getByText("Set Large Font").click();
    });

    expect(screen.getByTestId("fontSize")).toHaveTextContent("large");
  });

  it("applies theme class to document", () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>,
    );

    expect(document.documentElement.classList.contains("light")).toBe(true);

    act(() => {
      screen.getByText("Set Dark").click();
    });

    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(document.documentElement.classList.contains("light")).toBe(false);
  });

  it("applies font size class to document", async () => {
    await act(async () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>,
      );
    });

    expect(document.documentElement.classList.contains("font-medium")).toBe(
      true,
    );

    act(() => {
      screen.getByText("Set Large Font").click();
    });

    expect(document.documentElement.classList.contains("font-large")).toBe(
      true,
    );
    expect(document.documentElement.classList.contains("font-medium")).toBe(
      false,
    );
  });

  it("throws error when useTheme is used outside provider", () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow("useTheme must be used within a ThemeProvider");

    consoleSpy.mockRestore();
  });
});
