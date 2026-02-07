import { NextRequest, NextResponse } from 'next/server';
import { TmdbService } from '@/services/tmdb-service';

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

    const data = await TmdbService.fetch(apiPath, queryParams);
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
