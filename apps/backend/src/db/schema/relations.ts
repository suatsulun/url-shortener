import { relations } from "drizzle-orm";
import { users } from "./users.js";
import { urls } from "./urls.js";
import { userUrls } from "./userUrls.js";

export const usersRelations = relations(users, ({ many }) => ({
  userUrls: many(userUrls),
}));

export const urlsRelations = relations(urls, ({ many }) => ({
  userUrls: many(userUrls),
}));

export const userUrlsRelations = relations(userUrls, ({ one }) => ({
  user: one(users, {
    fields: [userUrls.userId],
    references: [users.id],
  }),
  url: one(urls, {
    fields: [userUrls.urlId],
    references: [urls.id],
  }),
}));