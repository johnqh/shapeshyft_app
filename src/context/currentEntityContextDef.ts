import { createContext } from "react";

export interface CurrentEntityContextValue {
  entityId: string | null;
  setEntityId: (id: string | null) => void;
}

export const CurrentEntityContext =
  createContext<CurrentEntityContextValue | null>(null);
