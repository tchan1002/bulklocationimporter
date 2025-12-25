'use client';

import { GeocodedLocation } from '@/types/location';
import { getCategoryColor, getCategoryEmoji } from '@/lib/categoryColors';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, CheckCircle2, XCircle, AlertCircle, Circle, Edit } from 'lucide-react';

interface LocationListProps {
  locations: GeocodedLocation[];
  onLocationClick: (location: GeocodedLocation) => void;
  onManualEdit: (location: GeocodedLocation) => void;
  selectedLocationId: string | null;
}

export default function LocationList({ 
  locations, 
  onLocationClick, 
  onManualEdit,
  selectedLocationId 
}: LocationListProps) {
  const successCount = locations.filter(l => l.geocodeStatus === 'success').length;
  const failedCount = locations.filter(l => l.geocodeStatus === 'failed').length;
  const manualCount = locations.filter(l => l.geocodeStatus === 'manual_required').length;
  const pendingCount = locations.filter(l => l.geocodeStatus === 'pending').length;

  return (
    <Card className="overflow-hidden animate-slide-up">
      <CardHeader>
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          <CardTitle>Locations ({locations.length})</CardTitle>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {successCount > 0 && (
            <Badge variant="default" className="bg-green-600">
              <CheckCircle2 className="mr-1 h-3 w-3" />
              {successCount} found
            </Badge>
          )}
          {failedCount > 0 && (
            <Badge variant="destructive">
              <XCircle className="mr-1 h-3 w-3" />
              {failedCount} failed
            </Badge>
          )}
          {manualCount > 0 && (
            <Badge variant="default" className="bg-amber-600">
              <AlertCircle className="mr-1 h-3 w-3" />
              {manualCount} need manual entry
            </Badge>
          )}
          {pendingCount > 0 && (
            <Badge variant="secondary">
              <Circle className="mr-1 h-3 w-3" />
              {pendingCount} pending
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="max-h-[500px] overflow-y-auto">
          {locations.map((location, index) => (
            <div
              key={location.id}
              onClick={() => location.geocodeStatus === 'success' && onLocationClick(location)}
              className={`p-4 border-b last:border-b-0
                         transition-colors duration-150
                         ${location.geocodeStatus === 'success' ? 'cursor-pointer hover:bg-accent' : ''}
                         ${selectedLocationId === location.id ? 'bg-accent' : ''}`}
              style={{ animationDelay: `${index * 0.02}s` }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <StatusIcon status={location.geocodeStatus} />
                    <span className="font-medium truncate">
                      {location.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium text-white"
                      style={{ backgroundColor: getCategoryColor(location.category) }}
                    >
                      {getCategoryEmoji(location.category)} {location.category}
                    </span>
                    {location.neighborhood && (
                      <span className="text-xs text-muted-foreground">
                        {location.neighborhood}
                      </span>
                    )}
                  </div>

                  {location.notes && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                      {location.notes}
                    </p>
                  )}

                  {location.errorMessage && (
                    <p className="text-xs text-destructive mt-1">
                      {location.errorMessage}
                    </p>
                  )}
                </div>

                {(location.geocodeStatus === 'failed' || location.geocodeStatus === 'manual_required') && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onManualEdit(location);
                    }}
                  >
                    <Edit className="mr-2 h-3 w-3" />
                    Edit
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function StatusIcon({ status }: { status: GeocodedLocation['geocodeStatus'] }) {
  const className = "h-4 w-4";

  switch (status) {
    case 'success':
      return <CheckCircle2 className={`${className} text-green-500`} />;
    case 'failed':
      return <XCircle className={`${className} text-destructive`} />;
    case 'manual_required':
      return <AlertCircle className={`${className} text-amber-500`} />;
    case 'pending':
      return <Circle className={`${className} text-muted-foreground`} />;
    default:
      return null;
  }
}

