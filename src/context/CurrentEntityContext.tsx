import { useState, useCallback, useMemo, type ReactNode } from "react";
import { CurrentEntityContext } from "./currentEntityContextDef";

export function CurrentEntityProvider({ children }: { children: ReactNode }) {
  const [entityId, setEntityIdState] = useState<string | null>(null);

  const setEntityId = useCallback((id: string | null) => {
    setEntityIdState(id);
  }, []);

  const value = useMemo(
    () => ({ entityId, setEntityId }),
    [entityId, setEntityId],
  );

  return (
    <CurrentEntityContext.Provider value={value}>
      {children}
    </CurrentEntityContext.Provider>
  );
}
