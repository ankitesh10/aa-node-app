CREATE TYPE "public"."rate_limit_enum" AS ENUM('bot-minute', 'bot-hour', 'bot-day', 'session-hour');--> statement-breakpoint
CREATE TABLE "rate_limit_windows" (
	"identity_hash" varchar(64) NOT NULL,
	"scope" "rate_limit_enum" NOT NULL,
	"window_start" varchar(10) NOT NULL,
	"hits" integer DEFAULT 1,
	CONSTRAINT "rate_limit_windows_identity_hash_scope_window_start_pk" PRIMARY KEY("identity_hash","scope","window_start")
);
