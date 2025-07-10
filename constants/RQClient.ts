import { QueryClient, QueryClientConfig } from "@tanstack/react-query";

export const client = (options?: QueryClientConfig) => {
  return new QueryClient({ ...options });
};
