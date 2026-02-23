import { NextRequest, NextResponse } from 'next/server';
import { TmdbService, TmdbResponseSchema, MovieDetailsSchema } from '@/services/tmdb-service';
import { z } from 'zod';

// This is a Catch-all API Route (denoted by [...path] in the folder name).
// It acts as a universal proxy for all requests to the TMDB API.
// Any request starting with /api/movies/... will be handled by this file.

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
    // 1. Extract the dynamic path segments from the URL. 
    // Example: for /api/movies/movie/popular, `path` will be ['movie', 'popular']
    const { path } = await params;
    
    // 2. Parse the incoming request URL to get query parameters (like ?page=1)
    const { searchParams } = new URL(request.url);
    
    // 3. Reconstruct the TMDB API path. 
    // Example: ['movie', 'popular'] becomes 'movie/popular'
    const apiPath = path.join('/');

    // 4. Convert Next.js searchParams into a standard key-value object
    const queryParams: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      queryParams[key] = value;
    });

    // 5. Provide a fallback language if the client didn't specify one
    if (!queryParams['language']) {
      queryParams['language'] = 'en-US';
    }

    // 6. Determine which Zod schema to use based on the requested endpoint
    const schema = getSchemaForPath(apiPath);
    
    // 7. Make the actual request to TMDB via our service layer, which will 
    // automatically validate the response against the chosen Zod schema.
    const data = await TmdbService.fetch(schema, apiPath, queryParams);
    
    // 8. Return the validated JSON data back to the client
    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error('Error fetching data from TMDB:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch data from TMDB';
    
    // Return a structured 500 Error response if anything goes wrong (e.g., TMDB is down, 
    // or the data format didn't match our Zod schema)
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 },
    );
  }
}
