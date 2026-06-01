import {
  useNavigation,
  useRoute,
  type NavigationProp,
  type RouteProp,
} from "@react-navigation/native";
import { Keyboard } from "react-native";
import { useCallback, useEffect, useLayoutEffect, useState, type ReactElement } from "react";

import type { RootStackParamList } from "@/app/navigation/types";
import { SearchInputWithSuggestions } from "@/components/navigation/SearchInputWithSuggestions";
import { SearchContainer } from "@/containers/SearchContainer";
import type { MovieSuggestion } from "@/domain/entities/Movie";
import { useSearchSuggestions } from "@/hooks/useSearchSuggestions";

export default function SearchScreen(): ReactElement {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, "Search">>();
  const query = route.params?.query ?? "";
  const [searchDraft, setSearchDraft] = useState(query);
  const { suggestions } = useSearchSuggestions(searchDraft);

  useEffect(() => {
    setSearchDraft(query);
  }, [query]);

  const handleSubmitSearch = useCallback((): void => {
    const nextQuery = searchDraft.trim();
    if (!nextQuery || nextQuery === query) {
      return;
    }

    navigation.setParams({ query: nextQuery });
  }, [navigation, query, searchDraft]);

  const handlePressSuggestion = useCallback((suggestion: MovieSuggestion): void => {
    Keyboard.dismiss();
    navigation.navigate("Details", {
      id: suggestion.id,
      title: suggestion.title,
      mediaType: suggestion.mediaType,
      source: "catalog",
    });
  }, [navigation]);

  const handleFillSuggestion = useCallback((suggestion: MovieSuggestion): void => {
    setSearchDraft(suggestion.title);
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <SearchInputWithSuggestions
          value={searchDraft}
          suggestions={suggestions}
          onChangeText={setSearchDraft}
          onSubmit={handleSubmitSearch}
          onPressSuggestion={handlePressSuggestion}
          onFillSuggestion={handleFillSuggestion}
        />
      ),
      headerTitleAlign: "center",
      headerTitleContainerStyle: {
        left: 70,
        right: 16,
      },
    });
  }, [handleFillSuggestion, handlePressSuggestion, handleSubmitSearch, navigation, searchDraft, suggestions]);

  return <SearchContainer query={query} />;
}
