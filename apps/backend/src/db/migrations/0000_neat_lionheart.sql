CREATE TABLE "users" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "urls" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "urls_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"short_id" text NOT NULL,
	"original_url" text NOT NULL,
	"url_hash" text NOT NULL,
	"clicks" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_accessed_at" timestamp,
	"expires_at" timestamp,
	CONSTRAINT "urls_short_id_unique" UNIQUE("short_id"),
	CONSTRAINT "urls_url_hash_unique" UNIQUE("url_hash")
);
--> statement-breakpoint
CREATE TABLE "user_urls" (
	"user_id" integer NOT NULL,
	"url_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_urls_user_id_url_id_pk" PRIMARY KEY("user_id","url_id")
);
--> statement-breakpoint
ALTER TABLE "user_urls" ADD CONSTRAINT "user_urls_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_urls" ADD CONSTRAINT "user_urls_url_id_urls_id_fk" FOREIGN KEY ("url_id") REFERENCES "public"."urls"("id") ON DELETE no action ON UPDATE no action;