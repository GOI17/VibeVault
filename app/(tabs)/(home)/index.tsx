import { useQuery } from "@tanstack/react-query";
import { ScrollView } from "react-native";

import MasonryList from "@/components/Masonry";
import { queryOptions } from "@/constants/query";

export default function Index() {
  const { data } = useQuery(queryOptions.movies.random);

  return (
    <ScrollView style={{ backgroundColor: '#000000' }}>
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
