import type { ReactElement, ReactNode } from "react";
import { View } from "react-native";

import { PremiumUpsell } from "./PremiumUpsell";
import { useSubscription } from "@/providers/SubscriptionProvider";

interface PremiumGateProps {
  title: string;
  description: string;
  children: ReactNode;
}

export function PremiumGate({ title, description, children }: PremiumGateProps): ReactElement {
  const { status, purchasePremium } = useSubscription();

  if (status?.tier === "premium" && status.isActive) {
    return <View>{children}</View>;
  }

  return (
    <PremiumUpsell
      title={title}
      description={description}
      onUpgrade={async () => {
        await purchasePremium();
      }}
    />
  );
}
