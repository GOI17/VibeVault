import { useQuery } from "@tanstack/react-query";
import { ScrollView } from "react-native";
import { queryOptions } from "@/constants/query";
import { useLocalSearchParams, useNavigation } from "expo-router";
import MasonryList from "@/components/Masonry";
import { useLayoutEffect } from "react";

export default function Search() {
  const params = useLocalSearchParams();
  const { data } = useQuery({
    ...queryOptions.movies.all(params.query as string),
    enabled: !!params.query,
  });
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({ title: `Search: ${params.query}` });
  }, [navigation, params.query]);

  return (
    <ScrollView>
      <MasonryList
        data={
          data?.titles.map((item) => ({
            key: item.id,
            imageSrc: item.primaryImage?.url,
            title: item.primaryTitle,
          })) || []
        }
      />
    </ScrollView>
  );
}
