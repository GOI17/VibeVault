import { useNavigation, useRoute, type NavigationProp, type RouteProp } from "@react-navigation/native";
import { useLayoutEffect, type ReactElement } from "react";

import type { RootStackParamList } from "@/app/navigation/types";
import { SearchContainer } from "@/containers/SearchContainer";

export default function SearchScreen(): ReactElement {
  const route = useRoute<RouteProp<RootStackParamList, "Search">>();
  const navigation = useNavigation<NavigationProp<RootStackParamList, "Search">>();
  const query = route.params?.query ?? "";

  useLayoutEffect(() => {
    navigation.setOptions({ headerMode: "float" });
  }, [navigation]);

  return <SearchContainer query={query} />;
}
