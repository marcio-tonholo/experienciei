import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const PIN_HTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="32" height="48">
  <filter id="ds"><feDropShadow dx="0" dy="2" stdDeviation="1.5" flood-opacity="0.3"/></filter>
  <path filter="url(#ds)" d="M12 0C7.6 0 4 3.6 4 8c0 5.6 8 28 8 28S20 13.6 20 8C20 3.6 16.4 0 12 0z" fill="#1E3A8A"/>
  <circle cx="12" cy="8" r="3.5" fill="white"/>
</svg>`

const PIN_ICON = L.divIcon({ html: PIN_HTML, className: '', iconSize: [32, 48], iconAnchor: [16, 48] })

const BR_CENTER = [-15.8, -47.9]

function formatCity(address) {
  const city = address?.city || address?.town || address?.village || address?.municipality || ''
  const uf = (address?.['ISO3166-2-lvl4'] || '').replace('BR-', '')
  return city && uf ? `${city}, ${uf}` : city || uf || 'Brasil'
}

async function reverseGeocode(lat, lng) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
    { headers: { 'User-Agent': 'Experenciei/1.0' } }
  )
  const data = await res.json()
  return formatCity(data.address)
}

export default function LocationPicker({ lat, lng, onChange, onCityResolved }) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const markerRef = useRef(null)
  const onChangeRef = useRef(onChange)
  const onCityRef = useRef(onCityResolved)
  onChangeRef.current = onChange
  onCityRef.current = onCityResolved

  const [search, setSearch] = useState('')
  const [searching, setSearching] = useState(false)
  const [detectedCity, setDetectedCity] = useState('')

  const hasPin = lat != null && lng != null

  async function placePin(newLat, newLng) {
    onChangeRef.current(newLat, newLng)
    try {
      const city = await reverseGeocode(newLat, newLng)
      setDetectedCity(city)
      onCityRef.current?.(city)
    } catch {
      onCityRef.current?.('Brasil')
    }
  }

  // Initialize Leaflet map once per mount
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const map = L.map(container, {
      center: hasPin ? [lat, lng] : BR_CENTER,
      zoom: hasPin ? 14 : 4,
      scrollWheelZoom: false,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map)

    map.on('click', (e) => placePin(e.latlng.lat, e.latlng.lng))

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
      markerRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Keep marker in sync with lat/lng props
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    if (lat != null && lng != null) {
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng])
      } else {
        const marker = L.marker([lat, lng], { icon: PIN_ICON, draggable: true })
        marker.on('dragend', (e) => {
          const p = e.target.getLatLng()
          placePin(p.lat, p.lng)
        })
        marker.addTo(map)
        markerRef.current = marker
      }
    } else if (markerRef.current) {
      markerRef.current.remove()
      markerRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lat, lng])

  async function doSearch(e) {
    e.preventDefault()
    const q = search.trim()
    if (!q || !mapRef.current) return
    setSearching(true)
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1&countrycodes=br&addressdetails=1`,
        { headers: { 'User-Agent': 'Experenciei/1.0' } }
      )
      const data = await res.json()
      if (data[0]) {
        const newLat = parseFloat(data[0].lat)
        const newLng = parseFloat(data[0].lon)
        const city = formatCity(data[0].address)
        onChange(newLat, newLng)
        setDetectedCity(city)
        onCityResolved?.(city)
        mapRef.current.flyTo([newLat, newLng], 14, { duration: 0.8 })
      }
    } catch {}
    setSearching(false)
  }

  return (
    <div className="space-y-2">
      <form onSubmit={doSearch} className="flex gap-2">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar endereço ou hospital..."
          className="flex-1 border border-[#E2E8F0] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] bg-white"
        />
        <button
          type="submit"
          disabled={searching}
          className="px-3 py-2 bg-[#1E3A8A] text-white rounded-xl text-sm hover:bg-[#2563EB] disabled:opacity-50 transition-colors"
        >
          {searching ? '…' : '🔍'}
        </button>
      </form>

      <div
        ref={containerRef}
        className="rounded-xl overflow-hidden border border-[#E2E8F0]"
        style={{ height: 260 }}
      />

      <p className="text-xs text-[#64748B]">
        {hasPin
          ? `✓ ${detectedCity || 'Localizando…'} — arraste o marcador para ajustar`
          : 'Clique no mapa ou busque um endereço para definir a localização'}
      </p>
    </div>
  )
}
