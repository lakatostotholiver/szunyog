import { useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import '../lib/leafletIcons';

// Törökbálint központja – alapértelmezett térkép-középpont, amíg nincs kiválasztott hely.
const DEFAULT_CENTER = { lat: 47.4333, lng: 18.9167 };

function ClickHandler({ onSelect }) {
  useMapEvents({
    click(e) {
      onSelect({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

export default function LocationPicker({ value, onChange }) {
  const mapRef = useRef(null);
  const [geoError, setGeoError] = useState('');
  const [locating, setLocating] = useState(false);

  const handleGeolocate = () => {
    if (!navigator.geolocation) {
      setGeoError('A böngésződ nem támogatja a helymeghatározást.');
      return;
    }
    setGeoError('');
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const next = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        onChange(next);
        mapRef.current?.flyTo([next.lat, next.lng], 17);
        setLocating(false);
      },
      () => {
        setGeoError('Nem sikerült lekérni a jelenlegi helyzeted.');
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const center = value ?? DEFAULT_CENTER;

  return (
    <div className="location-picker">
      <div className="location-picker-toolbar">
        <button type="button" className="btn btn-outline" onClick={handleGeolocate} disabled={locating}>
          {locating ? 'Helyzet lekérése…' : '📍 Saját helyzetem'}
        </button>
        {value && (
          <span className="location-picker-coords">
            {value.lat.toFixed(5)}, {value.lng.toFixed(5)}
          </span>
        )}
      </div>
      {geoError && <p className="form-error">{geoError}</p>}

      <MapContainer
        ref={mapRef}
        center={[center.lat, center.lng]}
        zoom={13}
        className="location-picker-map"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> közreműködők'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {value && <Marker position={[value.lat, value.lng]} />}
        <ClickHandler onSelect={onChange} />
      </MapContainer>
      <p className="location-picker-hint">Kattints a térképre a pontos hely megadásához, vagy használd a GPS gombot.</p>
    </div>
  );
}
