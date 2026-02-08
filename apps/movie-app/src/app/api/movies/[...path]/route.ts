import { NextRequest, NextResponse } from 'next/server';
import { TmdbService, TmdbResponseSchema, MovieDetailsSchema } from '@/services/tmdb-service';
import { z } from 'zod';

// Schema mapping based on API path patterns
const getSchemaForPath = (path: string): z.ZodTypeAny => {
  // Movie details endpoint: movie/{id}
  if (/^movie\/\d+$/.test(path)) {
    return MovieDetailsSchema;
  }
  // List endpoints: movie/popular, search/movie, etc.
  return TmdbResponseSchema;
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  try {
    const { path } = await params;
    const { searchParams } = new URL(request.url);
    const apiPath = path.join('/');

    const queryParams: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      queryParams[key] = value;
    });

    if (!queryParams['language']) {
      queryParams['language'] = 'en-US';
    }

    const schema = getSchemaForPath(apiPath);
    const data = await TmdbService.fetch(schema, apiPath, queryParams);
    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error('Error fetching data from TMDB:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch data from TMDB';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 },
    );
  }
}
