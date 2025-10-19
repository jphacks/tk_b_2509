"use client";
import { AdvancedMarker, APIProvider, Map } from '@vis.gl/react-google-maps';
// InfoWindow と useState は不要になったため削除
import { MapPopup } from './MapPopUp';
import type { MapPin, GoogleMapProps } from '@/lib/map-types';

export function GoogleMap({
  center = { lat: 35.6812, lng: 139.7671 },
  zoom = 12,
  pins = []
}: GoogleMapProps) {
  // useState は不要になったため削除
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Google Maps API Key Required</h2>
          <p className="text-gray-600 mb-4">
            Please add your Google Maps API key to the .env file:
          </p>
          <code className="block bg-gray-100 p-3 rounded text-sm">
            NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
          </code>
          <p className="text-gray-500 text-sm mt-4">
            Get your API key from the <a href="https://console.cloud.google.com/google/maps-apis" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Cloud Console</a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <APIProvider apiKey={apiKey}>
      <Map
        defaultCenter={center}
        defaultZoom={zoom}
        mapId="main-map"
        gestureHandling="greedy"
        disableDefaultUI={false}
        className="w-full h-full"
      >
        {pins.map((pin) => (
          // AdvancedMarkerがピンの位置を制御します
          <AdvancedMarker
            key={pin.id}
            position={pin.position}
          >
            {/* ピンと吹き出しをまとめるコンテナ */}
            <div className="relative flex flex-col items-center">
              {/* 吹き出しをピンの上に配置 */}
              <div className="absolute bottom-full mb-2 w-max">
                <MapPopup>
                  {pin.content}
                </MapPopup>
              </div>
              {/* ピン本体のUI */}
              <div className="w-8 h-8 bg-red-500 rounded-full border-4 border-white shadow-lg"></div>
            </div>
          </AdvancedMarker>
        ))}
      </Map>
    </APIProvider>
  );
}
