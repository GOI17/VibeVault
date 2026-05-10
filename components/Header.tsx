import React from "react";
import { useNavigation, type NavigationProp } from "@react-navigation/native";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
  Keyboard,
} from "react-native";
import Toast from "react-native-toast-message";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { SearchInputWithSuggestions } from "@/components/navigation/SearchInputWithSuggestions";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { RootStackParamList } from "@/app/navigation/types";
import type { MovieSuggestion } from "@/domain/entities/Movie";
import { useSearchSuggestions } from "@/hooks/useSearchSuggestions";
import { useThemePreference } from "@/providers/ThemePreferenceProvider";

export default function Header(): React.ReactElement {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [menuOpen, setMenuOpen] = React.useState(false);
  const { suggestions } = useSearchSuggestions(searchQuery);
  const { theme: activeTheme, palette, toggleTheme } = useThemePreference();
  const isCompact = width < 390;
  const toggleLabel = activeTheme === "light" ? "Toggle dark mode" : "Toggle light mode";

  const submitSearch = React.useCallback(() => {
    const query = searchQuery.trim();
    if (!query) return;
    Keyboard.dismiss();
    navigation.navigate("Search", { query });
  }, [navigation, searchQuery]);

  const openSuggestionDetails = React.useCallback((suggestion: MovieSuggestion) => {
    Keyboard.dismiss();
    navigation.navigate("Details", {
      id: suggestion.id,
      title: suggestion.title,
      mediaType: suggestion.mediaType,
      source: "catalog",
    });
  }, [navigation]);

  const fillSuggestion = React.useCallback((suggestion: MovieSuggestion) => {
    setSearchQuery(suggestion.title);
  }, []);

  const openMenu = React.useCallback(() => {
    setMenuOpen(true);
  }, []);

  const closeMenu = React.useCallback(() => {
    setMenuOpen(false);
  }, []);

  const goToFavorites = React.useCallback(() => {
    closeMenu();
    navigation.navigate("Tabs", { screen: "Favorites" });
  }, [closeMenu, navigation]);

  const openSettingsPlaceholder = React.useCallback(() => {
    Toast.show({
      type: "info",
      text1: "Settings",
      text2: "Settings panel coming soon",
      visibilityTime: 1800,
    });
    closeMenu();
  }, [closeMenu]);

  const handleToggleTheme = React.useCallback(() => {
    toggleTheme();
    closeMenu();
  }, [closeMenu, toggleTheme]);

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
        <SearchInputWithSuggestions
          value={searchQuery}
          suggestions={suggestions}
          onChangeText={setSearchQuery}
          onSubmit={submitSearch}
          onPressSuggestion={openSuggestionDetails}
          onFillSuggestion={fillSuggestion}
        />

        <View style={styles.rightCluster}>
          <TouchableOpacity
            onPress={openMenu}
            style={[styles.avatarButton, { backgroundColor: palette.shellSurface, borderColor: palette.shellBorder }]}
            accessibilityRole="button"
            accessibilityLabel="Open account menu"
          >
            <IconSymbol name="person.crop.circle.fill" color={palette.shellMutedText} size={26} />
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        visible={menuOpen}
        transparent
        animationType="fade"
        onRequestClose={closeMenu}
      >
        <Pressable style={[styles.menuOverlay, { backgroundColor: palette.shellOverlay }]} onPress={closeMenu}>
          <Pressable
            style={[
              styles.menuPanel,
              {
                backgroundColor: palette.shellSurface,
                borderColor: palette.shellBorder,
                top: insets.top + 56,
                right: isCompact ? 12 : 16,
              },
            ]}
            onPress={(event) => event.stopPropagation()}
            accessibilityRole="menu"
            accessibilityLabel="Account menu"
          >
            <TouchableOpacity
              style={styles.menuItem}
              onPress={openSettingsPlaceholder}
              accessibilityRole="button"
              accessibilityLabel="Settings"
            >
              <Text style={[styles.menuText, { color: palette.text }]}>Settings</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={goToFavorites}
              accessibilityRole="button"
              accessibilityLabel="My Favorites"
            >
              <Text style={[styles.menuText, { color: palette.text }]}>My Favorites</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleToggleTheme}
              accessibilityRole="button"
              accessibilityLabel={toggleLabel}
            >
              <Text style={[styles.menuText, { color: palette.text }]}>{toggleLabel}</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
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
  avatarButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.22)",
  },
  menuPanel: {
    position: "absolute",
    minWidth: 220,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 6,
  },
  menuItem: {
    minHeight: 40,
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  menuText: {
    fontSize: 14,
    fontWeight: "500",
  },
});
