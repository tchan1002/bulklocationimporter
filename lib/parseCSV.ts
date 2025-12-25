import Papa from 'papaparse';
import { RawLocation, GeocodedLocation } from '@/types/location';

export function parseCSV(csvText: string): RawLocation[] {
  const result = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header: string) => {
      // Normalize header names
      const normalized = header.toLowerCase().trim();
      if (normalized === 'name') return 'name';
      if (normalized === 'category') return 'category';
      if (normalized.includes('neighborhood') || normalized.includes('area')) return 'neighborhood';
      if (normalized === 'city') return 'city';
      if (normalized === 'state') return 'state';
      if (normalized === 'country') return 'country';
      if (normalized === 'notes') return 'notes';
      return normalized;
    },
  });

  return (result.data as Record<string, string>[]).map((row) => ({
    name: row.name?.trim() || '',
    category: row.category?.trim() || 'Other',
    neighborhood: row.neighborhood?.trim() || '',
    city: row.city?.trim() || '',
    state: row.state?.trim() || '',
    country: row.country?.trim() || '',
    notes: row.notes?.trim() || '',
  })).filter(loc => loc.name); // Filter out empty rows
}

export function createGeocodedLocations(rawLocations: RawLocation[]): GeocodedLocation[] {
  return rawLocations.map((loc, index) => {
    const needsManualEntry = 
      loc.neighborhood.toLowerCase().includes('multiple') ||
      loc.city.toLowerCase().includes('multiple');
    
    return {
      ...loc,
      id: `loc-${index}-${Date.now()}`,
      latitude: null,
      longitude: null,
      geocodeStatus: needsManualEntry ? 'manual_required' : 'pending',
      geocodeQuery: buildGeocodeQuery(loc),
      errorMessage: needsManualEntry ? 'Multiple locations - manual entry required' : undefined,
    };
  });
}

function buildGeocodeQuery(location: RawLocation): string {
  const parts = [
    location.name,
    location.neighborhood,
    location.city,
    location.state,
    location.country,
  ].filter(Boolean);
  
  return parts.join(', ');
}

export function buildFallbackQueries(location: RawLocation): string[] {
  return [
    // Full query
    [location.name, location.neighborhood, location.city, location.state, location.country].filter(Boolean).join(', '),
    // Without neighborhood
    [location.name, location.city, location.state, location.country].filter(Boolean).join(', '),
    // Just name and city/country
    [location.name, location.city, location.country].filter(Boolean).join(', '),
    // Just name and country
    [location.name, location.country].filter(Boolean).join(', '),
  ];
}

