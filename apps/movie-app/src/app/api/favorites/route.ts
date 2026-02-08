import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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

export async function POST(request: Request) {
  try {
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
    const { data: existing } = await supabase
      .from('favorites')
      .select('id')
      .match({ user_id: user.id, movie_id: movieId });

    if (existing && existing.length > 0) {
      return NextResponse.json({ error: 'Already in favorites' }, { status: 409 });
    }

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

export async function DELETE(request: Request) {
  try {
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
