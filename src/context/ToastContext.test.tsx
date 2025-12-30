import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { ToastProvider } from './ToastContext';
import { useToast } from '../hooks/useToast';

// Test component that uses toast context
function TestComponent() {
  const { toasts, success, error, warning, info, removeToast } = useToast();

  return (
    <div>
      <div data-testid="toast-count">{toasts.length}</div>
      <ul data-testid="toast-list">
        {toasts.map(toast => (
          <li key={toast.id} data-testid={`toast-${toast.type}`}>
            {toast.message}
            <button onClick={() => removeToast(toast.id)}>Remove</button>
          </li>
        ))}
      </ul>
      <button onClick={() => success('Success message')}>Add Success</button>
      <button onClick={() => error('Error message')}>Add Error</button>
      <button onClick={() => warning('Warning message')}>Add Warning</button>
      <button onClick={() => info('Info message')}>Add Info</button>
      <button onClick={() => success('Persistent', 0)}>Add Persistent</button>
    </div>
  );
}

describe('ToastContext', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('provides toast context to children', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    expect(screen.getByTestId('toast-count')).toHaveTextContent('0');
  });

  it('adds success toast', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    act(() => {
      screen.getByText('Add Success').click();
    });

    expect(screen.getByTestId('toast-count')).toHaveTextContent('1');
    expect(screen.getByTestId('toast-success')).toHaveTextContent('Success message');
  });

  it('adds error toast', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    act(() => {
      screen.getByText('Add Error').click();
    });

    expect(screen.getByTestId('toast-error')).toHaveTextContent('Error message');
  });

  it('adds warning toast', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    act(() => {
      screen.getByText('Add Warning').click();
    });

    expect(screen.getByTestId('toast-warning')).toHaveTextContent('Warning message');
  });

  it('adds info toast', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    act(() => {
      screen.getByText('Add Info').click();
    });

    expect(screen.getByTestId('toast-info')).toHaveTextContent('Info message');
  });

  it('removes toast manually', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    act(() => {
      screen.getByText('Add Success').click();
    });

    expect(screen.getByTestId('toast-count')).toHaveTextContent('1');

    act(() => {
      screen.getByText('Remove').click();
    });

    expect(screen.getByTestId('toast-count')).toHaveTextContent('0');
  });

  it('auto-removes toast after duration', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    act(() => {
      screen.getByText('Add Success').click();
    });

    expect(screen.getByTestId('toast-count')).toHaveTextContent('1');

    // Default duration is 5000ms
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(screen.getByTestId('toast-count')).toHaveTextContent('0');
  });

  it('does not auto-remove persistent toast (duration = 0)', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    act(() => {
      screen.getByText('Add Persistent').click();
    });

    expect(screen.getByTestId('toast-count')).toHaveTextContent('1');

    act(() => {
      vi.advanceTimersByTime(10000);
    });

    // Should still be there
    expect(screen.getByTestId('toast-count')).toHaveTextContent('1');
  });

  it('supports multiple toasts', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    act(() => {
      screen.getByText('Add Success').click();
      screen.getByText('Add Error').click();
      screen.getByText('Add Warning').click();
    });

    expect(screen.getByTestId('toast-count')).toHaveTextContent('3');
  });
});
