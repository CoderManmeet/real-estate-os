// import axios from 'axios';
// import { AppError } from '../utils/AppError';

// const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
// const OVERPASS_URL = 'https://overpass.kumi.systems/api/interpreter';

// const NOMINATIM_HEADERS = { 'User-Agent': 'RealEstateOS/1.0 (development)' };

// export interface GeocodedLocation {
//   latitude: number;
//   longitude: number;
//   formattedAddress: string;
// }

// async function tryGeocode(query: string): Promise<GeocodedLocation | null> {
//   const { data } = await axios.get(NOMINATIM_URL, {
//     params: { q: query, format: 'json', limit: 1 },
//     headers: NOMINATIM_HEADERS,
//   });

//   if (!data?.length) return null;

//   const result = data[0];
//   return {
//     latitude: parseFloat(result.lat),
//     longitude: parseFloat(result.lon),
//     formattedAddress: result.display_name,
//   };
// }

// export async function geocodeAddress(
//   fullAddress: string,
//   fallbackAddress?: string,
//   finalFallback?: string
// ): Promise<GeocodedLocation> {
//   const primary = await tryGeocode(fullAddress);
//   if (primary) return primary;

//   if (fallbackAddress) {
//     const fallback = await tryGeocode(fallbackAddress);
//     if (fallback) return fallback;
//   }

//   if (finalFallback) {
//     const final = await tryGeocode(finalFallback);
//     if (final) return final;
//   }

//   throw new AppError(`Could not geocode address: no results found`, 400);
// }

// function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
//   const R = 6371;
//   const dLat = ((lat2 - lat1) * Math.PI) / 180;
//   const dLon = ((lon2 - lon1) * Math.PI) / 180;
//   const a =
//     Math.sin(dLat / 2) ** 2 +
//     Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
//   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//   return Number((R * c).toFixed(2));
// }

// export interface NearbyPlaceResult {
//   name: string;
//   distanceKm: number;
// }

// const placeTagMap: Record<string, string> = {
//   school: 'amenity=school',
//   hospital: 'amenity=hospital',
//   airport: 'aeroway=aerodrome',
//   metro: 'railway=station',
//   market: 'shop=mall',
// };

// function sleep(ms: number) {
//   return new Promise((resolve) => setTimeout(resolve, ms));
// }

// async function queryOverpass(query: string, attempt = 1): Promise<any> {
//   const maxAttempts = 3;

//   try {
//     const { data } = await axios.post(
//       OVERPASS_URL,
//       new URLSearchParams({ data: query }).toString(),
//       {
//         headers: {
//           'Content-Type': 'application/x-www-form-urlencoded',
//           'User-Agent': 'RealEstateOS/1.0 (development)',
//         },
//         timeout: 20000,
//       }
//     );
//     return data;
//   } catch (err: any) {
//     const isRetryable = err.response?.status === 504 || err.code === 'ECONNABORTED';

//     if (isRetryable && attempt < maxAttempts) {
//       // The free Overpass server occasionally gets overloaded — back off and retry
//       // rather than failing immediately on a transient timeout.
//       await sleep(attempt * 1500);
//       return queryOverpass(query, attempt + 1);
//     }

//     if (isRetryable) {
//       throw new AppError(
//         'The map data server is busy right now. Please try again in a moment.',
//         503
//       );
//     }

//     throw err;
//   }
// }

// export async function findNearbyPlaces(
//   latitude: number,
//   longitude: number,
//   placeType: string,
//   radiusMeters = 5000
// ): Promise<NearbyPlaceResult[]> {
//   const tag = placeTagMap[placeType];
//   if (!tag) throw new AppError(`Unsupported place type: ${placeType}`, 400);

//   const [key, value] = tag.split('=');

//   const query = `
//     [out:json][timeout:25];
//     (
//       node["${key}"="${value}"](around:${radiusMeters},${latitude},${longitude});
//       way["${key}"="${value}"](around:${radiusMeters},${latitude},${longitude});
//     );
//     out center 8;
//   `;

//   const data = await queryOverpass(query);
//   const elements = data?.elements || [];

//   const results: NearbyPlaceResult[] = elements
//     .map((el: any) => {
//       const lat = el.lat ?? el.center?.lat;
//       const lon = el.lon ?? el.center?.lon;
//       if (lat == null || lon == null) return null;

//       return {
//         name: el.tags?.name || 'Unnamed',
//         distanceKm: calculateDistanceKm(latitude, longitude, lat, lon),
//       };
//     })
//     .filter(Boolean);

