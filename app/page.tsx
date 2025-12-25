'use client';

import { useState, useCallback } from 'react';
import { GeocodedLocation } from '@/types/location';
import { parseCSV, createGeocodedLocations, buildFallbackQueries } from '@/lib/parseCSV';
import CsvInput from '@/components/CsvInput';
import LocationList from '@/components/LocationList';
import LocationMap from '@/components/LocationMap';
import ExportButtons from '@/components/ExportButtons';
import ManualEntryModal from '@/components/ManualEntryModal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MapPin, Loader2, ArrowLeft, BookOpen } from 'lucide-react';

export default function Home() {
  const [locations, setLocations] = useState<GeocodedLocation[]>([]);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [editingLocation, setEditingLocation] = useState<GeocodedLocation | null>(null);
  const [collectionName, setCollectionName] = useState('My Locations');
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const handleParse = useCallback(async (csvText: string) => {
    const rawLocations = parseCSV(csvText);
    const geocodedLocations = createGeocodedLocations(rawLocations);
    setLocations(geocodedLocations);
    
    // Start geocoding
    await geocodeLocations(geocodedLocations);
  }, []);

  const geocodeLocations = async (locs: GeocodedLocation[]) => {
    setIsGeocoding(true);
    const locationsToGeocode = locs.filter(l => l.geocodeStatus === 'pending');
    setProgress({ current: 0, total: locationsToGeocode.length });

    const queries = locationsToGeocode.map(l => l.geocodeQuery);
    
    try {
      const response = await fetch('/api/geocode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ queries }),
      });

      if (!response.ok) {
        throw new Error('Geocoding failed');
      }

      const { results } = await response.json();

      // Update locations with results
      setLocations(prev => {
        const updated = [...prev];
        let resultIndex = 0;

        for (let i = 0; i < updated.length; i++) {
          if (updated[i].geocodeStatus === 'pending') {
            const result = results[resultIndex];
            if (result.success) {
              updated[i] = {
                ...updated[i],
                latitude: result.latitude,
                longitude: result.longitude,
                geocodeStatus: 'success',
              };
            } else {
              // Try fallback queries
              updated[i] = {
                ...updated[i],
                geocodeStatus: 'failed',
                errorMessage: result.errorMessage || 'Location not found',
              };
            }
            resultIndex++;
            setProgress(p => ({ ...p, current: resultIndex }));
          }
        }

        return updated;
      });

      // Retry failed ones with fallback queries
      await retryFailedWithFallbacks();

    } catch (error) {
      console.error('Geocoding error:', error);
      setLocations(prev => prev.map(l => 
        l.geocodeStatus === 'pending' 
          ? { ...l, geocodeStatus: 'failed', errorMessage: 'Network error' }
          : l
      ));
    } finally {
      setIsGeocoding(false);
    }
  };

  const retryFailedWithFallbacks = async () => {
    setLocations(prev => {
      const failed = prev.filter(l => l.geocodeStatus === 'failed');
      if (failed.length === 0) return prev;

      // We'll handle this asynchronously
      (async () => {
        for (const location of failed) {
          const fallbackQueries = buildFallbackQueries(location);
          
          // Skip the first one (we already tried it)
          for (let i = 1; i < fallbackQueries.length; i++) {
            const query = fallbackQueries[i];
            
            try {
              const response = await fetch('/api/geocode', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ queries: [query] }),
              });

              if (!response.ok) continue;

              const { results } = await response.json();
              if (results[0]?.success) {
                setLocations(p => p.map(l => 
                  l.id === location.id
                    ? {
                        ...l,
                        latitude: results[0].latitude,
                        longitude: results[0].longitude,
                        geocodeStatus: 'success',
                        geocodeQuery: query,
                      }
                    : l
                ));
                break;
              }
            } catch (e) {
              console.error('Fallback query failed:', e);
            }
          }
        }
      })();

      return prev;
    });
  };

  const handleLocationClick = (location: GeocodedLocation) => {
    setSelectedLocationId(location.id);
  };

  const handleManualSave = (location: GeocodedLocation, lat: number, lng: number) => {
    setLocations(prev => prev.map(l => 
      l.id === location.id
        ? {
            ...l,
            latitude: lat,
            longitude: lng,
            geocodeStatus: 'success',
            errorMessage: undefined,
          }
        : l
    ));
    setEditingLocation(null);
  };

  const hasLocations = locations.length > 0;
  const hasValidLocations = locations.some(l => l.geocodeStatus === 'success');

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <MapPin className="h-6 w-6" />
              Bulk Location Importer
            </h1>
            <p className="text-sm text-muted-foreground">
              Import locations to Google Maps & Apple Maps
            </p>
          </div>

          {hasLocations && (
            <div className="flex items-center gap-3">
              <Input
                type="text"
                value={collectionName}
                onChange={(e) => setCollectionName(e.target.value)}
                placeholder="Collection name"
                className="w-64"
              />
            </div>
          )}
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Progress indicator */}
        {isGeocoding && (
          <Card className="mb-6 border-primary/20 bg-primary/5">
            <div className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span className="font-medium">
                  Geocoding locations... {progress.current}/{progress.total}
                </span>
              </div>
              <div className="w-full bg-primary/20 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress.total > 0 ? (progress.current / progress.total) * 100 : 0}%` }}
                />
              </div>
            </div>
          </Card>
        )}

        {/* Main content */}
        {!hasLocations ? (
          <div className="max-w-3xl mx-auto">
            <CsvInput onParse={handleParse} isLoading={isGeocoding} />

            {/* Getting started info */}
            <Card className="mt-8 bg-card/50">
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  How it works
                </h3>
                <ol className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <span className="font-semibold text-primary">1.</span>
                    Paste your CSV with location data (name, category, city, etc.)
                  </li>
                  <li className="flex gap-2">
                    <span className="font-semibold text-primary">2.</span>
                    Click &quot;Geocode&quot; to find coordinates for each location
                  </li>
                  <li className="flex gap-2">
                    <span className="font-semibold text-primary">3.</span>
                    Preview on the map & fix any locations that weren&apos;t found
                  </li>
                  <li className="flex gap-2">
                    <span className="font-semibold text-primary">4.</span>
                    Export to GPX (Apple Maps) or KML (Google My Maps)
                  </li>
                </ol>
              </div>
            </Card>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Two-column layout for list and map */}
            <div className="grid lg:grid-cols-2 gap-6">
              <LocationList
                locations={locations}
                onLocationClick={handleLocationClick}
                onManualEdit={setEditingLocation}
                selectedLocationId={selectedLocationId}
              />
              
              <LocationMap
                locations={locations}
                selectedLocationId={selectedLocationId}
                onLocationSelect={(loc) => setSelectedLocationId(loc.id)}
              />
            </div>

            {/* Export section */}
            {hasValidLocations && (
              <ExportButtons
                locations={locations}
                collectionName={collectionName}
              />
            )}

            {/* Start over button */}
            <div className="text-center">
              <Button
                variant="ghost"
                onClick={() => {
                  setLocations([]);
                  setSelectedLocationId(null);
                }}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Start over with new data
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Manual entry modal */}
      {editingLocation && (
        <ManualEntryModal
          location={editingLocation}
          onSave={handleManualSave}
          onClose={() => setEditingLocation(null)}
        />
      )}
    </main>
  );
}

