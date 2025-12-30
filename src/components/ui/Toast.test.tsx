import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, fireEvent } from '@testing-library/react';
import Toast from './Toast';
import type { Toast as ToastType } from '../../context/toastContextDef';

describe('Toast', () => {
  const mockOnDismiss = vi.fn();

  beforeEach(() => {
    vi.useFakeTimers();
    mockOnDismiss.mockClear();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  const createToast = (type: ToastType['type'], message: string): ToastType => ({
    id: 'test-id',
    type,
    message,
    duration: 5000,
  });

  const renderAndWaitForAnimation = (toast: ToastType) => {
    render(<Toast toast={toast} onDismiss={mockOnDismiss} />);
    // Advance past the 10ms animation trigger delay
    act(() => {
      vi.advanceTimersByTime(20);
    });
  };

  it('renders success toast with correct message', () => {
    const toast = createToast('success', 'Operation successful');
    renderAndWaitForAnimation(toast);

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Operation successful')).toBeInTheDocument();
  });

  it('renders error toast', () => {
    const toast = createToast('error', 'Something went wrong');
    renderAndWaitForAnimation(toast);

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('renders warning toast', () => {
    const toast = createToast('warning', 'Please check your input');
    renderAndWaitForAnimation(toast);

    expect(screen.getByText('Please check your input')).toBeInTheDocument();
  });

  it('renders info toast', () => {
    const toast = createToast('info', 'Here is some information');
    renderAndWaitForAnimation(toast);

    expect(screen.getByText('Here is some information')).toBeInTheDocument();
  });

  it('has dismiss button with aria-label', () => {
    const toast = createToast('success', 'Test message');
    renderAndWaitForAnimation(toast);

    expect(screen.getByRole('button', { name: 'Dismiss' })).toBeInTheDocument();
  });

  it('calls onDismiss when dismiss button is clicked', () => {
    const toast = createToast('success', 'Test message');
    renderAndWaitForAnimation(toast);

    // Click the dismiss button
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }));

    // Wait for the animation delay (200ms)
    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(mockOnDismiss).toHaveBeenCalledWith('test-id');
  });

  it('applies success styling', () => {
    const toast = createToast('success', 'Success');
    renderAndWaitForAnimation(toast);

    const alert = screen.getByRole('alert');
    expect(alert.className).toContain('bg-green');
  });

  it('applies error styling', () => {
    const toast = createToast('error', 'Error');
    renderAndWaitForAnimation(toast);

    const alert = screen.getByRole('alert');
    expect(alert.className).toContain('bg-red');
  });

  it('applies warning styling', () => {
    const toast = createToast('warning', 'Warning');
    renderAndWaitForAnimation(toast);

    const alert = screen.getByRole('alert');
    expect(alert.className).toContain('bg-yellow');
  });

  it('applies info styling', () => {
    const toast = createToast('info', 'Info');
    renderAndWaitForAnimation(toast);

    const alert = screen.getByRole('alert');
    expect(alert.className).toContain('bg-blue');
  });
});
