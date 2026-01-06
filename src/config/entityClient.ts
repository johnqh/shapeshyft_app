/**
 * @fileoverview Singleton EntityClient
 * @description Provides a singleton instance of EntityClient for the app
 */

import { EntityClient } from "@sudobility/entity_client";
import { auth } from "./firebase";
import { CONSTANTS } from "./constants";

/**
 * Get the current user's Firebase ID token.
 * Returns null if not authenticated.
 */
async function getAuthToken(): Promise<string | null> {
  const currentUser = auth?.currentUser;
  if (!currentUser) {
    return null;
  }
  try {
    return await currentUser.getIdToken();
  } catch {
    return null;
  }
}

/**
 * Singleton EntityClient instance.
 * Uses the app's API URL and Firebase auth for authentication.
 */
export const entityClient = new EntityClient({
  baseUrl: `${CONSTANTS.API_URL}/api/v1`,
  getAuthToken,
});
