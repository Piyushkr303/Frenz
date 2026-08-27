export type SectionMeta = {
  id: string
  code: string
  name: string
  altitude: string
  phase: string
  tilt: number
}

// The whole product is one continuous flight: you climb into planning,
// level off at cruise (home), descend into your logged history, and
// taxi into the hangar. Order top-to-bottom mirrors that descent.
export const sections: SectionMeta[] = [
  { id: 'plan', code: 'PLN', name: 'Plan', altitude: '12,500 FT', phase: 'CLIMBING', tilt: -10 },
  { id: 'home', code: 'RDY', name: 'Ready Room', altitude: '6,500 FT', phase: 'CRUISE', tilt: 0 },
  { id: 'logbook', code: 'LOG', name: 'Logbook', altitude: '2,100 FT', phase: 'DESCENDING', tilt: 9 },
  { id: 'fleet', code: 'FLT', name: 'Fleet', altitude: 'GROUND', phase: 'HANGAR', tilt: 0 },
]
