import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { ReactElement } from "react";

import { LeftHeaderContent } from "@/components/common/LeftHeaderContent";
import { SearchInputWithSuggestions } from "@/components/navigation/SearchInputWithSuggestions";
import { IconSymbol } from "@/components/ui/IconSymbol";
import type { MovieSuggestion } from "@/domain/entities/Movie";
import { useThemePreference } from "@/providers/ThemePreferenceProvider";

type ThemePalette = ReturnType<typeof useThemePreference>["palette"];

interface HeaderProps {
  searchQuery: string;
  suggestions: MovieSuggestion[];
  isLoadingSuggestions?: boolean;
  suggestionsError?: Error | null;
  menuOpen: boolean;
  isCompact: boolean;
  topInset: number;
  palette: ThemePalette;
  toggleLabel: string;
  shouldShowBackButton: boolean;
  primaryNavigationLabel: string;
  onSearchQueryChange: (value: string) => void;
  onSubmitSearch: () => void;
  onPressSuggestion: (suggestion: MovieSuggestion) => void;
  onFillSuggestion: (suggestion: MovieSuggestion) => void;
  onOpenMenu: () => void;
  onCloseMenu: () => void;
  onPrimaryNavigation: () => void;
  onOpenSettings: () => void;
  onToggleTheme: () => void;
  onBackPress: () => void;
}

export default function Header({
  searchQuery,
  suggestions,
  isLoadingSuggestions,
  suggestionsError,
  menuOpen,
  isCompact,
  topInset,
  palette,
  toggleLabel,
  shouldShowBackButton,
  primaryNavigationLabel,
  onSearchQueryChange,
  onSubmitSearch,
  onPressSuggestion,
  onFillSuggestion,
  onOpenMenu,
  onCloseMenu,
  onPrimaryNavigation,
  onOpenSettings,
  onToggleTheme,
  onBackPress,
}: HeaderProps): ReactElement {
  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: palette.shellBackground,
          borderBottomColor: palette.shellBorder,
          paddingTop: topInset + (isCompact ? 6 : 8),
          paddingHorizontal: isCompact ? 12 : 16,
        },
      ]}
    >
      <View style={styles.topRow}>
        <SearchInputWithSuggestions
          value={searchQuery}
          suggestions={suggestions}
          isLoadingSuggestions={isLoadingSuggestions}
          suggestionsError={suggestionsError}
          onChangeText={onSearchQueryChange}
          onSubmit={onSubmitSearch}
          onPressSuggestion={onPressSuggestion}
          onFillSuggestion={onFillSuggestion}
          leadingAccessory={
            shouldShowBackButton ? (
              <LeftHeaderContent showBackButton onBackPress={onBackPress} tintColor={palette.shellMutedText} compact />
            ) : undefined
          }
        />

        <View style={styles.rightCluster}>
          <TouchableOpacity
            onPress={onOpenMenu}
            style={[styles.avatarButton, { backgroundColor: palette.shellSurface, borderColor: palette.shellBorder }]}
            accessibilityRole="button"
            accessibilityLabel="Open account menu"
          >
            <IconSymbol name="person.crop.circle.fill" color={palette.shellMutedText} size={26} />
          </TouchableOpacity>
        </View>
      </View>

      <Modal visible={menuOpen} transparent animationType="fade" onRequestClose={onCloseMenu}>
        <Pressable style={[styles.menuOverlay, { backgroundColor: palette.shellOverlay }]} onPress={onCloseMenu}>
          <Pressable
            style={[
              styles.menuPanel,
              {
                backgroundColor: palette.shellSurface,
                borderColor: palette.shellBorder,
                top: topInset + 56,
                right: isCompact ? 12 : 16,
              },
            ]}
            onPress={(event) => event.stopPropagation()}
            accessibilityRole="menu"
            accessibilityLabel="Account menu"
          >
            <TouchableOpacity
              style={styles.menuItem}
              onPress={onOpenSettings}
              accessibilityRole="button"
              accessibilityLabel="Settings"
            >
              <Text style={[styles.menuText, { color: palette.text }]}>Settings</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={onPrimaryNavigation}
              accessibilityRole="button"
              accessibilityLabel={primaryNavigationLabel}
            >
              <Text style={[styles.menuText, { color: palette.text }]}>{primaryNavigationLabel}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={onToggleTheme}
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
