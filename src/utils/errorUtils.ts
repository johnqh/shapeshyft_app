/**
 * Error detection utilities for handling different types of API errors.
 */

/**
 * Checks if an error indicates a server-down scenario (network errors or 5xx status codes).
 *
 * @param error - The error to check (can be Error, string, or object with status)
 * @returns true if the error indicates the server is down or unreachable
 */
export function isServerError(error: unknown): boolean {
  if (!error) return false;

  // Check for Error with network-related message
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    if (
      message.includes("network") ||
      message.includes("fetch") ||
      message.includes("failed to fetch") ||
      message.includes("connection") ||
      message.includes("timeout") ||
      message.includes("net::err")
    ) {
      return true;
    }
  }

  // Check for string error messages
  if (typeof error === "string") {
    const message = error.toLowerCase();
    if (
      message.includes("network") ||
      message.includes("fetch") ||
      message.includes("failed to fetch") ||
      message.includes("connection") ||
      message.includes("timeout") ||
      message.includes("server error") ||
      message.includes("500") ||
      message.includes("502") ||
      message.includes("503") ||
      message.includes("504")
    ) {
      return true;
    }
  }

  // Check for object with status code
  if (typeof error === "object" && error !== null && "status" in error) {
    const status = (error as { status: number }).status;
    if (typeof status === "number" && status >= 500 && status < 600) {
      return true;
    }
  }

  return false;
}

/**
 * Checks if an error indicates a rate limit (429) response.
 *
 * @param error - The error message or object to check
 * @returns true if the error indicates a rate limit was exceeded
 */
export function isRateLimitError(error: unknown): boolean {
  if (!error) return false;

  // Check string error messages
  if (typeof error === "string") {
    const message = error.toLowerCase();
    return (
      message.includes("429") ||
      message.includes("rate limit") ||
      message.includes("too many requests") ||
      message.includes("rate_limit")
    );
  }

  // Check Error objects
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes("429") ||
      message.includes("rate limit") ||
      message.includes("too many requests") ||
      message.includes("rate_limit")
    );
  }

  // Check for object with status code
  if (typeof error === "object" && error !== null && "status" in error) {
    const status = (error as { status: number }).status;
    return status === 429;
  }

  return false;
}
