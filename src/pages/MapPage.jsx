import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Viewer } from 'mapillary-js';
import 'mapillary-js/dist/mapillary.css';

const MapPage = () => {
  const mapillaryContainerRef = useRef(null);
  const mapboxContainerRef = useRef(null);
  const [imageIds, setImageIds] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const mapillaryAccessToken = 'MLY|9269492676456633|a6293e72d833fa0f80c33e4fb48d14f5';
  const mapboxAccessToken = 'pk.eyJ1IjoiYW5kcmVtZW5kb25jYSIsImEiOiJjbGxrMmRidjYyaGk4M21tZ2hhanFjMjVwIn0.4_fHgnbXRc1Hxg--Bs_kkg';

  const coordinates = [
    [-49.23243463, -25.45079973],
    [-49.23244804, -25.45083001],
    [-49.23247084, -25.45083364],
    [-49.23249498, -25.45082637],
    [-49.23252180, -25.45081790],
    [-49.23252985, -25.45083243],
    [-49.23250839, -25.45084454],
    [-49.23248425, -25.45085544],
    [-49.23247486, -25.45087844],
    [-49.23248693, -25.45091477],
    [-49.23250169, -25.45094384],
    [-49.23251510, -25.45097411],
    [-49.23252851, -25.45101165],
    [-49.23254058, -25.45103950],
    [-49.23256740, -25.45109399],
    [-49.23258349, -25.45112669],
    [-49.23260093, -25.45117513],
    [-49.23261434, -25.45119450],
    [-49.23263311, -25.45123810],
    [-49.23264921, -25.45127443],
    [-49.23266396, -25.45130470],
    [-49.23267469, -25.45132529],
    [-49.23268542, -25.45134103],
    [-49.23270285, -25.45136404],
    [-49.23267201, -25.45137130],
    [-49.23263177, -25.45138583],
    [-49.23258886, -25.45140400],
    [-49.23261166, -25.45146091]
  ];

  useEffect(() => {
    if (!mapillaryContainerRef.current || !mapboxContainerRef.current) return;

    const viewer = new Viewer({
      accessToken: mapillaryAccessToken,
      container: mapillaryContainerRef.current,
      imageId: '',
    });

    mapboxgl.accessToken = mapboxAccessToken;
    const map = new mapboxgl.Map({
      container: mapboxContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: coordinates[0],
      zoom: 18,
    });

    // Add markers for each coordinate
    coordinates.forEach((coord, index) => {
      const marker = new mapboxgl.Marker()
        .setLngLat(coord)
        .addTo(map);

      marker.getElement().addEventListener('click', () => {
        if (imageIds) {
          const ids = imageIds.split(',').map(id => id.trim());
          if (index < ids.length) {
            viewer.moveTo(ids[index]);
            setCurrentImageIndex(index);
          }
        }
      });
    });

    // Draw path on the map
    map.on('load', () => {
      map.addSource('route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: coordinates,
          },
        },
      });
      map.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': '#888',
          'line-width': 8,
        },
      });
    });

    return () => {
      viewer.remove();
      map.remove();
    };
  }, []);

  useEffect(() => {
    if (imageIds && mapillaryContainerRef.current) {
      const ids = imageIds.split(',').map(id => id.trim());
      if (ids.length > 0) {
        const viewer = new Viewer({
          accessToken: mapillaryAccessToken,
          container: mapillaryContainerRef.current,
          imageId: ids[0],
        });
        setCurrentImageIndex(0);
      }
    }
  }, [imageIds]);

  const handleImageIdsChange = (e) => {
    setImageIds(e.target.value);
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-none p-4">
        <input
          type="text"
          value={imageIds}
          onChange={handleImageIdsChange}
          placeholder="Enter Mapillary image IDs, separated by commas"
          className="w-full p-2 border rounded"
        />
      </div>
      <div className="flex-grow flex">
        <div ref={mapillaryContainerRef} className="w-1/2 h-full" />
        <div ref={mapboxContainerRef} className="w-1/2 h-full" />
      </div>
    </div>
  );
};

export default MapPage;