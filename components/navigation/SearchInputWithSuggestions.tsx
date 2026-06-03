import React, { type ReactElement, type ReactNode } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { IconSymbol } from "@/components/ui/IconSymbol";
import type { MovieSuggestion } from "@/domain/entities/Movie";
import { useThemePreference } from "@/providers/ThemePreferenceProvider";

interface SearchInputWithSuggestionsProps {
  value: string;
  suggestions: MovieSuggestion[];
  onChangeText: (value: string) => void;
  onSubmit: () => void;
  onPressSuggestion: (suggestion: MovieSuggestion) => void;
  onFillSuggestion: (suggestion: MovieSuggestion) => void;
  leadingAccessory?: ReactNode;
}

function formatSuggestionMetadata(suggestion: MovieSuggestion): string {
  const typeLabel = suggestion.mediaType === "series" ? "Series" : "Movie";

  return suggestion.year ? `${typeLabel} · ${suggestion.year}` : typeLabel;
}

export function SearchInputWithSuggestions({
  value,
  suggestions,
  onChangeText,
  onSubmit,
  onPressSuggestion,
  onFillSuggestion,
  leadingAccessory,
}: SearchInputWithSuggestionsProps): ReactElement {
  const inputRef = React.useRef<TextInput>(null);
  const blurTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const [displayValue, setDisplayValue] = React.useState(value);
  const [isFocused, setIsFocused] = React.useState(false);
  const { palette } = useThemePreference();
  const hasValue = displayValue.trim().length > 0;
  const shouldShowSuggestions = isFocused && suggestions.length > 0;

  React.useEffect(() => {
    setDisplayValue(value);
  }, [value]);

  React.useEffect(() => {
    return () => {
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
      }
    };
  }, []);

  const hideSuggestions = React.useCallback((): void => {
    setIsFocused(false);
  }, []);

  const clearSearch = React.useCallback((): void => {
    setDisplayValue("");
    onChangeText("");
    requestAnimationFrame(() => inputRef.current?.focus());
  }, [onChangeText]);

  const handleChangeText = React.useCallback(
    (nextValue: string): void => {
      setDisplayValue(nextValue);
      onChangeText(nextValue);
    },
    [onChangeText]
  );

  const handleFocus = React.useCallback((): void => {
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
      blurTimeoutRef.current = null;
    }

    setIsFocused(true);
  }, []);

  const handleBlur = React.useCallback((): void => {
    blurTimeoutRef.current = setTimeout(hideSuggestions, 120);
  }, [hideSuggestions]);

  const handleSubmit = React.useCallback((): void => {
    hideSuggestions();
    onSubmit();
  }, [hideSuggestions, onSubmit]);

  const handlePressSuggestion = React.useCallback(
    (suggestion: MovieSuggestion): void => {
      hideSuggestions();
      onPressSuggestion(suggestion);
    },
    [hideSuggestions, onPressSuggestion]
  );

  const handleFillSuggestion = React.useCallback(
    (suggestion: MovieSuggestion): void => {
      hideSuggestions();
      onFillSuggestion(suggestion);
    },
    [hideSuggestions, onFillSuggestion]
  );

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.searchBar,
          shouldShowSuggestions ? styles.searchBarWithSuggestions : undefined,
          {
            backgroundColor: palette.shellSurface,
            borderColor: palette.shellBorder,
          },
        ]}
      >
        {leadingAccessory ?? (
          <TouchableOpacity
            onPress={hasValue ? clearSearch : undefined}
            style={styles.leadingAction}
            accessibilityRole={hasValue ? "button" : undefined}
            accessibilityLabel={hasValue ? "Clear search" : "Search"}
            hitSlop={8}
            disabled={!hasValue}
          >
            <IconSymbol
              name={hasValue ? "xmark.circle.fill" : "magnifyingglass"}
              color={palette.shellMutedText}
              size={16}
            />
          </TouchableOpacity>
        )}
        <TextInput
          ref={inputRef}
          style={[styles.searchInput, { color: palette.text }]}
          placeholder="Search titles"
          placeholderTextColor={palette.shellMutedText}
          value={displayValue}
          onChangeText={handleChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          onSubmitEditing={handleSubmit}
        />
        <TouchableOpacity
          onPress={handleSubmit}
          style={[styles.searchAction, { backgroundColor: palette.shellChipActive }]}
          accessibilityRole="button"
          accessibilityLabel="Submit search"
        >
          <IconSymbol name="arrow.up.right" color={palette.shellChipTextActive} size={14} />
        </TouchableOpacity>
      </View>

      {shouldShowSuggestions && (
        <View
          style={[
            styles.suggestionsPanel,
            {
              backgroundColor: palette.shellSurface,
              borderColor: palette.shellBorder,
            },
          ]}
        >
          {suggestions.map((suggestion) => (
            <View key={suggestion.id} style={[styles.suggestionRow, { borderBottomColor: palette.shellBorder }]}>
              <TouchableOpacity
                style={styles.suggestionTextAction}
                onPress={() => handlePressSuggestion(suggestion)}
                accessibilityRole="button"
                accessibilityLabel={`Open details for ${suggestion.title}`}
              >
                <Text style={[styles.suggestionTitle, { color: palette.text }]} numberOfLines={1}>
                  {suggestion.title}
                </Text>
                <Text style={[styles.suggestionMetadata, { color: palette.shellMutedText }]} numberOfLines={1}>
                  {formatSuggestionMetadata(suggestion)}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.fillAction, { borderColor: palette.shellBorder }]}
                onPress={() => handleFillSuggestion(suggestion)}
                accessibilityRole="button"
                accessibilityLabel={`Fill search with ${suggestion.title}`}
                hitSlop={8}
              >
                <Text style={[styles.fillActionText, { color: palette.shellMutedText }]}>Fill</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minWidth: 0,
    position: "relative",
    width: "100%",
    zIndex: 20,
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
  searchBarWithSuggestions: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  searchAction: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  leadingAction: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 0,
    minWidth: 0,
  },
  suggestionsPanel: {
    position: "absolute",
    top: 44,
    left: 0,
    right: 0,
    borderWidth: 1,
    borderTopWidth: 0,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.16,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
    zIndex: 30,
  },
  suggestionRow: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingLeft: 14,
    paddingRight: 8,
    gap: 10,
  },
  suggestionTextAction: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 9,
  },
  suggestionTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
  suggestionMetadata: {
    fontSize: 12,
    marginTop: 2,
  },
  fillAction: {
    minWidth: 48,
    minHeight: 34,
    borderWidth: 1,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  fillActionText: {
    fontSize: 12,
    fontWeight: "700",
  },
});
