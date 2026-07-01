import { type ReactElement, useState, useCallback } from "react";
import {
  ScrollView,
  Text,
  View,
  Pressable,
  TextInput,
  ActivityIndicator,
  Switch,
} from "react-native";

import { usePublishing } from "@/providers/PublishingProvider";
import { usePublishedLists } from "@/hooks/usePublishedLists";
import { usePublishedRewind } from "@/hooks/usePublishedRewind";
import { useThemePreference } from "@/providers/ThemePreferenceProvider";

export function PublishContainer(): ReactElement {
  const { palette } = useThemePreference();
  const { profile, isAuthenticated, isLoading: profileLoading, error: profileError, updateProfile } = usePublishing();
  const { lists, isLoading: listsLoading, createList, deleteList } = usePublishedLists();
  const { rewind, isLoading: rewindLoading, publish: publishRewind } = usePublishedRewind(new Date().getFullYear());

  const [bio, setBio] = useState(profile?.bio ?? "");
  const [isPublic, setIsPublic] = useState(profile?.isPublic ?? true);
  const [listTitle, setListTitle] = useState("");
  const [listSlug, setListSlug] = useState("");

  const handleSaveProfile = useCallback(async () => {
    await updateProfile({ bio, isPublic });
  }, [updateProfile, bio, isPublic]);

  const handleCreateList = useCallback(async () => {
    if (!listTitle.trim() || !listSlug.trim()) return;
    await createList({
      slug: listSlug.trim(),
      title: listTitle.trim(),
      isPublic: true,
    });
    setListTitle("");
    setListSlug("");
  }, [createList, listTitle, listSlug]);

  const handlePublishRewind = useCallback(async () => {
    await publishRewind({
      moviesWatched: 0,
      episodesWatched: 0,
      seriesCount: 0,
    });
  }, [publishRewind]);

  if (profileLoading || profile === null) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: palette.shellBackground }}>
        <ActivityIndicator color={palette.tint} />
        <Text style={{ color: palette.text, marginTop: 12 }}>Connecting to VibeVault…</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: palette.shellBackground, padding: 24 }}>
        <Text style={{ color: palette.text, fontSize: 18, fontWeight: "700" }}>Publish your profile</Text>
        <Text style={{ color: palette.shellMutedText, marginTop: 8, textAlign: "center" }}>
          Sign in with Google to create a public profile, lists, and published rewinds.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: palette.shellBackground }}
      contentContainerStyle={{ padding: 16, gap: 24 }}
    >
      {profileError ? (
        <Text style={{ color: "#ff6b6b" }}>{profileError.message}</Text>
      ) : null}

      <View style={{ gap: 8 }}>
        <Text style={{ color: palette.text, fontSize: 20, fontWeight: "800" }}>Profile</Text>
        <Text style={{ color: palette.shellMutedText }}>@{profile.handle}</Text>
        <TextInput
          value={bio}
          onChangeText={setBio}
          placeholder="Short bio"
          placeholderTextColor={palette.shellMutedText}
          multiline
          maxLength={500}
          style={{
            color: palette.text,
            borderWidth: 1,
            borderColor: palette.shellBorder,
            borderRadius: 8,
            padding: 12,
            minHeight: 80,
          }}
        />
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Switch value={isPublic} onValueChange={setIsPublic} />
          <Text style={{ color: palette.text }}>Public profile</Text>
        </View>
        <Pressable
          onPress={() => void handleSaveProfile()}
          style={{ backgroundColor: palette.shellChipActive, borderRadius: 8, padding: 12 }}
        >
          <Text style={{ color: palette.shellChipTextActive, fontWeight: "700", textAlign: "center" }}>Save profile</Text>
        </Pressable>
      </View>

      <View style={{ gap: 8 }}>
        <Text style={{ color: palette.text, fontSize: 20, fontWeight: "800" }}>Lists</Text>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <TextInput
            value={listSlug}
            onChangeText={setListSlug}
            placeholder="slug"
            placeholderTextColor={palette.shellMutedText}
            autoCapitalize="none"
            style={{
              flex: 1,
              color: palette.text,
              borderWidth: 1,
              borderColor: palette.shellBorder,
              borderRadius: 8,
              padding: 12,
            }}
          />
          <TextInput
            value={listTitle}
            onChangeText={setListTitle}
            placeholder="Title"
            placeholderTextColor={palette.shellMutedText}
            style={{
              flex: 2,
              color: palette.text,
              borderWidth: 1,
              borderColor: palette.shellBorder,
              borderRadius: 8,
              padding: 12,
            }}
          />
        </View>
        <Pressable
          onPress={() => void handleCreateList()}
          style={{ backgroundColor: palette.shellChipActive, borderRadius: 8, padding: 12 }}
        >
          <Text style={{ color: palette.shellChipTextActive, fontWeight: "700", textAlign: "center" }}>Create public list</Text>
        </Pressable>

        {listsLoading ? (
          <ActivityIndicator color={palette.tint} />
        ) : (
          lists.map((list) => (
            <View
              key={list.id}
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                padding: 12,
                borderWidth: 1,
                borderColor: palette.shellBorder,
                borderRadius: 8,
              }}
            >
              <View>
                <Text style={{ color: palette.text, fontWeight: "700" }}>{list.title}</Text>
                <Text style={{ color: palette.shellMutedText }}>@{profile.handle}/{list.slug}</Text>
              </View>
              <Pressable onPress={() => void deleteList(list.id)}>
                <Text style={{ color: "#ff6b6b" }}>Delete</Text>
              </Pressable>
            </View>
          ))
        )}
      </View>

      <View style={{ gap: 8 }}>
        <Text style={{ color: palette.text, fontSize: 20, fontWeight: "800" }}>Rewind</Text>
        <Pressable
          onPress={() => void handlePublishRewind()}
          style={{ backgroundColor: palette.shellChipActive, borderRadius: 8, padding: 12 }}
        >
          <Text style={{ color: palette.shellChipTextActive, fontWeight: "700", textAlign: "center" }}>Publish {new Date().getFullYear()} rewind</Text>
        </Pressable>
        {rewind && !rewindLoading ? (
          <Text style={{ color: palette.shellMutedText }}>
            Published {rewind.moviesWatched} movies, {rewind.episodesWatched} episodes.
          </Text>
        ) : null}
      </View>
    </ScrollView>
  );
}
