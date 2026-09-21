// World coordinates stay stable when another chapter is appended. The first
// five scenes retain their camera timing and physical scrolling distance.
export const JOURNEY_END = 2.18;
export const journeyChapters = [
  { at: 0, from: 0, es: 'MAGIC DRINK', en: 'MAGIC DRINK' },
  { at: .162, from: .0828, es: 'LA CIUDAD', en: 'THE CITY' },
  { at: .3132, from: .2412, es: 'HEXY', en: 'HEXY' },
  { at: .49, from: .36, es: 'MAGIC DRINK DAY', en: 'MAGIC DRINK DAY' },
  { at: .68, from: .62, es: 'WONDERPOP PLAZA', en: 'WONDERPOP PLAZA' },
  { at: .96, from: .86, es: 'EL ATRIO', en: 'THE ATRIUM' },
  { at: 1.25, from: 1.075, es: 'LOS RECUERDOS', en: 'THE SOUVENIRS' },
  { at: 1.59, from: 1.43, es: 'ENTRE AMIGOS', en: 'AMONG FRIENDS' },
  { at: 1.89, from: 1.75, es: 'ANTES DE IRTE', en: 'BEFORE YOU GO' },
];
