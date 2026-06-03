import { useNavigation, useRoute, type NavigationProp, type RouteProp } from "@react-navigation/native";
import { useLayoutEffect, type ReactElement } from "react";

import { DetailsContainer } from "@/containers/DetailsContainer";
import type { RootStackParamList } from "@/app/navigation/types";

export default function DetailsScreen(): ReactElement {
  const route = useRoute<RouteProp<RootStackParamList, "Details">>();
  const navigation = useNavigation<NavigationProp<RootStackParamList, "Details">>();

  useLayoutEffect(() => {
    navigation.setOptions({ headerMode: "float" });
  }, [navigation]);

  return <DetailsContainer params={route.params} />;
}
