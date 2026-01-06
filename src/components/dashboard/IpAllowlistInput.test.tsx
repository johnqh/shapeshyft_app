import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import IpAllowlistInput from "./IpAllowlistInput";

// Mock i18next
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) => {
      const translations: Record<string, string> = {
        "ipAllowlist.title": "IP Allowlist",
        "ipAllowlist.allAllowed": "All IPs allowed",
        "ipAllowlist.placeholder": "Enter IPv4 address (e.g., 192.168.1.1)",
        "ipAllowlist.add": "Add",
        "ipAllowlist.description":
          "Restrict endpoint access to specific IP addresses.",
        "ipAllowlist.invalidIp": "Invalid IPv4 address",
        "ipAllowlist.duplicateIp": "This IP is already in the list",
      };
      if (options?.ip) {
        return `Remove ${options.ip}`;
      }
      return translations[key] || key;
    },
  }),
}));

describe("IpAllowlistInput", () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it("should render with empty state", () => {
    render(<IpAllowlistInput value={[]} onChange={mockOnChange} />);

    expect(screen.getByText("IP Allowlist")).toBeInTheDocument();
    expect(screen.getByText("All IPs allowed")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Enter IPv4 address (e.g., 192.168.1.1)"),
    ).toBeInTheDocument();
  });

  it("should display existing IPs as tags", () => {
    render(
      <IpAllowlistInput
        value={["192.168.1.1", "10.0.0.1"]}
        onChange={mockOnChange}
      />,
    );

    expect(screen.getByText("192.168.1.1")).toBeInTheDocument();
    expect(screen.getByText("10.0.0.1")).toBeInTheDocument();
    expect(screen.queryByText("All IPs allowed")).not.toBeInTheDocument();
  });

  it("should add valid IP address", async () => {
    const user = userEvent.setup();
    render(<IpAllowlistInput value={[]} onChange={mockOnChange} />);

    const input = screen.getByPlaceholderText(
      "Enter IPv4 address (e.g., 192.168.1.1)",
    );
    await user.type(input, "192.168.1.1");
    await user.click(screen.getByText("Add"));

    expect(mockOnChange).toHaveBeenCalledWith(["192.168.1.1"]);
  });

  it("should add IP on Enter key press", async () => {
    const user = userEvent.setup();
    render(<IpAllowlistInput value={[]} onChange={mockOnChange} />);

    const input = screen.getByPlaceholderText(
      "Enter IPv4 address (e.g., 192.168.1.1)",
    );
    await user.type(input, "10.0.0.1{Enter}");

    expect(mockOnChange).toHaveBeenCalledWith(["10.0.0.1"]);
  });

  it("should show error for invalid IP", async () => {
    const user = userEvent.setup();
    render(<IpAllowlistInput value={[]} onChange={mockOnChange} />);

    const input = screen.getByPlaceholderText(
      "Enter IPv4 address (e.g., 192.168.1.1)",
    );
    await user.type(input, "invalid-ip");
    await user.click(screen.getByText("Add"));

    expect(screen.getByText("Invalid IPv4 address")).toBeInTheDocument();
    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it("should show error for duplicate IP", async () => {
    const user = userEvent.setup();
    render(
      <IpAllowlistInput value={["192.168.1.1"]} onChange={mockOnChange} />,
    );

    const input = screen.getByPlaceholderText(
      "Enter IPv4 address (e.g., 192.168.1.1)",
    );
    await user.type(input, "192.168.1.1");
    await user.click(screen.getByText("Add"));

    expect(
      screen.getByText("This IP is already in the list"),
    ).toBeInTheDocument();
    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it("should remove IP when clicking remove button", async () => {
    const user = userEvent.setup();
    render(
      <IpAllowlistInput
        value={["192.168.1.1", "10.0.0.1"]}
        onChange={mockOnChange}
      />,
    );

    // Find the remove button for the first IP
    const removeButtons = screen.getAllByRole("button", { name: /remove/i });
    await user.click(removeButtons[0]);

    expect(mockOnChange).toHaveBeenCalledWith(["10.0.0.1"]);
  });

  it("should clear error when typing", async () => {
    const user = userEvent.setup();
    render(<IpAllowlistInput value={[]} onChange={mockOnChange} />);

    const input = screen.getByPlaceholderText(
      "Enter IPv4 address (e.g., 192.168.1.1)",
    );

    // Type invalid IP and trigger error
    await user.type(input, "invalid");
    await user.click(screen.getByText("Add"));
    expect(screen.getByText("Invalid IPv4 address")).toBeInTheDocument();

    // Type more - error should clear
    await user.type(input, "1");
    expect(screen.queryByText("Invalid IPv4 address")).not.toBeInTheDocument();
  });

  it("should not add empty input", async () => {
    const user = userEvent.setup();
    render(<IpAllowlistInput value={[]} onChange={mockOnChange} />);

    await user.click(screen.getByText("Add"));

    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it("should disable inputs when disabled prop is true", () => {
    render(<IpAllowlistInput value={[]} onChange={mockOnChange} disabled />);

    const input = screen.getByPlaceholderText(
      "Enter IPv4 address (e.g., 192.168.1.1)",
    );
    const addButton = screen.getByText("Add");

    expect(input).toBeDisabled();
    expect(addButton).toBeDisabled();
  });

  it("should validate various valid IP formats", async () => {
    const user = userEvent.setup();
    const validIPs = ["0.0.0.0", "255.255.255.255", "127.0.0.1", "1.2.3.4"];

    for (const ip of validIPs) {
      mockOnChange.mockClear();
      const { unmount } = render(
        <IpAllowlistInput value={[]} onChange={mockOnChange} />,
      );

      const input = screen.getByPlaceholderText(
        "Enter IPv4 address (e.g., 192.168.1.1)",
      );
      await user.type(input, ip);
      await user.click(screen.getByText("Add"));

      expect(mockOnChange).toHaveBeenCalledWith([ip]);
      unmount();
    }
  });

  it("should reject invalid IP formats", async () => {
    const user = userEvent.setup();
    const invalidIPs = [
      "256.1.1.1",
      "1.2.3",
      "1.2.3.4.5",
      "abc.def.ghi.jkl",
      "192.168.1.1.",
    ];

    for (const ip of invalidIPs) {
      mockOnChange.mockClear();
      const { unmount } = render(
        <IpAllowlistInput value={[]} onChange={mockOnChange} />,
      );

      const input = screen.getByPlaceholderText(
        "Enter IPv4 address (e.g., 192.168.1.1)",
      );
      await user.type(input, ip);
      await user.click(screen.getByText("Add"));

      expect(mockOnChange).not.toHaveBeenCalled();
      expect(screen.getByText("Invalid IPv4 address")).toBeInTheDocument();
      unmount();
    }
  });
});
