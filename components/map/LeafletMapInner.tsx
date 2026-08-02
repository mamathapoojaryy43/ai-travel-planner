"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { MapMarkerItem } from "@/components/map/OpenStreetMapComponent";
import { getOpenStreetMapUrl } from "@/lib/open-street-map";
import { Navigation, Star, MapPin } from "lucide-react";

// Fix for default Leaflet marker icon paths in Next.js bundlers
const createCustomIcon = (type: "Hotel" | "Attraction" | "Restaurant") => {
  const color = type === "Hotel" ? "#8b5cf6" : type === "Restaurant" ? "#f59e0b" : "#ec4899";
  
  return L.divIcon({
    className: "custom-leaflet-marker",
    html: `<div style="
      background-color: ${color};
      width: 28px;
      height: 28px;
      border-radius: 50%;
      border: 3px solid #ffffff;
      box-shadow: 0 4px 10px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="width: 8px; height: 8px; background: white; border-radius: 50%;"></div>
    </div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });
};

function MapBoundsAdjuster({ markers }: { markers: MapMarkerItem[] }) {
  const map = useMap();

  useEffect(() => {
    if (markers.length > 0) {
      const bounds = L.latLngBounds(markers.map((m) => [m.lat, m.lng]));
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    }
  }, [markers, map]);

  return null;
}

export function LeafletMapInner({ markers }: { markers: MapMarkerItem[] }) {
  const centerLat = markers[0]?.lat || 48.8566;
  const centerLng = markers[0]?.lng || 2.3522;

  return (
    <MapContainer
      center={[centerLat, centerLng]}
      zoom={13}
      scrollWheelZoom={false}
      style={{ height: "100%", width: "100%", zIndex: 1 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapBoundsAdjuster markers={markers} />

      {markers.map((marker) => {
        const directionsUrl = getOpenStreetMapUrl(marker.lat, marker.lng);

        return (
          <Marker
            key={marker.id}
            position={[marker.lat, marker.lng]}
            icon={createCustomIcon(marker.type)}
          >
            <Popup className="custom-leaflet-popup">
              <div className="p-1 space-y-2 max-w-[220px]">
                <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-1">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full text-white ${
                      marker.type === "Hotel"
                        ? "bg-purple-600"
                        : marker.type === "Restaurant"
                        ? "bg-amber-500"
                        : "bg-pink-600"
                    }`}
                  >
                    {marker.type}
                  </span>
                  {marker.rating && (
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-0.5">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400 inline" />
                      {marker.rating}
                    </span>
                  )}
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 text-xs leading-snug">{marker.title}</h4>
                  {marker.address && (
                    <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5 truncate">
                      <MapPin className="h-3 w-3 text-rose-500 shrink-0 inline" />
                      <span className="truncate">{marker.address}</span>
                    </p>
                  )}
                </div>

                {marker.details && (
                  <p className="text-[11px] text-slate-600 line-clamp-2 leading-tight">
                    {marker.details}
                  </p>
                )}

                <div className="pt-1.5 border-t border-slate-100">
                  <a
                    href={directionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-700 hover:text-purple-900"
                  >
                    <Navigation className="h-3 w-3" />
                    <span>View Directions</span>
                  </a>
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
