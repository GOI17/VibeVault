import { type ReactElement } from "react";
import { useNavigation, type NavigationProp } from "@react-navigation/native";
import { ScrollView, Text, View, ActivityIndicator, Pressable } from "react-native";

import { useActivityFeed } from "@/hooks/useActivityFeed";
import type { RootStackParamList } from "@/app/navigation/types";
import { useThemePreference } from "@/providers/ThemePreferenceProvider";

export function SocialFeedContainer(): ReactElement {
  const { palette } = useThemePreference();
  const { activities, isLoading, error } = useActivityFeed();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: palette.shellBackground }}
      contentContainerStyle={{ padding: 16, gap: 16 }}
    >
      <Text style={{ color: palette.text, fontSize: 24, fontWeight: "800" }}>Activity</Text>
      <Text style={{ color: palette.shellMutedText }}>Updates from people you follow.</Text>

      {isLoading ? <ActivityIndicator color={palette.tint} /> : null}
      {error ? <Text style={{ color: "#ff6b6b" }}>{error.message}</Text> : null}

      {activities.map((activity) => (
        <View
          key={activity.id}
          style={{
            padding: 12,
            borderWidth: 1,
            borderColor: palette.shellBorder,
            borderRadius: 8,
            backgroundColor: palette.shellSurface,
          }}
        >
          <Text style={{ color: palette.text, fontWeight: "700" }}>{activity.displayName}</Text>
          <Pressable onPress={() => navigation.navigate("PublicProfile", { handle: activity.handle })} accessibilityRole="link" accessibilityLabel={`Open profile of ${activity.handle}`}>
            <Text style={{ color: palette.shellMutedText }}>@{activity.handle}</Text>
          </Pressable>
          <Text style={{ color: palette.text, marginTop: 4 }}>{activity.kind.replace("_", " ")}</Text>
          <Text style={{ color: palette.shellMutedText, fontSize: 12, marginTop: 4 }}>{activity.createdAt}</Text>
        </View>
      ))}
    </ScrollView>
  );
}
