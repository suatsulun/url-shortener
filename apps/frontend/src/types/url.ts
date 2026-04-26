export type ShortenResponse = {
  shortId: string;
  shortUrl: string;
  originalUrl: string;
};

export type Url = {
  shortId: string;
  originalUrl: string;
  clicks: number;
  expiresAt: string;
  createdAt: string;
};
