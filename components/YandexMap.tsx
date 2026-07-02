'use client';

import { useEffect, useRef, useState } from 'react';

interface YandexMapProps {
  onAddressSelect: (address: string, coordinates: [number, number]) => void;
  initialCoordinates?: [number, number];
}

declare global {
  interface Window {
    ymaps: any;
  }
}

export function YandexMap({ onAddressSelect, initialCoordinates = [55.0456, 60.1083] }: YandexMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [placemark, setPlacemark] = useState<any>(null);

  useEffect(() => {
    const loadYandexMaps = () => {
      if (window.ymaps) {
        initMap();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://api-maps.yandex.ru/2.1/?apikey=2943d94b-ef48-4e84-8352-0c12a4af0c5d&lang=ru_RU';
      script.onload = () => {
        window.ymaps.ready(initMap);
      };
      document.head.appendChild(script);
    };

    const initMap = () => {
      window.ymaps.ready(() => {
        const newMap = new window.ymaps.Map(mapRef.current, {
          center: initialCoordinates,
          zoom: 12,
          controls: ['zoomControl']
        });

        const newPlacemark = new window.ymaps.Placemark(initialCoordinates, {}, {
          preset: 'islands#blueDotIcon'
        });

        newMap.geoObjects.add(newPlacemark);
        setMap(newMap);
        setPlacemark(newPlacemark);

        // Обработчик клика по карте
        newMap.events.add('click', (e: any) => {
          const coords = e.get('coords');
          newPlacemark.geometry.setCoordinates(coords);

          // Обратное геокодирование
          window.ymaps.geocode(coords).then((res: any) => {
            const firstGeoObject = res.geoObjects.get(0);
            const address = firstGeoObject.getAddressLine();
            onAddressSelect(address, coords);
          });
        });
      });
    };

    loadYandexMaps();

    return () => {
      if (map) {
        map.destroy();
      }
    };
  }, []);

  const updateMapCenter = (coordinates: [number, number]) => {
    if (map && placemark) {
      map.setCenter(coordinates, 15);
      placemark.geometry.setCoordinates(coordinates);
    }
  };

  useEffect(() => {
    if (initialCoordinates) {
      updateMapCenter(initialCoordinates);
    }
  }, [initialCoordinates]);

  return (
    <div className="w-full h-64 rounded-lg overflow-hidden shadow-md">
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
}
