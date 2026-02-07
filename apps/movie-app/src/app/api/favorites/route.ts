import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/db';
import { favorites } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

// GET /api/favorites - Get all favorites for current user
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userFavorites = await db
    .select()
    .from(favorites)
    .where(eq(favorites.userId, user.id));

  return NextResponse.json(userFavorites);
}

// POST /api/favorites - Add a movie to favorites
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { movieId, mediaType = 'movie', title, posterPath, rating } = body;

  if (!movieId || !title) {
    return NextResponse.json({ error: 'movieId and title are required' }, { status: 400 });
  }

  // Check if already favorited
  const existing = await db
    .select()
    .from(favorites)
    .where(and(eq(favorites.userId, user.id), eq(favorites.movieId, movieId)));

  if (existing.length > 0) {
    return NextResponse.json({ error: 'Already in favorites' }, { status: 409 });
  }

  const [newFavorite] = await db
    .insert(favorites)
    .values({
      userId: user.id,
      movieId,
      mediaType,
      title,
      posterPath,
      rating,
    })
    .returning();

  return NextResponse.json(newFavorite, { status: 201 });
}

// DELETE /api/favorites - Remove a movie from favorites
export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const movieId = searchParams.get('movieId');

  if (!movieId) {
    return NextResponse.json({ error: 'movieId is required' }, { status: 400 });
  }

  await db
    .delete(favorites)
    .where(and(eq(favorites.userId, user.id), eq(favorites.movieId, parseInt(movieId))));

  return NextResponse.json({ success: true });
}
