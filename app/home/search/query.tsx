import {
  useNavigation,
  useRoute,
  type NavigationProp,
  type RouteProp,
} from "@react-navigation/native";
import { useCallback, useEffect, useLayoutEffect, useState, type ReactElement } from "react";

import type { RootStackParamList } from "@/app/navigation/types";
import { SearchHeaderInput } from "@/components/navigation/SearchHeaderInput";
import { SearchContainer } from "@/containers/SearchContainer";

export default function SearchScreen(): ReactElement {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, "Search">>();
  const query = route.params?.query ?? "";
  const [searchDraft, setSearchDraft] = useState(query);

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

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <SearchHeaderInput
          value={searchDraft}
          onChangeText={setSearchDraft}
          onSubmit={handleSubmitSearch}
        />
      ),
      headerTitleAlign: "center",
      headerTitleContainerStyle: {
        left: 70,
        right: 16,
      },
    });
  }, [handleSubmitSearch, navigation, searchDraft]);

  return <SearchContainer query={query} />;
}
