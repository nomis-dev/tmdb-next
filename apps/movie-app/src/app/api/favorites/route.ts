import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// This API Route handles backend logic for User Favorites (CRUD operations)
// It uses Supabase Server Client to ensure operations are secure and authenticated.

// GET: Retrieve all favorite movies for the currently logged-in user
export async function GET() {
  try {
    // 1. Initialize Supabase and check if the user is authenticated
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Fetch all favorites from the database specifically for this user.
    // The select() statement renames snake_case DB columns to camelCase JS properties.
    const { data: userFavorites, error } = await supabase
      .from('favorites')
      .select(`
        id,
        userId:user_id,
        movieId:movie_id,
        mediaType:media_type,
        title,
        posterPath:poster_path,
        rating,
        createdAt:created_at
      `)
      .eq('user_id', user.id);

    if (error) {
      throw error;
    }

    return NextResponse.json(userFavorites);
  } catch (error) {
    console.error('Error in GET /api/favorites:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST: Add a new movie to the user's favorites
export async function POST(request: Request) {
  try {
    // 1. Authenticate user
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse the incoming JSON payload (movie details sent from the frontend)
    const body = await request.json();
    const { movieId, mediaType = 'movie', title, posterPath, rating } = body;

    if (!movieId || !title) {
      return NextResponse.json({ error: 'movieId and title are required' }, { status: 400 });
    }

    // 3. Validation: Prevent duplicate favorites
    // Query the database to see if this user already favorited this specific movie
    const { data: existing } = await supabase
      .from('favorites')
      .select('id')
      .match({ user_id: user.id, movie_id: movieId });

    if (existing && existing.length > 0) {
      return NextResponse.json({ error: 'Already in favorites' }, { status: 409 });
    }

    // 4. Insert the new favorite record into the Supabase database
    const { data: newFavorite, error } = await supabase
      .from('favorites')
      .insert({
        user_id: user.id,
        movie_id: movieId,
        media_type: mediaType,
        title,
        poster_path: posterPath,
        rating,
      })
      .select(`
        id,
        userId:user_id,
        movieId:movie_id,
        mediaType:media_type,
        title,
        posterPath:poster_path,
        rating,
        createdAt:created_at
      `)
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(newFavorite, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/favorites:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE: Remove a specific movie from the user's favorites
export async function DELETE(request: Request) {
  try {
    // 1. Authenticate user
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Extract the movieId from the URL query string (e.g., ?movieId=123)
    const { searchParams } = new URL(request.url);
    const movieId = searchParams.get('movieId');

    if (!movieId) {
      return NextResponse.json({ error: 'movieId is required' }, { status: 400 });
    }

    // 3. Delete the specific record matching BOTH the user's ID and the movie ID
    // This ensures a user can't accidentally (or maliciously) delete someone else's favorite.
    const { error } = await supabase
      .from('favorites')
      .delete()
      .match({ user_id: user.id, movie_id: parseInt(movieId) });

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/favorites:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
