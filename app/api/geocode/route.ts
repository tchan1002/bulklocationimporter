import { NextRequest, NextResponse } from 'next/server';

interface GeocodeRequest {
  queries: string[];
}

interface GeocodeResult {
  query: string;
  success: boolean;
  latitude?: number;
  longitude?: number;
  placeName?: string;
  errorMessage?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: GeocodeRequest = await request.json();
    const { queries } = body;

    if (!queries || !Array.isArray(queries)) {
      return NextResponse.json(
        { error: 'Invalid request: queries array required' },
        { status: 400 }
      );
    }

    const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    
    if (!mapboxToken) {
      return NextResponse.json(
        { error: 'Mapbox token not configured' },
        { status: 500 }
      );
    }

    // Process queries with rate limiting (batch of 10 at a time)
    const results: GeocodeResult[] = [];
    const batchSize = 10;

    console.debug('[geocode api] received queries', {
      total: queries.length,
      sample: queries.slice(0, 5),
    });
    
    for (let i = 0; i < queries.length; i += batchSize) {
      const batch = queries.slice(i, i + batchSize);
      console.debug('[geocode api] batch', { start: i, count: batch.length });
      const batchResults = await Promise.all(
        batch.map(query => geocodeQuery(query, mapboxToken))
      );
      results.push(...batchResults);
      
      // Add a small delay between batches to respect rate limits
      if (i + batchSize < queries.length) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Geocoding error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function geocodeQuery(query: string, token: string): Promise<GeocodeResult> {
  try {
    const encodedQuery = encodeURIComponent(query);
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedQuery}.json?access_token=${token}&limit=1`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      return {
        query,
        success: false,
        errorMessage: `Geocoding failed: ${response.status}`,
      };
    }

    const data = await response.json();
    
    if (!data.features || data.features.length === 0) {
      return {
        query,
        success: false,
        errorMessage: 'No results found',
      };
    }

    const feature = data.features[0];
    const [longitude, latitude] = feature.center;

    return {
      query,
      success: true,
      latitude,
      longitude,
      placeName: feature.place_name,
    };
  } catch (error) {
    return {
      query,
      success: false,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
