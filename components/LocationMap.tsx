'use client';

import { useEffect, useRef, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import { GeocodedLocation } from '@/types/location';
import { getCategoryColor, getCategoryEmoji } from '@/lib/categoryColors';

interface LocationMapProps {
  locations: GeocodedLocation[];
  selectedLocationId: string | null;
  onLocationSelect: (location: GeocodedLocation) => void;
}

export default function LocationMap({ 
  locations, 
  selectedLocationId,
  onLocationSelect 
}: LocationMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const popupRef = useRef<mapboxgl.Popup | null>(null);
  const hoverPopupRef = useRef<mapboxgl.Popup | null>(null);

  const validLocations = locations.filter(
    loc => loc.geocodeStatus === 'success' && loc.latitude && loc.longitude
  );

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) {
      console.error('Mapbox token not found');
      return;
    }

    mapboxgl.accessToken = token;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-96.7266, 17.0732], // Default to Oaxaca
      zoom: 12,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Create popup content
  const createPopupContent = useCallback((location: GeocodedLocation) => {
    return `
      <div style="font-family: Helvetica, 'Helvetica Neue', Arial, sans-serif;">
        <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #000;">
          ${getCategoryEmoji(location.category)} ${location.name}
        </h3>
        <div style="margin-bottom: 8px;">
          <span style="
            display: inline-block;
            padding: 2px 8px;
            border-radius: 9999px;
            font-size: 12px;
            font-weight: 500;
            color: white;
            background-color: ${getCategoryColor(location.category)};
          ">
            ${location.category}
          </span>
          ${location.neighborhood ? `<span style="margin-left: 8px; font-size: 12px; color: #666;">${location.neighborhood}</span>` : ''}
        </div>
        ${location.notes ? `<p style="margin: 0; font-size: 13px; color: #555; line-height: 1.4;">${location.notes}</p>` : ''}
      </div>
    `;
  }, []);

  const createTooltipContent = useCallback((location: GeocodedLocation) => {
    return `
      <div style="font-family: Helvetica, 'Helvetica Neue', Arial, sans-serif; font-size: 12px; color: #000;">
        ${getCategoryEmoji(location.category)} ${location.name}
      </div>
    `;
  }, []);

  const openLockedPopup = useCallback((location: GeocodedLocation, flyTo = false) => {
    if (!map.current || !location.longitude || !location.latitude) return;

    if (hoverPopupRef.current) {
      hoverPopupRef.current.remove();
      hoverPopupRef.current = null;
    }

    if (popupRef.current) {
      popupRef.current.remove();
    }

    popupRef.current = new mapboxgl.Popup({ offset: 25, closeOnClick: false })
      .setLngLat([location.longitude, location.latitude])
      .setHTML(createPopupContent(location))
      .addTo(map.current);

    if (flyTo) {
      map.current.flyTo({
        center: [location.longitude, location.latitude],
        zoom: 16,
        duration: 1000,
      });
    }
  }, [createPopupContent]);

  // Update markers when locations change
  useEffect(() => {
    if (!map.current) return;

    // Clear existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    // Add new markers
    validLocations.forEach(location => {
      if (!location.latitude || !location.longitude) return;

      // Create custom marker element
      const el = document.createElement('div');
      el.className = 'custom-marker';
      el.style.cssText = `
        width: 32px;
        height: 32px;
        pointer-events: auto;
      `;

      const inner = document.createElement('div');
      inner.className = 'custom-marker-inner';
      inner.style.cssText = `
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background-color: ${getCategoryColor(location.category)};
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        transition: transform 0.2s ease;
        transform-origin: center;
      `;
      inner.innerHTML = getCategoryEmoji(location.category);
      el.appendChild(inner);
      
      el.addEventListener('mouseenter', () => {
        inner.style.transform = 'scale(1.2)';

        if (selectedLocationId === location.id) return;
        if (hoverPopupRef.current) {
          hoverPopupRef.current.remove();
        }
        hoverPopupRef.current = new mapboxgl.Popup({
          offset: 18,
          closeButton: false,
          closeOnClick: false,
          className: 'mapboxgl-tooltip',
        })
          .setLngLat([location.longitude!, location.latitude!])
          .setHTML(createTooltipContent(location))
          .addTo(map.current!);
      });
      el.addEventListener('mouseleave', () => {
        inner.style.transform = 'scale(1)';
        if (hoverPopupRef.current) {
          hoverPopupRef.current.remove();
          hoverPopupRef.current = null;
        }
      });

      const marker = new mapboxgl.Marker({
        element: el,
        anchor: 'center'
      })
        .setLngLat([location.longitude, location.latitude])
        .addTo(map.current!);

      // Add click handler
      el.addEventListener('click', () => {
        onLocationSelect(location);
        openLockedPopup(location, true);
      });

      markers.current.push(marker);
    });

    // Fit map to show all markers
    if (validLocations.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      validLocations.forEach(loc => {
        if (loc.longitude && loc.latitude) {
          bounds.extend([loc.longitude, loc.latitude]);
        }
      });
      
      map.current.fitBounds(bounds, {
        padding: 50,
        maxZoom: 15,
        duration: 1000,
      });
    }
  }, [validLocations, createTooltipContent, onLocationSelect, openLockedPopup, selectedLocationId]);

  // Handle selected location change
  useEffect(() => {
    if (!map.current || !selectedLocationId) return;

    const location = validLocations.find(l => l.id === selectedLocationId);
    if (location && location.latitude && location.longitude) {
      openLockedPopup(location, true);
    }
  }, [selectedLocationId, validLocations, openLockedPopup]);

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden animate-slide-up stagger-2">
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          🗺️ Map Preview
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {validLocations.length} locations shown
        </p>
      </div>
      
      <div 
        ref={mapContainer} 
        className="w-full h-[500px]"
        style={{ minHeight: '400px' }}
      />
    </div>
  );
}
