import React from "react";
import { useNavigation, useNavigationState, type NavigationProp } from "@react-navigation/native";
import { Keyboard, useWindowDimensions } from "react-native";
import Toast from "react-native-toast-message";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { RootStackParamList } from "@/app/navigation/types";
import Header from "@/components/Header";
import type { MovieSuggestion } from "@/domain/entities/Movie";
import { useSearchSuggestions } from "@/hooks/useSearchSuggestions";
import { useThemePreference } from "@/providers/ThemePreferenceProvider";

interface NavigationStateNode {
  index: number;
  routes: NavigationRouteNode[];
}

interface NavigationRouteNode {
  name?: string;
  params?: unknown;
  state?: unknown;
}

function getSearchQueryParam(params: unknown): string | null {
  if (typeof params !== "object" || params === null) {
    return null;
  }

  const candidate = params as { query?: unknown };
  return typeof candidate.query === "string" ? candidate.query : null;
}

function isNavigationStateNode(value: unknown): value is NavigationStateNode {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as { index?: unknown; routes?: unknown };
  return typeof candidate.index === "number" && Array.isArray(candidate.routes);
}

function getActiveRouteName(state: unknown): string | null {
  if (!isNavigationStateNode(state)) {
    return null;
  }

  const activeRoute = state.routes[state.index];
  return typeof activeRoute?.name === "string" ? activeRoute.name : null;
}

export function HeaderContainer(): React.ReactElement {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [searchQuery, setSearchQuery] = React.useState("");
  const lastSyncedSearchQueryRef = React.useRef<string | null>(null);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const { suggestions, isLoading: isLoadingSuggestions, error: suggestionsError } = useSearchSuggestions(searchQuery);
  const { theme: activeTheme, palette, toggleTheme } = useThemePreference();
  const isCompact = width < 390;
  const toggleLabel = activeTheme === "light" ? "Toggle dark mode" : "Toggle light mode";
  const activeTabRouteName = useNavigationState((state) => {
    const activeRootRoute = state.routes[state.index];
    if (activeRootRoute?.name !== "Tabs") {
      return null;
    }

    return getActiveRouteName(activeRootRoute.state);
  });
  const shouldShowBackButton = useNavigationState((state) => {
    const activeRootRoute = state.routes[state.index];
    return activeRootRoute?.name === "Search";
  });
  const activeSearchQuery = useNavigationState((state) => {
    const activeRootRoute = state.routes[state.index];
    if (activeRootRoute?.name !== "Search") {
      return null;
    }

    return getSearchQueryParam(activeRootRoute.params);
  });

  React.useEffect(() => {
    if (activeSearchQuery === null || activeSearchQuery === lastSyncedSearchQueryRef.current) {
      return;
    }

    lastSyncedSearchQueryRef.current = activeSearchQuery;
    setSearchQuery(activeSearchQuery);
  }, [activeSearchQuery]);

  const closeMenu = React.useCallback(() => {
    setMenuOpen(false);
  }, []);

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

  const goToFavorites = React.useCallback(() => {
    closeMenu();
    navigation.navigate("Tabs", { screen: "Favorites" });
  }, [closeMenu, navigation]);

  const goToSocial = React.useCallback(() => {
    closeMenu();
    navigation.navigate("Tabs", { screen: "Social" });
  }, [closeMenu, navigation]);

  const goToPublish = React.useCallback(() => {
    closeMenu();
    navigation.navigate("Tabs", { screen: "Publish" });
  }, [closeMenu, navigation]);

  const goToHome = React.useCallback(() => {
    closeMenu();
    navigation.navigate("Tabs", { screen: "Home" });
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

  const handleBackPress = React.useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    navigation.navigate("Tabs", { screen: "Home" });
  }, [navigation]);

  const isFavoritesRoute = activeTabRouteName === "Favorites";

  return (
    <Header
      searchQuery={searchQuery}
      suggestions={suggestions}
      isLoadingSuggestions={isLoadingSuggestions}
      suggestionsError={suggestionsError}
      menuOpen={menuOpen}
      isCompact={isCompact}
      topInset={insets.top}
      palette={palette}
      toggleLabel={toggleLabel}
      shouldShowBackButton={shouldShowBackButton}
      primaryNavigationLabel={isFavoritesRoute ? "Home" : "My Favorites"}
      onSearchQueryChange={setSearchQuery}
      onSubmitSearch={submitSearch}
      onPressSuggestion={openSuggestionDetails}
      onFillSuggestion={fillSuggestion}
      onOpenMenu={() => setMenuOpen(true)}
      onCloseMenu={closeMenu}
      onPrimaryNavigation={isFavoritesRoute ? goToHome : goToFavorites}
      onOpenSettings={openSettingsPlaceholder}
      onOpenSocial={goToSocial}
      onOpenPublish={goToPublish}
      onToggleTheme={handleToggleTheme}
      onBackPress={handleBackPress}
    />
  );
}
