export type Airport = {
  icao: string
  name: string
  city: string
  lat: number
  lon: number
}

export const airports: Record<string, Airport> = {
  KPAO: { icao: 'KPAO', name: 'Palo Alto', city: 'Palo Alto, CA', lat: 37.46, lon: -122.11 },
  KHAF: { icao: 'KHAF', name: 'Half Moon Bay', city: 'Half Moon Bay, CA', lat: 37.51, lon: -122.5 },
  KWVI: { icao: 'KWVI', name: 'Watsonville', city: 'Watsonville, CA', lat: 36.93, lon: -121.79 },
  KTRK: { icao: 'KTRK', name: 'Truckee Tahoe', city: 'Truckee, CA', lat: 39.32, lon: -120.14 },
  KSNS: { icao: 'KSNS', name: 'Salinas', city: 'Salinas, CA', lat: 36.66, lon: -121.61 },
  KMRY: { icao: 'KMRY', name: 'Monterey', city: 'Monterey, CA', lat: 36.59, lon: -121.85 },
  KLVK: { icao: 'KLVK', name: 'Livermore', city: 'Livermore, CA', lat: 37.69, lon: -121.82 },
  KAPC: { icao: 'KAPC', name: 'Napa County', city: 'Napa, CA', lat: 38.21, lon: -122.28 },
}

export type Aircraft = {
  tail: string
  type: string
  color: string
  hobbs: number
}

export const fleet: Aircraft[] = [
  { tail: 'N172VX', type: 'Cessna 172S', color: 'White / Amber trim', hobbs: 4821.3 },
  { tail: 'N44DA', type: 'Diamond DA40', color: 'White / Cyan trim', hobbs: 2190.6 },
  { tail: 'N9021P', type: 'Piper Cherokee 180', color: 'Cream / Rust trim', hobbs: 6104.9 },
]

export type Flight = {
  id: string
  date: string // ISO
  from: string
  to: string
  aircraft: string
  pic: string
  total: number
  night: number
  instrument: number
  xc: number
  landingsDay: number
  landingsNight: number
  remarks: string
}

export const flights: Flight[] = [
  { id: 'f1', date: '2026-08-24', from: 'KPAO', to: 'KTRK', aircraft: 'N172VX', pic: 'A. Reyes', total: 1.4, night: 0, instrument: 0.2, xc: 1.4, landingsDay: 2, landingsNight: 0, remarks: 'Smooth over the Sierra, light chop on descent into Truckee.' },
  { id: 'f2', date: '2026-08-19', from: 'KPAO', to: 'KPAO', aircraft: 'N44DA', pic: 'A. Reyes', total: 0.9, night: 0.6, instrument: 0, xc: 0, landingsDay: 1, landingsNight: 3, remarks: 'Night currency pattern work, calm winds.' },
  { id: 'f3', date: '2026-08-12', from: 'KPAO', to: 'KMRY', aircraft: 'N9021P', pic: 'A. Reyes', total: 1.1, night: 0, instrument: 0.4, xc: 1.1, landingsDay: 1, landingsNight: 0, remarks: 'Filed IFR through marine layer, broke out at 3,500.' },
  { id: 'f4', date: '2026-08-05', from: 'KHAF', to: 'KWVI', aircraft: 'N172VX', pic: 'A. Reyes', total: 0.7, night: 0, instrument: 0, xc: 0.7, landingsDay: 2, landingsNight: 0, remarks: 'Coastal scenic, photo flight for a friend.' },
  { id: 'f5', date: '2026-07-29', from: 'KPAO', to: 'KAPC', aircraft: 'N44DA', pic: 'A. Reyes', total: 0.5, night: 0, instrument: 0, xc: 0.5, landingsDay: 1, landingsNight: 0, remarks: 'Lunch run, held short 15 min for glider ops.' },
  { id: 'f6', date: '2026-07-21', from: 'KPAO', to: 'KLVK', aircraft: 'N9021P', pic: 'A. Reyes', total: 0.6, night: 0, instrument: 0, xc: 0.4, landingsDay: 3, landingsNight: 0, remarks: 'Pattern practice, gusty crosswind 14G22.' },
  { id: 'f7', date: '2026-07-10', from: 'KPAO', to: 'KSNS', aircraft: 'N172VX', pic: 'A. Reyes', total: 0.8, night: 0, instrument: 0.3, xc: 0.8, landingsDay: 1, landingsNight: 0, remarks: 'Practice approaches, foggles.' },
]

export function hoursByCategory() {
  const totals = { total: 0, night: 0, instrument: 0, xc: 0 }
  for (const f of flights) {
    totals.total += f.total
    totals.night += f.night
    totals.instrument += f.instrument
    totals.xc += f.xc
  }
  return totals
}

export function last90DaysLandings() {
  const cutoff = new Date('2026-08-27')
  cutoff.setDate(cutoff.getDate() - 90)
  let day = 0
  let night = 0
  for (const f of flights) {
    if (new Date(f.date) >= cutoff) {
      day += f.landingsDay
      night += f.landingsNight
    }
  }
  return { day, night }
}

export const weather = {
  station: 'KPAO',
  raw: 'KPAO 271853Z 28008KT 10SM FEW035 22/13 A3005',
  windDir: 280,
  windKt: 8,
  vis: 10,
  temp: 22,
  dew: 13,
  altimeter: 30.05,
  flightRules: 'VFR' as const,
}

export const medicalExpiry = '2027-03-14'
export const flightReviewExpiry = '2027-11-02'
