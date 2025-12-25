import { GeocodedLocation } from '@/types/location';

// Generate a Google Maps URL for multiple locations
// Note: This is limited by URL length (~2000 chars), so max ~10-15 locations
export function generateGoogleMapsURL(locations: GeocodedLocation[]): string | null {
  const validLocations = locations.filter(
    loc => loc.geocodeStatus === 'success' && loc.latitude && loc.longitude
  );

  if (validLocations.length === 0) return null;

  if (validLocations.length === 1) {
    const loc = validLocations[0];
    return `https://www.google.com/maps/search/?api=1&query=${loc.latitude},${loc.longitude}`;
  }

  // For multiple locations, create a directions URL
  // This shows all points but as a route
  const origin = validLocations[0];
  const destination = validLocations[validLocations.length - 1];
  const waypoints = validLocations.slice(1, -1);

  let url = `https://www.google.com/maps/dir/?api=1`;
  url += `&origin=${origin.latitude},${origin.longitude}`;
  url += `&destination=${destination.latitude},${destination.longitude}`;
  
  if (waypoints.length > 0) {
    const waypointStr = waypoints
      .map(loc => `${loc.latitude},${loc.longitude}`)
      .join('|');
    url += `&waypoints=${encodeURIComponent(waypointStr)}`;
  }

  return url;
}

// Generate Apple Maps URL for a single location
export function generateAppleMapsURL(location: GeocodedLocation): string | null {
  if (!location.latitude || !location.longitude) return null;
  
  const query = encodeURIComponent(location.name);
  return `https://maps.apple.com/?ll=${location.latitude},${location.longitude}&q=${query}`;
}

// Generate Google My Maps import instructions
export function getGoogleMyMapsInstructions(): string {
  return `
To import into Google My Maps:
1. Go to google.com/mymaps
2. Click "Create a new map"
3. Click "Import" in the left panel
4. Upload the KML file
5. Your locations will appear with colors by category!
6. The map syncs to your Google Maps app
  `.trim();
}

// Check if we can create a direct URL (not too many locations)
export function canCreateDirectURL(locations: GeocodedLocation[]): boolean {
  const validCount = locations.filter(
    loc => loc.geocodeStatus === 'success' && loc.latitude && loc.longitude
  ).length;
  
  // Rough estimate: each coordinate pair is ~25 chars, URL limit is ~2000
  return validCount <= 15;
}

