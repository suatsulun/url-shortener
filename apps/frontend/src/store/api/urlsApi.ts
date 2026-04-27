import type { Url, ShortenResponse } from "@/types/url";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const urlsApi = createApi({
  reducerPath: "urlsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL,
    credentials: "include",
  }),
  tagTypes: ["Url"],
  endpoints: (builder) => ({
    getMyUrls: builder.query<Url[], void>({
      query: () => ({
        url: "/urls/me",
        method: "GET",
      }),
      providesTags: ["Url"],
    }),
    shortenUrl: builder.mutation<ShortenResponse, { originalUrl: string }>({
      query: ({ originalUrl }) => ({
        url: "/urls/shorten",
        method: "POST",
        body: { originalUrl },
      }),
      invalidatesTags: ["Url"],
    }),
    deleteUrl: builder.mutation<void, string>({
      query: (shortId) => ({
        url: `/urls/${shortId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Url"],
    }),
  }),
});

export const {
  useGetMyUrlsQuery,
  useShortenUrlMutation,
  useDeleteUrlMutation,
} = urlsApi;

export default urlsApi;
