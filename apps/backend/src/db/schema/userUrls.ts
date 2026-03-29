import { pgTable, integer, timestamp, primaryKey } from "drizzle-orm/pg-core";
import { users } from "./users.js";
import { urls } from "./urls.js";


export const userUrls = pgTable(
  "user_urls",
  {
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    urlId: integer("url_id")
      .notNull()
      .references(() => urls.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
  primaryKey({ columns: [table.userId, table.urlId] }),
]
);

export type UserUrl = typeof userUrls.$inferSelect;
export type NewUserUrl = typeof userUrls.$inferInsert;