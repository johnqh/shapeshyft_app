import { useContext } from "react";
import {
  CurrentEntityContext,
  type CurrentEntityContextValue,
} from "../context/currentEntityContextDef";

export function useCurrentEntity(): CurrentEntityContextValue {
  const context = useContext(CurrentEntityContext);
  if (!context) {
    throw new Error(
      "useCurrentEntity must be used within a CurrentEntityProvider",
    );
  }
  return context;
}
