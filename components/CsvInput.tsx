'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Loader2, Search } from 'lucide-react';

interface CsvInputProps {
  onParse: (csvText: string) => void;
  isLoading: boolean;
}

const SAMPLE_CSV = `Name,Category,Neighborhood/Area,City,State,Country,Notes
La Mezcalerita,Bar,Ruta Independencia,Oaxaca de Juárez,Oaxaca,Mexico,Rooftop bar with great views
Boulenc,Bakery,Centro,Oaxaca de Juárez,Oaxaca,Mexico,Excellent bakery and restaurant
Mercado 20 de Noviembre,Market,Centro,Oaxaca de Juárez,Oaxaca,Mexico,Main food market
Monte Albán,Day Trip,Outside City,Oaxaca,Oaxaca,Mexico,Zapotec ruins with views`;

export default function CsvInput({ onParse, isLoading }: CsvInputProps) {
  const [csvText, setCsvText] = useState('');

  const handleSubmit = () => {
    if (csvText.trim()) {
      onParse(csvText);
    }
  };

  const handleLoadSample = () => {
    setCsvText(SAMPLE_CSV);
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            <CardTitle>Paste Your CSV</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLoadSample}
          >
            Load sample data
          </Button>
        </div>
        <CardDescription>
          Format: <code className="bg-muted px-1.5 py-0.5 rounded text-xs">
            Name,Category,Neighborhood/Area,City,State,Country,Notes
          </code>
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <Textarea
          value={csvText}
          onChange={(e) => setCsvText(e.target.value)}
          placeholder={`Name,Category,Neighborhood/Area,City,State,Country,Notes
La Mezcalerita,Bar,Ruta Independencia,Oaxaca de Juárez,Oaxaca,Mexico,Rooftop bar with great views
...`}
          className="h-64 font-mono text-sm resize-none"
          disabled={isLoading}
        />

        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {csvText.split('\n').filter(l => l.trim()).length - 1} locations detected
          </p>

          <Button
            onClick={handleSubmit}
            disabled={!csvText.trim() || isLoading}
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Geocoding...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Geocode Locations
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

