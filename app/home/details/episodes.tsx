import { useRoute, type RouteProp } from "@react-navigation/native";
import type { ReactElement } from "react";

import type { RootStackParamList } from "@/app/navigation/types";
import { EpisodeListContainer } from "@/containers/EpisodeListContainer";

export default function EpisodeListScreen(): ReactElement {
  const route = useRoute<RouteProp<RootStackParamList, "EpisodeList">>();

  return <EpisodeListContainer params={route.params} />;
}