import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as usersSchema from "./schema/users.js";
import * as urlsSchema from "./schema/urls.js";

const usersPool = new Pool({
  connectionString: process.env.DATABASE_URL_USERS,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

const urlsPool = new Pool({
  connectionString: process.env.DATABASE_URL_LINKS,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

export const usersDb = drizzle(usersPool, { schema: usersSchema });
export const urlsDb = drizzle(urlsPool, { schema: urlsSchema });