CREATE TYPE "public"."chat_role" AS ENUM('user', 'assistant', 'system');--> statement-breakpoint
CREATE TYPE "public"."chat_status" AS ENUM('active', 'inactive');--> statement-breakpoint
CREATE TABLE "chat_messages" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"session_id" varchar(191) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"parts" jsonb,
	"role" "chat_role" NOT NULL,
	"message" text NOT NULL,
	"metadata" jsonb
);
--> statement-breakpoint
CREATE TABLE "chat_sessions" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"title" varchar(50),
	"status" "chat_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"metadata" jsonb
);
--> statement-breakpoint
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_session_id_chat_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."chat_sessions"("id") ON DELETE cascade ON UPDATE no action;