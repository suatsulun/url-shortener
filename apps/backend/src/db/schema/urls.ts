import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";


export const urls = pgTable("urls", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  shortId: text("short_id").notNull().unique(),
  originalUrl: text("original_url").notNull(),
  urlHash: text("url_hash").notNull().unique(),
  clicks: integer("clicks").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastAccessedAt: timestamp("last_accessed_at"),
  expiresAt: timestamp("expires_at"),
});

export type Url = typeof urls.$inferSelect;
export type NewUrl = typeof urls.$inferInsert;