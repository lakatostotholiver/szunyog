import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// A Leaflet alapértelmezett ikonja bundler alatt nem találja a képeit,
// ezért kézzel adjuk meg az importált útvonalakat.
const icon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const TOROKBALINT = [47.4306, 18.9106];
const round = (n) => Math.round(n * 1e6) / 1e6;

/**
 * Térképes helykijelölő OpenStreetMap alaptérképpel.
 * Kattintásra elhelyezi a jelölőt, a jelölő húzható, és a böngésző
 * helymeghatározásával is kitölthető.
 */
export default function LocationPicker({ lat, lng, onChange, height = 320 }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const onChangeRef = useRef(onChange);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState('');

  // A friss callback mindig elérhető legyen, de ne építse újra a térképet.
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (mapRef.current || !containerRef.current) return undefined;

    const map = L.map(containerRef.current, { scrollWheelZoom: false }).setView(
      lat && lng ? [lat, lng] : TOROKBALINT,
      lat && lng ? 17 : 13
    );

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    const place = (latlng) => {
      const value = { lat: round(latlng.lat), lng: round(latlng.lng) };
      if (markerRef.current) {
        markerRef.current.setLatLng(latlng);
      } else {
        markerRef.current = L.marker(latlng, { icon, draggable: true }).addTo(map);
        markerRef.current.on('dragend', (e) => {
          const p = e.target.getLatLng();
          onChangeRef.current({ lat: round(p.lat), lng: round(p.lng) });
        });
      }
      onChangeRef.current(value);
    };

    map.on('click', (e) => place(e.latlng));
    if (lat && lng) place(L.latLng(lat, lng));

    mapRef.current = map;

    // A konténer méretét a térkép a beillesztés után méri – ha rejtve indult
    // (pl. űrlapváltás), egy invalidate nélkül szürke maradna.
    const raf = requestAnimationFrame(() => map.invalidateSize());

    return () => {
      cancelAnimationFrame(raf);
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // Szándékosan csak egyszer fut: a jelölőt a lenti effekt szinkronizálja.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Külső törlés/szerkesztés esetén igazítjuk a jelölőt.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (lat && lng) {
      const latlng = L.latLng(lat, lng);
      if (markerRef.current) {
        markerRef.current.setLatLng(latlng);
      } else {
        markerRef.current = L.marker(latlng, { icon, draggable: true }).addTo(map);
        markerRef.current.on('dragend', (e) => {
          const p = e.target.getLatLng();
          onChangeRef.current({ lat: round(p.lat), lng: round(p.lng) });
        });
      }
    } else if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }
  }, [lat, lng]);

  const locate = () => {
    if (!navigator.geolocation) {
      setError('A böngésző nem támogatja a helymeghatározást.');
      return;
    }
    setError('');
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        const value = { lat: round(pos.coords.latitude), lng: round(pos.coords.longitude) };
        onChangeRef.current(value);
        mapRef.current?.setView([value.lat, value.lng], 18);
      },
      () => {
        setLocating(false);
        setError('Nem sikerült meghatározni a helyzetet. Jelöld ki kézzel a térképen.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="location-picker">
      <div className="location-picker-toolbar">
        <button type="button" className="btn btn-outline btn-sm" onClick={locate} disabled={locating}>
          {locating ? 'Helymeghatározás…' : 'Itt vagyok most'}
        </button>
        {lat && lng ? (
          <>
            <span className="location-picker-coords">
              {lat.toFixed(5)}, {lng.toFixed(5)}
            </span>
            <button type="button" className="btn-link-danger" onClick={() => onChangeRef.current({ lat: null, lng: null })}>
              jelölés törlése
            </button>
          </>
        ) : (
          <span className="location-picker-coords">Nincs kijelölt pont</span>
        )}
      </div>

      <div ref={containerRef} className="location-picker-map" style={{ height }} />

      <p className="location-picker-hint">
        Kattints a térképre a pont kijelöléséhez, vagy húzd a jelölőt. A koordináta
        bizalmas – a nyilvános oldalra soha nem kerül ki.
      </p>
      {error && <p className="form-error">{error}</p>}
    </div>
  );
}
