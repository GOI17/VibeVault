import { type ReactElement } from "react";
import {
  ScrollView,
  Text,
  View,
  Pressable,
  ActivityIndicator,
} from "react-native";

import { usePublicProfile } from "@/hooks/usePublicProfile";
import { useSocialFollow } from "@/hooks/useSocialFollow";
import { useThemePreference } from "@/providers/ThemePreferenceProvider";

interface PublicProfileContainerProps {
  handle: string;
}

export function PublicProfileContainer({ handle }: PublicProfileContainerProps): ReactElement {
  const { palette } = useThemePreference();
  const { profile, isLoading: profileLoading, error: profileError } = usePublicProfile(handle);
  const { followers, following, isLoading: followLoading, follow, unfollow } = useSocialFollow(handle);

  if (profileLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: palette.shellBackground }}>
        <ActivityIndicator color={palette.tint} />
      </View>
    );
  }

  if (profileError || !profile) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: palette.shellBackground, padding: 24 }}>
        <Text style={{ color: "#ff6b6b", textAlign: "center" }}>{profileError?.message || "Profile not found"}</Text>
      </View>
    );
  }

  // Use the activity feed / follows endpoint doesn't give that. We'll add a 'meFollows' derived from followers list includes current user?

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: palette.shellBackground }}
      contentContainerStyle={{ padding: 16, gap: 16 }}
    >
      <View style={{ gap: 4 }}>
        <Text style={{ color: palette.text, fontSize: 24, fontWeight: "800" }}>{profile.displayName}</Text>
        <Text style={{ color: palette.shellMutedText }}>@{profile.handle}</Text>
        {profile.bio ? <Text style={{ color: palette.text, marginTop: 8 }}>{profile.bio}</Text> : null}
      </View>

      <View style={{ flexDirection: "row", gap: 12 }}>
        <Pressable
          onPress={() => void follow()}
          disabled={followLoading}
          style={{ backgroundColor: palette.shellChipActive, borderRadius: 8, paddingVertical: 8, paddingHorizontal: 16 }}
        >
          <Text style={{ color: palette.shellChipTextActive, fontWeight: "700" }}>Follow</Text>
        </Pressable>
        <Pressable
          onPress={() => void unfollow()}
          disabled={followLoading}
          style={{ borderWidth: 1, borderColor: palette.shellBorder, borderRadius: 8, paddingVertical: 8, paddingHorizontal: 16 }}
        >
          <Text style={{ color: palette.text }}>Unfollow</Text>
        </Pressable>
      </View>

      <View style={{ flexDirection: "row", gap: 16 }}>
        <Text style={{ color: palette.text }}>Followers: {followers.length}</Text>
        <Text style={{ color: palette.text }}>Following: {following.length}</Text>
      </View>
    </ScrollView>
  );
}
