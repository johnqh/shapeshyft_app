import { describe, it, expect } from "vitest";
import {
  getFirebaseErrorMessage,
  getFirebaseErrorCode,
  formatFirebaseError,
} from "./auth";

describe("auth utilities", () => {
  describe("getFirebaseErrorMessage", () => {
    it("returns correct message for known error codes", () => {
      expect(getFirebaseErrorMessage("auth/user-not-found")).toBe(
        "No account found with this email",
      );
      expect(getFirebaseErrorMessage("auth/wrong-password")).toBe(
        "Incorrect password",
      );
      expect(getFirebaseErrorMessage("auth/invalid-email")).toBe(
        "Invalid email address",
      );
      expect(getFirebaseErrorMessage("auth/invalid-credential")).toBe(
        "Invalid email or password",
      );
      expect(getFirebaseErrorMessage("auth/email-already-in-use")).toBe(
        "An account with this email already exists",
      );
      expect(getFirebaseErrorMessage("auth/weak-password")).toBe(
        "Password must be at least 6 characters",
      );
      expect(getFirebaseErrorMessage("auth/too-many-requests")).toBe(
        "Too many attempts. Please try again later.",
      );
      expect(getFirebaseErrorMessage("auth/network-request-failed")).toBe(
        "Network error. Please check your connection.",
      );
      expect(getFirebaseErrorMessage("auth/popup-closed-by-user")).toBe(
        "Sign in cancelled",
      );
      expect(getFirebaseErrorMessage("auth/popup-blocked")).toBe(
        "Popup blocked. Please allow popups for this site.",
      );
      expect(
        getFirebaseErrorMessage(
          "auth/account-exists-with-different-credential",
        ),
      ).toBe(
        "An account already exists with this email using a different sign-in method.",
      );
      expect(getFirebaseErrorMessage("auth/operation-not-allowed")).toBe(
        "This sign-in method is not enabled.",
      );
    });

    it("returns fallback message for unknown error codes", () => {
      expect(getFirebaseErrorMessage("auth/unknown-error")).toBe(
        "Something went wrong. Please try again.",
      );
      expect(getFirebaseErrorMessage("")).toBe(
        "Something went wrong. Please try again.",
      );
      expect(getFirebaseErrorMessage("random-code")).toBe(
        "Something went wrong. Please try again.",
      );
    });
  });

  describe("getFirebaseErrorCode", () => {
    it("extracts error code from Firebase error object", () => {
      const error = { code: "auth/user-not-found", message: "User not found" };
      expect(getFirebaseErrorCode(error)).toBe("auth/user-not-found");
    });

    it("returns empty string for non-object errors", () => {
      expect(getFirebaseErrorCode(null)).toBe("");
      expect(getFirebaseErrorCode(undefined)).toBe("");
      expect(getFirebaseErrorCode("string error")).toBe("");
      expect(getFirebaseErrorCode(123)).toBe("");
    });

    it("returns empty string for objects without code property", () => {
      expect(getFirebaseErrorCode({})).toBe("");
      expect(getFirebaseErrorCode({ message: "error" })).toBe("");
    });
  });

  describe("formatFirebaseError", () => {
    it("formats Firebase error objects to user-friendly messages", () => {
      const error = { code: "auth/user-not-found" };
      expect(formatFirebaseError(error)).toBe(
        "No account found with this email",
      );
    });

    it("returns fallback for errors without code", () => {
      expect(formatFirebaseError({})).toBe(
        "Something went wrong. Please try again.",
      );
      expect(formatFirebaseError(null)).toBe(
        "Something went wrong. Please try again.",
      );
    });

    it("returns fallback for unknown error codes", () => {
      const error = { code: "auth/unknown" };
      expect(formatFirebaseError(error)).toBe(
        "Something went wrong. Please try again.",
      );
    });
  });
});
