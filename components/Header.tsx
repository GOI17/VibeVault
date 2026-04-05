import React from "react";
import { useNavigation, type NavigationProp } from "@react-navigation/native";
import {
  StyleSheet,
  TouchableOpacity,
  View,
  TextInput,
  useWindowDimensions,
  Keyboard,
} from "react-native";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { RootStackParamList } from "@/app/navigation/types";

export default function Header(): React.ReactElement {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const palette = Colors.light;
  const inputRef = React.useRef<TextInput>(null);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const isCompact = width < 390;

  const submitSearch = React.useCallback(() => {
    const query = searchQuery.trim();
    if (!query) return;
    Keyboard.dismiss();
    setSearchOpen(false);
    navigation.navigate("Search", { query });
  }, [navigation, searchQuery]);

  React.useEffect(() => {
    if (searchOpen) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [searchOpen]);

  const renderSearchBar = () => (
    <View
      style={[
        styles.searchBar,
        {
          backgroundColor: palette.shellSurface,
          borderColor: palette.shellBorder,
        },
      ]}
    >
      <IconSymbol name="magnifyingglass" color={palette.shellMutedText} size={16} />
      <TextInput
        ref={inputRef}
        style={[styles.searchInput, { color: palette.text }]}
        placeholder="Search titles"
        placeholderTextColor={palette.shellMutedText}
        value={searchQuery}
        onChangeText={setSearchQuery}
        returnKeyType="search"
        onSubmitEditing={submitSearch}
      />
      <TouchableOpacity
        onPress={submitSearch}
        style={[styles.searchAction, { backgroundColor: palette.shellChipActive }]}
      >
        <IconSymbol name="arrow.up.right" color="#FFFFFF" size={14} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: palette.shellBackground,
          borderBottomColor: palette.shellBorder,
          paddingTop: insets.top + (isCompact ? 6 : 8),
          paddingHorizontal: isCompact ? 12 : 16,
        },
      ]}
    >
      <View style={styles.topRow}>
        <TouchableOpacity
          onPress={() => setSearchOpen((prev) => !prev)}
          style={styles.iconButton}
          accessibilityRole="button"
          accessibilityLabel="Open search"
        >
          <IconSymbol name="magnifyingglass" color={palette.shellMutedText} size={18} />
        </TouchableOpacity>

        <View style={styles.rightCluster}>
          <TouchableOpacity
            onPress={() => navigation.navigate("Tabs", { screen: "Favorites" })}
            style={[styles.avatarButton, { backgroundColor: palette.shellSurface, borderColor: palette.shellBorder }]}
            accessibilityRole="button"
            accessibilityLabel="Go to favorites"
          >
            <IconSymbol name="person.crop.circle.fill" color={palette.shellMutedText} size={26} />
          </TouchableOpacity>
        </View>
      </View>

      {searchOpen && renderSearchBar()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    gap: 12,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  rightCluster: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconButton: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  searchBar: {
    minHeight: 44,
    flex: 1,
    minWidth: 0,
    borderWidth: 1,
    borderRadius: 18,
    paddingLeft: 10,
    paddingRight: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  searchAction: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 0,
    minWidth: 0,
  },
  avatarButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  chipsContainer: {},
});
