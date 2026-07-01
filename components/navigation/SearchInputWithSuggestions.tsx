import React, { type ReactElement, type ReactNode } from "react";
import {
  ActivityIndicator,
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
  isLoadingSuggestions?: boolean;
  suggestionsError?: Error | null;
  onChangeText: (value: string) => void;
  onSubmit: () => void;
  onPressSuggestion: (suggestion: MovieSuggestion) => void;
  onFillSuggestion: (suggestion: MovieSuggestion) => void;
  onRetrySuggestions?: () => void;
  leadingAccessory?: ReactNode;
}

function formatSuggestionMetadata(suggestion: MovieSuggestion): string {
  const typeLabel = suggestion.mediaType === "series" ? "Series" : "Movie";

  return suggestion.year ? `${typeLabel} · ${suggestion.year}` : typeLabel;
}

export function SearchInputWithSuggestions({
  value,
  suggestions,
  isLoadingSuggestions = false,
  suggestionsError = null,
  onChangeText,
  onSubmit,
  onPressSuggestion,
  onFillSuggestion,
  onRetrySuggestions,
  leadingAccessory,
}: SearchInputWithSuggestionsProps): ReactElement {
  const inputRef = React.useRef<TextInput>(null);
  const blurTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const [displayValue, setDisplayValue] = React.useState(value);
  const [isFocused, setIsFocused] = React.useState(false);
  const { palette } = useThemePreference();
  const hasValue = displayValue.trim().length > 0;
  const shouldShowSuggestions = isFocused && (suggestions.length > 0 || isLoadingSuggestions || Boolean(suggestionsError));

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
          {isLoadingSuggestions ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator color={palette.tint} />
              <Text style={[styles.loadingText, { color: palette.shellMutedText }]}>Loading suggestions...</Text>
            </View>
          ) : suggestionsError ? (
            <View style={styles.errorRow}>
              <Text style={[styles.errorText, { color: palette.tint }]} numberOfLines={2}>
                Could not load suggestions.
              </Text>
              {onRetrySuggestions ? (
                <TouchableOpacity
                  onPress={onRetrySuggestions}
                  accessibilityRole="button"
                  accessibilityLabel="Retry suggestions"
                >
                  <Text style={[styles.retryText, { color: palette.text }]}>Retry</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          ) : (
            suggestions.map((suggestion) => (
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
            ))
          )}
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
    minWidth: 0,
    fontSize: 16,
    lineHeight: 20,
    padding: 0,
    margin: 0,
  },
  suggestionsPanel: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    borderWidth: 1,
    borderTopWidth: 0,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    overflow: "hidden",
    zIndex: 30,
    elevation: 5,
  },
  suggestionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  suggestionTextAction: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  suggestionTitle: {
    fontSize: 15,
    fontWeight: "600",
  },
  suggestionMetadata: {
    fontSize: 12,
  },
  fillAction: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  fillActionText: {
    fontSize: 12,
    fontWeight: "700",
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
  },
  loadingText: {
    fontSize: 14,
  },
  errorRow: {
    paddingHorizontal: 12,
    paddingVertical: 14,
    gap: 8,
    alignItems: "center",
  },
  errorText: {
    fontSize: 14,
    textAlign: "center",
  },
  retryText: {
    fontSize: 14,
    fontWeight: "700",
  },
});
