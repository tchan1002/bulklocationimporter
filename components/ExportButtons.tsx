'use client';

import { useState } from 'react';
import { GeocodedLocation } from '@/types/location';
import { downloadGPX } from '@/lib/exportGPX';
import { downloadKML } from '@/lib/exportKML';
import { generateGoogleMapsURL, canCreateDirectURL, getGoogleMyMapsInstructions } from '@/lib/exportLinks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Map, Link2, BookOpen, Copy, Check, Upload } from 'lucide-react';

interface ExportButtonsProps {
  locations: GeocodedLocation[];
  collectionName: string;
}

export default function ExportButtons({ locations, collectionName }: ExportButtonsProps) {
  const [showInstructions, setShowInstructions] = useState(false);
  const [copied, setCopied] = useState(false);

  const validLocations = locations.filter(
    loc => loc.geocodeStatus === 'success' && loc.latitude && loc.longitude
  );

  if (validLocations.length === 0) {
    return null;
  }

  const handleGPXExport = () => {
    downloadGPX(locations, collectionName || 'locations');
  };

  const handleKMLExport = () => {
    downloadKML(locations, collectionName || 'locations');
  };

  const handleGoogleMapsLink = () => {
    const url = generateGoogleMapsURL(locations);
    if (url) {
      window.open(url, '_blank');
    }
  };

  const handleCopyInstructions = () => {
    navigator.clipboard.writeText(getGoogleMyMapsInstructions());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const canCreateLink = canCreateDirectURL(locations);

  return (
    <Card className="animate-slide-up stagger-3">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          <CardTitle>Export Options</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* GPX Export */}
          <Button
            onClick={handleGPXExport}
            variant="outline"
            className="flex flex-col items-center gap-2 h-auto p-4 bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30"
          >
            <Download className="h-6 w-6 text-emerald-500" />
            <span className="text-sm font-medium">GPX File</span>
            <span className="text-xs text-muted-foreground">Universal format</span>
          </Button>

          {/* KML Export */}
          <Button
            onClick={handleKMLExport}
            variant="outline"
            className="flex flex-col items-center gap-2 h-auto p-4 bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/30"
          >
            <Map className="h-6 w-6 text-blue-500" />
            <span className="text-sm font-medium">KML File</span>
            <span className="text-xs text-muted-foreground">Google My Maps</span>
          </Button>

          {/* Google Maps Link */}
          <Button
            onClick={handleGoogleMapsLink}
            disabled={!canCreateLink}
            variant="outline"
            className="flex flex-col items-center gap-2 h-auto p-4 bg-red-500/10 hover:bg-red-500/20 border-red-500/30 disabled:opacity-50"
          >
            <Link2 className="h-6 w-6 text-red-500" />
            <span className="text-sm font-medium">Google Maps</span>
            <span className="text-xs text-muted-foreground">
              {canCreateLink ? 'Direct link' : `${validLocations.length} > 15 limit`}
            </span>
          </Button>

          {/* Instructions */}
          <Button
            onClick={() => setShowInstructions(!showInstructions)}
            variant="outline"
            className="flex flex-col items-center gap-2 h-auto p-4 bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/30"
          >
            <BookOpen className="h-6 w-6 text-purple-500" />
            <span className="text-sm font-medium">Instructions</span>
            <span className="text-xs text-muted-foreground">How to import</span>
          </Button>
        </div>

        {/* Instructions Panel */}
        {showInstructions && (
          <div className="p-4 rounded-lg bg-muted border">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium">Import Instructions</h3>
              <Button
                onClick={handleCopyInstructions}
                variant="secondary"
                size="sm"
              >
                {copied ? (
                  <>
                    <Check className="mr-2 h-3 w-3" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-3 w-3" />
                    Copy
                  </>
                )}
              </Button>
            </div>

            <div className="space-y-4 text-sm text-muted-foreground">
              <div>
                <h4 className="font-medium text-foreground mb-1 flex items-center gap-2">
                  <Map className="h-4 w-4" />
                  Google My Maps (Recommended)
                </h4>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Download the KML file above</li>
                  <li>Go to <a href="https://google.com/mymaps" target="_blank" className="text-primary hover:underline">google.com/mymaps</a></li>
                  <li>Click &quot;Create a new map&quot;</li>
                  <li>Click &quot;Import&quot; in the left panel</li>
                  <li>Upload the KML file</li>
                  <li>Your map syncs to Google Maps app!</li>
                </ol>
              </div>

              <div>
                <h4 className="font-medium text-foreground mb-1 flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Apple Maps
                </h4>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Download the GPX file above</li>
                  <li>AirDrop or save to iPhone Files</li>
                  <li>Open the GPX file → &quot;Open in Maps&quot;</li>
                  <li>Locations appear as waypoints</li>
                </ol>
                <p className="mt-2 text-xs text-amber-500">
                  Apple Maps doesn&apos;t save these permanently. Consider using Pocket Earth or Maps.me apps for better GPX support.
                </p>
              </div>
            </div>
          </div>
        )}

        <p className="text-xs text-muted-foreground text-center">
          {validLocations.length} locations ready to export
        </p>
      </CardContent>
    </Card>
  );
}

