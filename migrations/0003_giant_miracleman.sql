CREATE TABLE "schedulers" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_address" text NOT NULL,
	"trigger_running_id" text,
	"current_day" integer,
	"total_days" integer,
	"content" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "schedulers" ADD CONSTRAINT "schedulers_user_address_users_address_fk" FOREIGN KEY ("user_address") REFERENCES "public"."users"("address") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "trigger_running_id";