import { useState, useEffect } from 'react'

export function useUserLocation() {
  const [state, setState] = useState({ lat: null, lng: null, status: 'idle' })

  useEffect(() => {
    if (!navigator?.geolocation) {
      setState(s => ({ ...s, status: 'unavailable' }))
      return
    }
    setState(s => ({ ...s, status: 'loading' }))
    navigator.geolocation.getCurrentPosition(
      (pos) => setState({ lat: pos.coords.latitude, lng: pos.coords.longitude, status: 'granted' }),
      () => setState(s => ({ ...s, status: 'denied' })),
      { timeout: 10000, maximumAge: 300_000 }
    )
  }, [])

  return state
}
