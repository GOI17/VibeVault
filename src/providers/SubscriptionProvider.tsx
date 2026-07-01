import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";

import type { SubscriptionStatus } from "@/domain/entities/Subscription";
import { useRepositories } from "./RepositoryProvider";

interface SubscriptionContextType {
  status: SubscriptionStatus | null;
  isLoading: boolean;
  refresh: () => Promise<void>;
  purchasePremium: () => Promise<SubscriptionStatus>;
  restorePurchases: () => Promise<SubscriptionStatus | null>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(
  undefined
);

interface SubscriptionProviderProps {
  children: ReactNode;
}

export function SubscriptionProvider({
  children,
}: SubscriptionProviderProps): ReactElement {
  const { subscriptionRepository } = useRepositories();
  const [status, setStatus] = useState<SubscriptionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    const next = await subscriptionRepository.refreshStatus();
    setStatus(next);
  }, [subscriptionRepository]);

  const purchasePremium = useCallback(async () => {
    const next = await subscriptionRepository.purchasePremium();
    setStatus(next);
    return next;
  }, [subscriptionRepository]);

  const restorePurchases = useCallback(async () => {
    const next = await subscriptionRepository.restorePurchases();
    setStatus(next);
    return next;
  }, [subscriptionRepository]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const next = await subscriptionRepository.getStatus();
      if (!cancelled) {
        setStatus(next);
        setIsLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [subscriptionRepository]);

  return (
    <SubscriptionContext.Provider
      value={{ status, isLoading, refresh, purchasePremium, restorePurchases }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription(): SubscriptionContextType {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error("useSubscription must be used within a SubscriptionProvider");
  }
  return context;
}
