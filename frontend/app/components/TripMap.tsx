'use client'

import { useEffect, useRef } from 'react'
import { Loader } from '@googlemaps/js-api-loader'
import { Place } from '../types/trip'

interface TripMapProps {
  places: Place[]
}

export default function TripMap({ places }: TripMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)

  useEffect(() => {
    const initMap = async () => {
      const loader = new Loader({
        apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
        version: 'weekly',
        libraries: ['places']
      })

      try {
        await loader.load()
        
        if (!mapRef.current) return

        // 기본 위치 (서울)
        const defaultCenter = { lat: 37.5665, lng: 126.9780 }
        
        const map = new google.maps.Map(mapRef.current, {
          center: defaultCenter,
          zoom: 12,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            }
          ]
        })

        mapInstanceRef.current = map

        // 장소가 있으면 마커 추가
        if (places.length > 0) {
          const bounds = new google.maps.LatLngBounds()
          
          places.forEach((place, index) => {
            if (place.coordinates) {
              const marker = new google.maps.Marker({
                position: place.coordinates,
                map: map,
                title: place.name,
                label: {
                  text: (index + 1).toString(),
                  color: 'white',
                  fontWeight: 'bold'
                },
                icon: {
                  path: google.maps.SymbolPath.CIRCLE,
                  scale: 20,
                  fillColor: '#3B82F6',
                  fillOpacity: 1,
                  strokeColor: '#1D4ED8',
                  strokeWeight: 2
                }
              })

              const infoWindow = new google.maps.InfoWindow({
                content: `
                  <div class="p-2">
                    <h3 class="font-semibold text-gray-800">${place.name}</h3>
                    <p class="text-sm text-gray-600 mt-1">${place.description}</p>
                    <div class="mt-2 text-xs text-blue-600">${place.category} • ${place.estimatedTime}분</div>
                  </div>
                `
              })

              marker.addListener('click', () => {
                infoWindow.open(map, marker)
              })

              bounds.extend(place.coordinates)
            }
          })

          if (!bounds.isEmpty()) {
            map.fitBounds(bounds)
            
            // 줌이 너무 크면 조정
            google.maps.event.addListenerOnce(map, 'bounds_changed', () => {
              if (map.getZoom()! > 15) {
                map.setZoom(15)
              }
            })
          }
        }
      } catch (error) {
        console.error('지도 로딩 실패:', error)
      }
    }

    initMap()
  }, [places])

  return (
    <div className="w-full h-64 rounded-lg overflow-hidden bg-gray-100">
      <div ref={mapRef} className="w-full h-full" />
    </div>
  )
}