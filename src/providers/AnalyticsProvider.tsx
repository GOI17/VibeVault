import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  type ReactElement,
  type ReactNode,
} from "react";

import type { AnalyticsEventKind } from "@/domain/entities/Analytics";
import type { IAnalyticsRepository } from "@/domain/repositories/IAnalyticsRepository";

interface AnalyticsContextType {
  track: (kind: AnalyticsEventKind, payload?: Record<string, unknown>) => Promise<void>;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

interface AnalyticsProviderProps {
  repository: IAnalyticsRepository;
  children: ReactNode;
}

export function AnalyticsProvider({
  repository,
  children,
}: AnalyticsProviderProps): ReactElement {
  const track = useCallback(
    async (kind: AnalyticsEventKind, payload?: Record<string, unknown>) => {
      await repository.trackKind(kind, payload);
    },
    [repository]
  );

  useEffect(() => {
    void track("app_open");

    const now = new Date();
    const handleReturn = async (): Promise<void> => {
      const firstOpen = await repository.getStore().then((s) => s.firstOpenAt);
      if (!firstOpen) return;

      const firstOpenDate = new Date(firstOpen);
      const daysSince = Math.floor(
        (now.getTime() - firstOpenDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysSince >= 7) {
        await track("return_after_7_days");
      }
      if (daysSince >= 30) {
        await track("return_after_30_days");
      }
    };

    void handleReturn();
  }, [repository, track]);

  return (
    <AnalyticsContext.Provider value={{ track }}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics(): AnalyticsContextType {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    throw new Error("useAnalytics must be used within an AnalyticsProvider");
  }
  return context;
}
