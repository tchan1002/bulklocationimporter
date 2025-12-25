export interface RawLocation {
  name: string;
  category: string;
  neighborhood: string;
  city: string;
  state: string;
  country: string;
  notes: string;
}

export interface GeocodedLocation extends RawLocation {
  id: string;
  latitude: number | null;
  longitude: number | null;
  geocodeStatus: 'pending' | 'success' | 'failed' | 'manual_required';
  geocodeQuery: string;
  errorMessage?: string;
}

export type CategoryType = 
  | 'Bar'
  | 'Food'
  | 'Cafe'
  | 'Bakery'
  | 'Dessert'
  | 'Chocolate'
  | 'Market'
  | 'Museum'
  | 'Cultural Space'
  | 'Garden'
  | 'Park'
  | 'Plaza'
  | 'Cemetery'
  | 'Day Trip'
  | 'Beach Trip'
  | 'Beach'
  | 'Other';

export interface ExportOptions {
  includeNotes: boolean;
  includeCategory: boolean;
  filename: string;
}

