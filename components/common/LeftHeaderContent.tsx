import { type ReactElement } from "react";
import { HeaderBackButton } from "@react-navigation/elements";
import { Image } from "expo-image";
import { StyleSheet, View, type ViewStyle } from "react-native";

interface LeftHeaderContentProps {
  showBackButton: boolean;
  onBackPress: () => void;
  tintColor: string;
  showLogo?: boolean;
  backgroundColor?: string;
  compact?: boolean;
}

export function LeftHeaderContent({
  showBackButton,
  onBackPress,
  tintColor,
  showLogo = false,
  backgroundColor,
  compact = false,
}: LeftHeaderContentProps): ReactElement {
  const containerStyle: ViewStyle | undefined = backgroundColor ? { backgroundColor } : undefined;

  return (
    <View style={[styles.container, compact ? styles.compactContainer : undefined, containerStyle]}>
      {showBackButton ? (
        <HeaderBackButton tintColor={tintColor} onPress={onBackPress} accessibilityLabel="Go back" />
      ) : null}
      {showLogo ? (
        <Image
          style={styles.logo}
          source={require("@/assets/images/logo.png")}
          accessibilityLabel="VibeVault logo"
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  compactContainer: {
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  logo: {
    width: 50,
    height: 30,
    resizeMode: "contain",
  },
});