//   return results.sort((a: NearbyPlaceResult, b: NearbyPlaceResult) => a.distanceKm - b.distanceKm);
// }


import axios from 'axios';
import { AppError } from '../utils/AppError';

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

// Public Overpass mirrors, tried in order. Free-tier cloud IPs (like Render's) get
// rate-limited or blocked by individual mirrors more often than a home connection would,
// so we fail over to the next mirror rather than depending on any single one.
const OVERPASS_MIRRORS = [
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass-api.de/api/interpreter',
  'https://overpass.private.coffee/api/interpreter',
];

const NOMINATIM_HEADERS = { 'User-Agent': 'RealEstateOS/1.0 (development)' };

export interface GeocodedLocation {
  latitude: number;
  longitude: number;
  formattedAddress: string;
}

async function tryGeocode(query: string): Promise<GeocodedLocation | null> {
  const { data } = await axios.get(NOMINATIM_URL, {
    params: { q: query, format: 'json', limit: 1 },
    headers: NOMINATIM_HEADERS,
  });

  if (!data?.length) return null;

  const result = data[0];
  return {
    latitude: parseFloat(result.lat),
    longitude: parseFloat(result.lon),
    formattedAddress: result.display_name,
  };
}

export async function geocodeAddress(
  fullAddress: string,
  fallbackAddress?: string,
  finalFallback?: string
): Promise<GeocodedLocation> {
  const primary = await tryGeocode(fullAddress);
  if (primary) return primary;

  if (fallbackAddress) {
    const fallback = await tryGeocode(fallbackAddress);
    if (fallback) return fallback;
  }

  if (finalFallback) {
    const final = await tryGeocode(finalFallback);
    if (final) return final;
  }

  throw new AppError(`Could not geocode address: no results found`, 400);
}

function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
}

export interface NearbyPlaceResult {
  name: string;
  distanceKm: number;
}

const placeTagMap: Record<string, string> = {
  school: 'amenity=school',
  hospital: 'amenity=hospital',
  airport: 'aeroway=aerodrome',
  metro: 'railway=station',
  market: 'shop=mall',
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function queryOneMirror(mirrorUrl: string, query: string): Promise<any> {
  const { data } = await axios.post(
    mirrorUrl,
    new URLSearchParams({ data: query }).toString(),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'RealEstateOS/1.0 (development)',
      },
      timeout: 12000,
    }
  );
  return data;
}

async function queryOverpass(query: string): Promise<any> {
  let lastError: unknown = null;

  for (const mirrorUrl of OVERPASS_MIRRORS) {
    try {
      return await queryOneMirror(mirrorUrl, query);
    } catch (err: any) {
      lastError = err;
      // Network-level failure (can't connect) or a timeout on this mirror —
      // move on to the next mirror rather than retrying the same one.
      const isRetryableElsewhere =
        err.response?.status === 504 ||
        err.code === 'ECONNABORTED' ||
        err.code === 'ETIMEDOUT' ||
        err.code === 'ECONNREFUSED' ||
        !err.response;

      if (!isRetryableElsewhere) {
        // A non-network error (e.g. a genuine 400 from a malformed query) won't be
        // fixed by switching mirrors, so stop here instead of wasting more calls.
        throw err;
      }

      // Small pause before trying the next mirror, in case of transient overload.
      await sleep(500);
    }
  }

  throw new AppError(
    'The map data server is busy right now. Please try again in a moment.',
    503
  );
}

export async function findNearbyPlaces(
  latitude: number,
  longitude: number,
  placeType: string,
  radiusMeters = 5000
): Promise<NearbyPlaceResult[]> {
  const tag = placeTagMap[placeType];
  if (!tag) throw new AppError(`Unsupported place type: ${placeType}`, 400);

  const [key, value] = tag.split('=');

  const query = `
    [out:json][timeout:25];
    (
      node["${key}"="${value}"](around:${radiusMeters},${latitude},${longitude});
      way["${key}"="${value}"](around:${radiusMeters},${latitude},${longitude});
    );
    out center 8;
  `;

  const data = await queryOverpass(query);
  const elements = data?.elements || [];

  const results: NearbyPlaceResult[] = elements
    .map((el: any) => {
      const lat = el.lat ?? el.center?.lat;
      const lon = el.lon ?? el.center?.lon;
      if (lat == null || lon == null) return null;

      return {
        name: el.tags?.name || 'Unnamed',
        distanceKm: calculateDistanceKm(latitude, longitude, lat, lon),
      };
    })
    .filter(Boolean);

  return results.sort((a: NearbyPlaceResult, b: NearbyPlaceResult) => a.distanceKm - b.distanceKm);
}