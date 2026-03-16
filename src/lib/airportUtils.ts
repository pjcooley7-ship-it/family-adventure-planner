// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore — airports package has no type definitions
import airportsRaw from 'airports'

export interface Airport {
  iata: string
  name: string
  country: string // ISO 2-letter code
  lat: number
  lon: number
}

export interface NearbyAirport extends Airport {
  distanceMiles: number
}

type RawAirport = {
  iata?: string
  name?: string
  iso?: string
  type?: string
  size?: string | null
  lat?: string
  lon?: string
}

// Keep only real airports (not heliports/seaplane bases) with coordinates
export const airports: Airport[] = (airportsRaw as RawAirport[])
  .filter(a =>
    a.iata &&
    a.lat &&
    a.lon &&
    a.type === 'airport' &&
    (a.size === 'large' || a.size === 'medium')
  )
  .map(a => ({
    iata:    String(a.iata),
    name:    String(a.name ?? ''),
    country: String(a.iso ?? ''),
    lat:     parseFloat(String(a.lat)),
    lon:     parseFloat(String(a.lon)),
  }))
  .filter(a => !isNaN(a.lat) && !isNaN(a.lon))

function haversineDistance(
  lat1: number, lon1: number,
  lat2: number, lon2: number,
): number {
  const R = 3958.8 // miles
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLon = (lon2 - lon1) * (Math.PI / 180)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) *
    Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function findNearbyAirports(
  lat: number,
  lon: number,
  maxCount = 7,
  maxMiles = 350,
): NearbyAirport[] {
  return airports
    .map(a => ({ ...a, distanceMiles: haversineDistance(lat, lon, a.lat, a.lon) }))
    .filter(a => a.distanceMiles <= maxMiles)
    .sort((a, b) => a.distanceMiles - b.distanceMiles)
    .slice(0, maxCount)
}

export async function geocodeCity(
  query: string,
): Promise<{ lat: number; lon: number; displayName: string } | null> {
  try {
    const url =
      `https://nominatim.openstreetmap.org/search` +
      `?q=${encodeURIComponent(query)}&format=json&limit=1&addressdetails=0`
    const res = await fetch(url, {
      headers: { 'Accept-Language': 'en-US,en', 'User-Agent': 'Wanderlust-App' },
    })
    const data = (await res.json()) as { lat: string; lon: string; display_name: string }[]
    if (!data.length) return null
    return {
      lat:         parseFloat(data[0].lat),
      lon:         parseFloat(data[0].lon),
      displayName: data[0].display_name,
    }
  } catch {
    return null
  }
}
