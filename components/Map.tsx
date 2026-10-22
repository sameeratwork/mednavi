'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ExternalLink, Phone, Navigation, Building2, Stethoscope } from 'lucide-react';

interface ClinicMapItem {
  id: string;
  name_ja: string;
  name_en?: string | null;
  type: string;
  lat: number;
  lng: number;
  address: string;
  phone?: string | null;
  languages_supported?: string[];
  how_to_book?: string;
}

interface MapProps {
  clinics: ClinicMapItem[];
  selectedClinicId?: string | null;
  onSelectClinic?: (id: string) => void;
  center?: [number, number];
  zoom?: number;
}

// Client-only dynamic inner map component
const MapInner = dynamic(
  () =>
    import('react-leaflet').then(async (mod) => {
      const L = (await import('leaflet')).default;
      
      // Fix leaflet marker asset paths in webpack/Next.js
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const { MapContainer, TileLayer, Marker, Popup, useMap } = mod;

      // Controller component to smoothly fly to selected clinic
      function FlyToSelected({ selectedClinic }: { selectedClinic?: ClinicMapItem | null }) {
        const map = useMap();
        useEffect(() => {
          if (selectedClinic && selectedClinic.lat && selectedClinic.lng) {
            map.flyTo([selectedClinic.lat, selectedClinic.lng], 15, { duration: 1.2 });
          }
        }, [selectedClinic, map]);
        return null;
      }

      return function InnerMap({ clinics, selectedClinicId, onSelectClinic, center, zoom }: MapProps) {
        const defaultCenter: [number, number] = center || [35.6762, 139.7500]; // Central Tokyo
        const selectedClinic = clinics.find((c) => c.id === selectedClinicId);

        // Custom SVG icons for hospitals vs clinics
        const createCustomIcon = (isHospital: boolean, isSelected: boolean) => {
          const bg = isHospital ? '#4338CA' : '#0D9488'; // Indigo for hospital, Teal for clinic
          const stroke = isSelected ? '#F59E0B' : '#FFFFFF';
          const size = isSelected ? 40 : 32;

          return L.divIcon({
            className: 'custom-map-pin',
            html: `
              <div style="
                background-color: ${bg};
                width: ${size}px;
                height: ${size}px;
                border-radius: 50% 50% 50% 0;
                transform: rotate(-45deg);
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                border: 2.5px solid ${stroke};
                cursor: pointer;
                transition: transform 0.2s;
              ">
                <div style="transform: rotate(45deg); color: white; font-weight: bold; font-size: 13px;">
                  ${isHospital ? 'H' : '✚'}
                </div>
              </div>
            `,
            iconSize: [size, size],
            iconAnchor: [size / 2, size],
            popupAnchor: [0, -size],
          });
        };

        return (
          <div className="relative w-full h-full rounded-2xl overflow-hidden border border-navy-200 shadow-card">
            <link
              rel="stylesheet"
              href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
              integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
              crossOrigin=""
            />
            <MapContainer
              center={defaultCenter}
              zoom={zoom || 13}
              scrollWheelZoom={true}
              className="w-full h-full min-h-[420px]"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <FlyToSelected selectedClinic={selectedClinic} />

              {clinics.map((clinic) => {
                if (!clinic.lat || !clinic.lng) return null;
                const isHospital = clinic.type?.toLowerCase() === 'hospital';
                const isSelected = clinic.id === selectedClinicId;

                return (
                  <Marker
                    key={clinic.id}
                    position={[clinic.lat, clinic.lng]}
                    icon={createCustomIcon(isHospital, isSelected)}
                    eventHandlers={{
                      click: () => {
                        if (onSelectClinic) onSelectClinic(clinic.id);
                      },
                    }}
                  >
                    <Popup className="mednavi-custom-popup">
                      <div className="p-1 max-w-[240px]">
                        <div className="flex items-center space-x-1.5 mb-1">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              isHospital
                                ? 'bg-indigo-100 text-indigo-800'
                                : 'bg-teal-100 text-teal-800'
                            }`}
                          >
                            {isHospital ? 'Hospital' : 'Clinic'}
                          </span>
                          {clinic.languages_supported?.includes('hi') && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                              🇮🇳 Hindi Support
                            </span>
                          )}
                          {clinic.languages_supported?.includes('en') && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                              EN
                            </span>
                          )}
                        </div>
                        <h4 className="font-bold text-sm text-navy-900 leading-snug">
                          {clinic.name_en || clinic.name_ja}
                        </h4>
                        <p className="text-xs text-navy-600 font-jp mb-1">{clinic.name_ja}</p>
                        <p className="text-[11px] text-navy-500 line-clamp-2 mb-2">
                          {clinic.address}
                        </p>
                        {clinic.phone && (
                          <div className="flex items-center space-x-1 text-xs text-navy-700 font-medium mb-2">
                            <Phone className="w-3 h-3 text-brand-600" />
                            <span>{clinic.phone}</span>
                          </div>
                        )}
                        <div className="flex space-x-1.5 pt-1 border-t border-navy-100">
                          <Link
                            href={`/clinics/${clinic.id}`}
                            className="flex-1 text-center py-1 px-2 rounded bg-brand-600 hover:bg-brand-700 text-white text-[11px] font-semibold transition-colors"
                          >
                            View Details
                          </Link>
                          <Link
                            href={`/visit-planner?clinicId=${clinic.id}`}
                            className="text-center py-1 px-2 rounded bg-navy-100 hover:bg-navy-200 text-navy-800 text-[11px] font-medium transition-colors"
                          >
                            Plan Visit
                          </Link>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>
        );
      };
    }),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[420px] bg-navy-50 rounded-2xl flex flex-col items-center justify-center border border-navy-200 text-navy-500 animate-pulse">
        <Navigation className="w-8 h-8 text-brand-500 animate-spin mb-2" />
        <p className="text-xs font-medium">Loading interactive OpenStreetMap...</p>
      </div>
    ),
  }
);

export default function Map(props: MapProps) {
  return <MapInner {...props} />;
}
