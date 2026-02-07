import { pgTable, text, integer, timestamp, uuid, boolean, primaryKey } from 'drizzle-orm/pg-core';

export const favorites = pgTable('favorites', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull(), // References auth.users in Supabase
  movieId: integer('movie_id').notNull(),
  mediaType: text('media_type').notNull().default('movie'), // 'movie' or 'tv'
  title: text('title').notNull(),
  posterPath: text('poster_path'),
  rating: integer('rating'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type Favorite = typeof favorites.$inferSelect;
export type NewFavorite = typeof favorites.$inferInsert;
