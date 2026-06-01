import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { queryOptions } from "@/constants/query";
import type { MovieSuggestion } from "@/domain/entities/Movie";
import { useRepositories } from "@/providers/RepositoryProvider";

const MIN_SUGGESTION_QUERY_LENGTH = 2;
const MAX_SUGGESTIONS = 5;
const SUGGESTION_DEBOUNCE_MS = 250;

interface UseSearchSuggestionsResult {
  suggestions: MovieSuggestion[];
  isLoading: boolean;
  normalizedQuery: string;
  canSuggest: boolean;
}

export function useSearchSuggestions(query: string): UseSearchSuggestionsResult {
  const { movieRepository } = useRepositories();
  const normalizedQuery = useMemo(() => query.trim(), [query]);
  const [debouncedQuery, setDebouncedQuery] = useState(normalizedQuery);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedQuery(normalizedQuery);
    }, SUGGESTION_DEBOUNCE_MS);

    return () => clearTimeout(timeoutId);
  }, [normalizedQuery]);

  const canSuggest = normalizedQuery.length >= MIN_SUGGESTION_QUERY_LENGTH;
  const hasFreshSuggestions = canSuggest && debouncedQuery === normalizedQuery;
  const canFetchSuggestions = hasFreshSuggestions && debouncedQuery.length >= MIN_SUGGESTION_QUERY_LENGTH;

  const { data, isFetching } = useQuery({
    ...queryOptions.movies.suggestions(debouncedQuery),
    queryFn: () => movieRepository.suggest(debouncedQuery),
    enabled: canFetchSuggestions,
  });

  return {
    suggestions: canFetchSuggestions ? data?.slice(0, MAX_SUGGESTIONS) ?? [] : [],
    isLoading: isFetching,
    normalizedQuery: debouncedQuery,
    canSuggest,
  };
}
