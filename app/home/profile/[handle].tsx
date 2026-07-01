import { useRoute, type RouteProp } from "@react-navigation/native";
import type { ReactElement } from "react";
import { Text, View } from "react-native";

import { PublicProfileContainer } from "@/containers/PublicProfileContainer";
import { useThemePreference } from "@/providers/ThemePreferenceProvider";
import type { RootStackParamList } from "@/app/navigation/types";

export default function PublicProfileScreen(): ReactElement {
  const route = useRoute<RouteProp<RootStackParamList, "PublicProfile">>();
  const { handle } = route.params;
  const { palette } = useThemePreference();

  if (!handle) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: palette.shellBackground }}>
        <Text style={{ color: palette.text }}>No handle provided</Text>
      </View>
    );
  }

  return <PublicProfileContainer handle={handle} />;
}
