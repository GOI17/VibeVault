import type { ReactElement, ReactNode } from "react";
import { Pressable, Text, View } from "react-native";

import { useThemePreference } from "@/providers/ThemePreferenceProvider";

interface PremiumUpsellProps {
  title: string;
  description: string;
  onUpgrade: () => void;
  children?: ReactNode;
}

export function PremiumUpsell({
  title,
  description,
  onUpgrade,
  children,
}: PremiumUpsellProps): ReactElement {
  const { palette } = useThemePreference();

  return (
    <View
      style={{
        borderColor: palette.tint,
        borderWidth: 1,
        borderRadius: 12,
        padding: 14,
        gap: 10,
        backgroundColor: palette.shellSurfaceAlt,
      }}
    >
      <Text style={{ color: palette.text, fontSize: 16, fontWeight: "800" }}>
        {title}
      </Text>
      {children || (
        <Text style={{ color: palette.shellMutedText, fontSize: 14, lineHeight: 20 }}>
          {description}
        </Text>
      )}
      <Pressable
        onPress={onUpgrade}
        accessibilityRole="button"
        accessibilityLabel="Upgrade to premium"
        style={{
          backgroundColor: palette.tint,
          borderRadius: 8,
          paddingVertical: 10,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#FFFFFF", fontSize: 15, fontWeight: "800" }}>
          Upgrade to Premium
        </Text>
      </Pressable>
    </View>
  );
}
