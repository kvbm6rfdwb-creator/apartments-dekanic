'use client';
import { useState, useEffect, useRef } from 'react';

const MAPBOX_TOKEN = 'pk.eyJ1Ijoiam9uaHkyMjU0IiwiYSI6ImNtb3dzcTE5eDA0dHQycHI1NHFlMHh3dWIifQ.VK5P8tp6rfGqHaHLXCEd3Q';

function MapboxMap({ lat, lng }: { lat: number; lng: number }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Load Mapbox CSS
    if (!document.querySelector('link[href*="mapbox-gl"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://api.mapbox.com/mapbox-gl-js/v3.3.0/mapbox-gl.css';
      document.head.appendChild(link);
    }

    // Load Mapbox JS then initialise map
    const initMap = () => {
      const mapboxgl = (window as any).mapboxgl;
      if (!mapboxgl) return;
      mapboxgl.accessToken = MAPBOX_TOKEN;

      const map = new mapboxgl.Map({
        container: containerRef.current!,
        style: 'mapbox://styles/mapbox/satellite-streets-v12',
        center: [lng || 14.745222, lat || 44.9695],
        zoom: 14.5,
        scrollZoom: false,
        attributionControl: false,
      });

      map.addControl(new mapboxgl.AttributionControl({ compact: true }), 'bottom-right');
      map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right');

      // Custom warm-toned pin marker
      const el = document.createElement('div');
      el.style.cssText = [
        'width:42px',
        'height:42px',
        'border-radius:50% 50% 50% 0',
        'background:#b97a3a',
        'border:3px solid white',
        'transform:rotate(-45deg)',
        'box-shadow:0 4px 18px rgba(185,122,58,0.5)',
        'cursor:pointer',
        'transition:transform 0.15s ease',
      ].join(';');
      el.onmouseenter = () => { el.style.transform = 'rotate(-45deg) scale(1.12)'; };
      el.onmouseleave = () => { el.style.transform = 'rotate(-45deg) scale(1)'; };

      new mapboxgl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat([lng, lat])
        .setPopup(
          new mapboxgl.Popup({ offset: 28, closeButton: false })
            .setHTML(
              '<div style="font-family:Georgia,serif;padding:4px 2px">' +
              '<p style="font-size:13px;font-weight:600;color:#443932;margin:0">Apartments Dekani</p>' +
              '<p style="font-size:11px;color:#9a7a5a;margin:4px 0 0">Baška, Island Krk · Croatia</p>' +
              '</div>'
            )
        )
        .addTo(map);
    };

    if ((window as any).mapboxgl) {
      initMap();
    } else {
      const script = document.createElement('script');
      script.src = 'https://api.mapbox.com/mapbox-gl-js/v3.3.0/mapbox-gl.js';
      script.onload = initMap;
      document.head.appendChild(script);
    }
  }, []);

  return <div ref={containerRef} className="w-full h-full" />;
}

export default function Location() {
  const [coords, setCoords] = useState({ lat: 44.9695, lng: 14.745222 });
  const [address, setAddress] = useState('Skopalj 19, Baška, Otok Krk');

  useEffect(() => {
    fetch('/api/site-data')
      .then(r => r.json())
      .then(d => {
        const lat = d?.property?.mapLat ?? d?.property?.lat;
        const lng = d?.property?.mapLng ?? d?.property?.lng;
        if (lat && lng) setCoords({ lat: Number(lat), lng: Number(lng) });
        if (d?.property?.address) setAddress(d.property.address);
      })
      .catch(() => {});
  }, []);

  const directionsUrl =
    `https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lng}` +
    `&destination_place_id=Skopalj19Ba%C5%A1ka%2C1kaCroatia`;

  return (
    <section id="location" className="py-12 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">

          {/* Left: text */}
          <div className="">
            <p className="text-sand-600 text-xs tracking-[.3em] uppercase font-semibold mb-3">Location</p>
            <h2 className="font-serif text-4xl md:text-5xl text-stone-900 font-light mb-5">Find Us in Baška</h2>
            <p className="text-stone-500 text-lg leading-relaxed mb-6">
              {address} — a short walk from the famous 1.8 km Baška sandy beach, restaurants, and the old town.
            </p>

            <div className="space-y-3 mb-8">
              {([
                ['🏖️', 'Baška Beach', '5 min walk'],
                ['🛒', 'Supermarket & shops', '3 min walk'],
                ['⛴️', 'Ferry to Lopar', '20 min drive'],
                ['✈️', 'Rijeka Airport', '45 min drive'],
              ] as [string, string, string][]).map(([icon, place, time]) => (
                <div key={place} className="flex items-center gap-3 text-stone-600 text-sm">
                  <span className="text-xl">{icon}</span>
                  <span className="font-medium text-stone-800">{place}</span>
                  <span className="text-stone-300 mx-1">·</span>
                  <span className="text-stone-500">{time}</span>
                </div>
              ))}
            </div>

            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-stone-900 hover:bg-sand-700 text-white font-semibold rounded-full transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg text-sm"
            >
              Get Directions
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </a>
          </div>

          {/* Right: Mapbox map */}
          <div className="rounded-3xl overflow-hidden shadow-xl h-80 lg:h-[480px] border border-sand-100">
            <MapboxMap lat={coords.lat} lng={coords.lng} />
          </div>

        </div>
      </div>
    </section>
  );
}
