import { useRoute, type RouteProp } from "@react-navigation/native";
import type { ReactElement } from "react";

import { DetailsContainer } from "@/containers/DetailsContainer";
import type { RootStackParamList } from "@/app/navigation/types";

export default function DetailsScreen(): ReactElement {
  const route = useRoute<RouteProp<RootStackParamList, "Details">>();

  return <DetailsContainer params={route.params} />;
}
