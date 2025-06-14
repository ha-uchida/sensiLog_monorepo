CREATE TABLE IF NOT EXISTS "admin_actions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"admin_user_id" uuid NOT NULL,
	"target_user_id" uuid,
	"action_type" varchar(50) NOT NULL,
	"resource_type" varchar(50),
	"resource_id" uuid,
	"details" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "match_data" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"match_id" varchar(50) NOT NULL,
	"game_start_time" timestamp NOT NULL,
	"game_end_time" timestamp,
	"map_name" varchar(50),
	"game_mode" varchar(30),
	"agent_name" varchar(30),
	"kills" integer,
	"deaths" integer,
	"assists" integer,
	"combat_score" numeric(8, 2),
	"damage_dealt" integer,
	"headshot_count" integer,
	"bodyshot_count" integer,
	"legshot_count" integer,
	"kd_ratio" numeric(5, 2),
	"adr" numeric(6, 2),
	"headshot_percentage" numeric(5, 2),
	"rounds_played" integer,
	"team_won" boolean,
	"rank_tier" varchar(20),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "match_data_match_id_unique" UNIQUE("match_id")
);

CREATE TABLE IF NOT EXISTS "settings_record_tags" (
	"settings_record_id" uuid NOT NULL,
	"tag_id" integer NOT NULL
);

CREATE TABLE IF NOT EXISTS "settings_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"sensitivity" numeric(10, 4) NOT NULL,
	"dpi" integer NOT NULL,
	"mouse_device" varchar(100),
	"keyboard_device" varchar(100),
	"mousepad" varchar(100),
	"tags" jsonb DEFAULT '[]'::jsonb,
	"comment" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "tags" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(50) NOT NULL,
	"color" varchar(7) DEFAULT '#007bff' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tags_name_unique" UNIQUE("name")
);

CREATE TABLE IF NOT EXISTS "team_members" (
	"team_id" integer NOT NULL,
	"user_id" uuid NOT NULL,
	"role" varchar(20) DEFAULT 'member' NOT NULL,
	"joined_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "teams" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"riot_puuid" varchar(78),
	"game_name" varchar(16),
	"tag_line" varchar(5),
	"access_token" text,
	"refresh_token" text,
	"token_expires_at" timestamp,
	"is_admin" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_riot_puuid_unique" UNIQUE("riot_puuid")
);

DO $$ BEGIN
 ALTER TABLE "admin_actions" ADD CONSTRAINT "admin_actions_admin_user_id_users_id_fk" FOREIGN KEY ("admin_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "admin_actions" ADD CONSTRAINT "admin_actions_target_user_id_users_id_fk" FOREIGN KEY ("target_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "match_data" ADD CONSTRAINT "match_data_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "settings_record_tags" ADD CONSTRAINT "settings_record_tags_settings_record_id_settings_records_id_fk" FOREIGN KEY ("settings_record_id") REFERENCES "public"."settings_records"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "settings_record_tags" ADD CONSTRAINT "settings_record_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "settings_records" ADD CONSTRAINT "settings_records_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "team_members" ADD CONSTRAINT "team_members_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "team_members" ADD CONSTRAINT "team_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;