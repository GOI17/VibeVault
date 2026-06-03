import { useRoute, type RouteProp } from "@react-navigation/native";
import { type ReactElement } from "react";

import type { RootStackParamList } from "@/app/navigation/types";
import { SearchContainer } from "@/containers/SearchContainer";

export default function SearchScreen(): ReactElement {
  const route = useRoute<RouteProp<RootStackParamList, "Search">>();
  const query = route.params?.query ?? "";

  return <SearchContainer query={query} />;
}
