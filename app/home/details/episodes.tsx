import { useNavigation, useRoute, type NavigationProp, type RouteProp } from "@react-navigation/native";
import { useLayoutEffect, type ReactElement } from "react";

import type { RootStackParamList } from "@/app/navigation/types";
import { EpisodeListContainer } from "@/containers/EpisodeListContainer";

export default function EpisodeListScreen(): ReactElement {
  const route = useRoute<RouteProp<RootStackParamList, "EpisodeList">>();
  const navigation = useNavigation<NavigationProp<RootStackParamList, "EpisodeList">>();

  useLayoutEffect(() => {
    navigation.setOptions({ headerMode: "float" });
  }, [navigation]);

  return <EpisodeListContainer params={route.params} />;
}
