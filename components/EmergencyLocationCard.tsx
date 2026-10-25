'use client';

import React, { useState } from 'react';
import {
  Navigation,
  MapPin,
  ExternalLink,
  Copy,
  Check,
  AlertCircle,
  HelpCircle,
  Compass
} from 'lucide-react';

export default function EmergencyLocationCard() {
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<{
    lat: number;
    lng: number;
    accuracy?: number;
    mapsUrl: string;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setErrorMsg('Geolocation is not supported by your browser.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const accuracy = position.coords.accuracy;
        const mapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;

        setLocation({
          lat,
          lng,
          accuracy: Math.round(accuracy),
          mapsUrl,
        });
        setLoading(false);
      },
      (error) => {
        setLoading(false);
        if (error.code === error.PERMISSION_DENIED) {
          setErrorMsg(
            'Location permission was denied. If calling 119, look for a nearby building number plate or utility pole: Japanese utility poles (電柱 / Denchū) have blue metal plates showing the exact street block address.'
          );
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          setErrorMsg(
            'GPS location information is currently unavailable on this device. Please check a nearby street sign or landmark.'
          );
        } else {
          setErrorMsg('Unable to retrieve location. Please check your device location settings.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleCopy = () => {
    if (!location) return;
    const text = `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)} (${location.mapsUrl})`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-navy-200 shadow-card space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center border border-brand-200">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-base text-navy-950">
              Current Location for 119 Dispatch
            </h3>
            <p className="text-xs text-navy-500">
              Accurate GPS coordinates to read out or show in an emergency
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGetLocation}
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-sm transition-all flex items-center space-x-1.5 disabled:opacity-50 shrink-0"
        >
          {loading ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Locating...</span>
            </>
          ) : (
            <>
              <Navigation className="w-3.5 h-3.5" />
              <span>{location ? 'Update GPS' : 'Get My Location'}</span>
            </>
          )}
        </button>
      </div>

      {/* Location Retrieved Display */}
      {location && (
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-navy-400 uppercase tracking-wider">
                GPS Coordinates (緯度・経度)
              </span>
              <p className="font-mono font-bold text-sm text-navy-900">
                {location.lat.toFixed(5)}° N, {location.lng.toFixed(5)}° E
                {location.accuracy && (
                  <span className="text-xs text-navy-500 font-sans font-normal ml-2">
                    (Accuracy &plusmn;{location.accuracy}m)
                  </span>
                )}
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleCopy}
                className="px-3 py-1.5 rounded-lg border border-navy-200 bg-white hover:bg-navy-50 text-navy-700 font-semibold text-xs flex items-center space-x-1 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>

              <a
                href={location.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-navy-900 hover:bg-navy-800 text-white font-semibold text-xs flex items-center space-x-1 transition-colors"
              >
                <span>Google Maps</span>
                <ExternalLink className="w-3 h-3 ml-0.5" />
              </a>
            </div>
          </div>

          {/* Phonetic phrase to read to operator */}
          <div className="p-3 bg-white rounded-xl border border-navy-100 text-xs space-y-1">
            <span className="text-[10px] font-bold text-brand-700 uppercase">
              Phonetic phrase for dispatcher / Japanese speaker:
            </span>
            <p className="font-bold text-navy-950 font-jp">
              「現在地の座標は、北緯 {location.lat.toFixed(3)}度、東経 {location.lng.toFixed(3)}度 付近です」
            </p>
            <p className="text-[11px] text-navy-500 font-mono">
              &quot;Genzaichi no zahyō wa, hokui {location.lat.toFixed(2)}–do, tōkei {location.lng.toFixed(2)}–do fukin desu&quot;
            </p>
          </div>
        </div>
      )}

      {/* Friendly Error / Denied Permission Message */}
      {errorMsg && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 space-y-2 animate-in fade-in">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{errorMsg}</p>
          </div>
          <div className="p-2.5 bg-white/80 rounded-xl border border-amber-100 text-[11px] text-navy-700 space-y-0.5">
            <span className="font-bold text-navy-900">💡 Tip for finding your address in Japan:</span>
            <p>
              Look at the nearest concrete utility pole (電柱 / Denchū) on the street. Near eye level, you will find a small blue metal plaque with the town name and lot number (e.g. 港区六本木6-10).
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
