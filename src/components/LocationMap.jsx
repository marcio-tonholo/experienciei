import { useEffect, useRef, useMemo } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

function seededRnd(str) {
  let h = 2166136261 >>> 0
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619) >>> 0
  }
  return h / 0xFFFFFFFF
}

// Offset ±~200 m per axis (0.0018°) — max diagonal displacement ≈ 283 m < 500 m radius
const OFFSET_DEG = 0.0018

export default function LocationMap({ lat, lng, offeringId }) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)

  const center = useMemo(() => {
    const dlat = (seededRnd(offeringId)         - 0.5) * 2 * OFFSET_DEG
    const dlng = (seededRnd(offeringId + 'lng') - 0.5) * 2 * OFFSET_DEG
    return [lat + dlat, lng + dlng]
  }, [lat, lng, offeringId])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const map = L.map(container, {
      center,
      zoom: 14,
      zoomControl: false,
      scrollWheelZoom: false,
      attributionControl: false,
      dragging: true,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map)

    L.circle(center, {
      radius: 500,
      color: '#1E3A8A',
      fillColor: '#2563EB',
      fillOpacity: 0.12,
      weight: 2,
    }).addTo(map)

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div
      ref={containerRef}
      className="rounded-xl overflow-hidden border border-[#E2E8F0]"
      style={{ height: 240, position: 'relative', zIndex: 0 }}
    />
  )
}
