import { useMutation } from "@tanstack/react-query";
import { ScrollView, Text, TextInput, View } from "react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import { Image } from "expo-image";

function debounce<F>(func: F, delay: number) {
  let timeoutId: NodeJS.Timeout | null = null;
  let typingTimer: NodeJS.Timeout | null = null;

  return function (...args) {
    if (typingTimer !== null) {
      clearTimeout(typingTimer);
    }

    // Restart timer after 100ms
    if (timeoutId === null) {
      typingTimer = setTimeout(() => {
        func(...args);
        timeoutId = null;
      }, delay);
    } else {
      timeoutId = setTimeout(() => {
        func(...args);
        timeoutId = null;
        typingTimer = null; // Reset timer
      }, delay);
    }
  };
}

const getAllMovies = (query: string) => {
  const url = new URL(`${process.env.EXPO_PUBLIC_API_URL}/v2/search/titles`);
  url.searchParams.append("query", query);
  // url.searchParams.append("page_size", "");
  // url.searchParams.append("page_token", "");

  return fetch(url).then((res) => res.json());
};

const queryOptions = {
  movies: {
    all: (query: string) => {
      return {
        queryKey: ["movies", "all", query],
        queryFn: () => getAllMovies(query),
        mutationFn: () => getAllMovies(query),
      };
    },
  },
};

export default function Index() {
  const [query, setQuery] = useState("");
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const { data, mutateAsync } = useMutation(queryOptions.movies.all(query));

  const getAllMoviesDebounced = useCallback(
    () => debounce(() => mutateAsync().then((res) => console.log(res)), 500),
    [mutateAsync],
  );

  const handleOnQueryTitleChange = (search: string) => {
    setQuery(search);
  };

  useEffect(() => {
    if (query !== "") {
      setIsTyping(true);
      const timer = setTimeout(() => {
        setIsTyping(false);
        getAllMoviesDebounced()();
      }, 1000); // reset typing after 200ms
      return () => clearTimeout(timer);
    }
    setIsTyping(false);
  }, [query, getAllMoviesDebounced]);

  return (
    <ScrollView>
      <TextInput
        onChangeText={handleOnQueryTitleChange}
        placeholder="Search for: Batman, Supernatural, Atomic habits..."
        value={query}
      />
      {data?.titles?.map((title) => {
        return (
          <article key={title?.id}>
            <section>
              <Image
                style={{
                  width: title?.primary_image?.width,
                  height: title?.primary_image?.height,
                }}
                source={title?.primary_image?.url}
                contentFit="cover"
              />
            </section>
            <section>
              <Text>{title?.primary_title}</Text>
            </section>
          </article>
        );
      })}
    </ScrollView>
  );
}
