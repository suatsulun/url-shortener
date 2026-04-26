import type { Url, ShortenResponse } from "@/types/url";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const urlsApi = createApi({
  reducerPath: "urlsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL,
    credentials: "include",
  }),
  endpoints: (builder) => ({
    getMyUrls: builder.query<Url[], void>({
      query: () => ({
        providedTags: ["Url"],
        url: "/urls/me",
        method: "GET",
      }),
    }),
    shortenUrl: builder.mutation<ShortenResponse, { originalUrl: string }>({
      query: ({ originalUrl }) => ({
        invalidatesTags: ["Url"],
        url: "/urls/shorten",
        method: "POST",
        body: { originalUrl },
      }),
    }),
    deleteUrl: builder.mutation<void, string>({
      query: (shortId) => ({
        invalidatesTags: ["Url"],
        url: `/urls/${shortId}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useGetMyUrlsQuery,
  useShortenUrlMutation,
  useDeleteUrlMutation,
} = urlsApi;

export default urlsApi;
