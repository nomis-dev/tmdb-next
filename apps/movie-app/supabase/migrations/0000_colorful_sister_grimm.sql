CREATE TABLE "favorites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"movie_id" integer NOT NULL,
	"media_type" text DEFAULT 'movie' NOT NULL,
	"title" text NOT NULL,
	"poster_path" text,
	"rating" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
