'use client';

import { useState, useEffect } from 'react';
import { GeocodedLocation } from '@/types/location';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Edit, Search, X, AlertCircle } from 'lucide-react';

interface ManualEntryModalProps {
  location: GeocodedLocation | null;
  onSave: (location: GeocodedLocation, lat: number, lng: number) => void;
  onClose: () => void;
}

export default function ManualEntryModal({ location, onSave, onClose }: ManualEntryModalProps) {
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (location?.latitude) setLatitude(String(location.latitude));
    if (location?.longitude) setLongitude(String(location.longitude));
  }, [location]);

  if (!location) return null;

  const handleSubmit = () => {
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      setError('Please enter valid numbers for latitude and longitude');
      return;
    }

    if (lat < -90 || lat > 90) {
      setError('Latitude must be between -90 and 90');
      return;
    }

    if (lng < -180 || lng > 180) {
      setError('Longitude must be between -180 and 180');
      return;
    }

    onSave(location, lat, lng);
  };

  const handleGoogleSearch = () => {
    const query = encodeURIComponent(`${location.name} ${location.city} ${location.country}`);
    window.open(`https://www.google.com/maps/search/${query}`, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <Card className="max-w-md w-full animate-slide-up" onClick={e => e.stopPropagation()}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              <CardTitle>Manual Entry</CardTitle>
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              size="icon"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="p-3 bg-muted rounded-lg">
            <p className="font-medium">{location.name}</p>
            <p className="text-sm text-muted-foreground">{location.category} • {location.neighborhood}</p>
            {location.errorMessage && (
              <p className="text-sm text-amber-500 mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {location.errorMessage}
              </p>
            )}
          </div>

          <Button
            onClick={handleGoogleSearch}
            variant="outline"
            className="w-full"
          >
            <Search className="mr-2 h-4 w-4" />
            Search on Google Maps
            <span className="text-xs text-muted-foreground ml-2">(copy coords from there)</span>
          </Button>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="latitude">Latitude</Label>
              <Input
                id="latitude"
                type="text"
                value={latitude}
                onChange={(e) => {
                  setLatitude(e.target.value);
                  setError('');
                }}
                placeholder="e.g. 17.0614"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="longitude">Longitude</Label>
              <Input
                id="longitude"
                type="text"
                value={longitude}
                onChange={(e) => {
                  setLongitude(e.target.value);
                  setError('');
                }}
                placeholder="e.g. -96.7195"
              />
            </div>

            {error && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {error}
              </p>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                onClick={onClose}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                className="flex-1"
              >
                Save Location
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

