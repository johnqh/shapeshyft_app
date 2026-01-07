import {
  ToastContainer as SharedToastContainer,
  useToast,
} from "@sudobility/components/ui/toast";

/**
 * Toast container that renders toasts from context.
 * Wraps the shared ToastContainer with context consumer.
 */
function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <SharedToastContainer
      toasts={toasts}
      onDismiss={removeToast}
      position="bottom-right"
    />
  );
}

export default ToastContainer;
