export const FILM_START = .86;
export const FILM_END = 2.5;
export const FILM_REVEAL = .785;
const art = '/image/journey/wonderpop-film/';
export const filmShots = [
  { id: 'title', kind: 'title', color: 0, title: ['Un lugar para la magia', 'A place for the magic'], caption: ['Toda gran historia empieza con una idea.', 'Every great story begins with an idea.'] },
  { id: 'laboratory', file: art + 'laboratory.webp', color: 0, title: ['Cincuenta años. Una fórmula.', 'Fifty years. One formula.'], caption: ['Según nuestros archivos, perfeccionar Magic Drink llevó medio siglo de búsqueda.', 'According to our archives, perfecting Magic Drink took half a century of discovery.'] },
  { id: 'hexy-sketches', file: art + 'hexy-archive-wide-v28.webp', color: .025, title: ['Antes del primer escenario', 'Before the first stage'], caption: ['Una túnica negra. Una mirada familiar. Hexy ya empezaba a tomar forma.', 'A black robe. A familiar face. Hexy was already taking shape.'] },
  { id: 'blueprints', file: art + 'blueprints.webp', color: .07, title: ['Un sueño sobre el papel', 'A dream on paper'], caption: ['Mientras nacía la fórmula, también imaginábamos las plazas que un día la acompañarían.', 'As the formula took shape, we imagined the plazas that would one day come with it.'] },
  { id: 'success', file: art + 'success.webp', color: .14, title: ['Y el mundo la hizo suya', 'And the world made it its own'], caption: ['Magic Drink se convirtió en un éxito rotundo. La historia apenas comenzaba.', 'Magic Drink became a runaway success. The story was only beginning.'] },
  { id: 'construction', file: art + 'construction.webp', color: .23, title: ['De los planos a las estrellas', 'From drawings to stars'], caption: ['Aquella idea empezó a levantarse: arcos, escaparates y un lugar para encontrarnos.', 'The idea began to rise: arches, shop windows and a place to come together.'] },
  { id: 'opening', file: art + 'opening.webp', color: .4, title: ['Cuatro años después', 'Four years later'], caption: ['Cuatro años después del éxito de Magic Drink, Wonderpop Plaza abrió sus puertas.', 'Four years after Magic Drink became a hit, Wonderpop Plaza opened its doors.'] },
  { id: 'atrium', file: '/image/journey/wonderpop-atrium-v15.webp', color: .52, title: ['Bienvenido a Wonderpop', 'Welcome to Wonderpop'], caption: ['La bebida, la música y sus historias encontraron un mismo hogar.', 'The drink, the music and their stories found a home together.'] },
  { id: 'world', kind: 'map', color: .64, title: ['Una idea que empezó a viajar', 'An idea that began to travel'], caption: ['Cada ciudad, una nueva forma de encontrarnos. Y el viaje continúa.', 'Every city brings a new way to come together. And the journey continues.'] },
  { id: 'original', kind: 'product', color: .78, title: ['La estrella de esta historia', 'The star of this story'], caption: ['Magic Drink. El sabor con el que empezó todo.', 'Magic Drink. The taste that started it all.'] },
  { id: 'collection', file: art + 'collection.webp', color: .88, title: ['Un pedacito para llevar', 'A little piece to take home'], caption: ['Magic Bunnies, ropa y recuerdos de Hexy. Encuentra algo que cuente tu historia.', 'Magic Bunnies, clothing and Hexy keepsakes. Find something that tells your story.'] },
  { id: 'music', kind: 'music', file: art + 'hexy-concert-wide-v28.webp', color: .98, title: ['Un lugar con banda sonora', 'A place with a soundtrack'], caption: ['Las canciones de Hexy también forman parte de la visita.', 'Hexy’s songs are part of the visit, too.'] },
  { id: 'community', file: art + 'community.webp', color: 1, title: ['Lo mejor es compartirlo', 'The best part is sharing it'], caption: ['Una tarde, tus personas favoritas y otra historia para recordar.', 'An afternoon, your favorite people and another story to remember.'] },
  { id: 'plaza-today', kind: 'final', file: art + 'plaza-today.webp', color: 1, title: ['Wonderpop Plaza', 'Wonderpop Plaza'], caption: ['Ven a visitarnos.', 'Come visit us.'] },
];
export const filmLocations = [
  { name: ['Tokio', 'Tokyo'], lon: 139.69, lat: 35.68, dx: 18, dy: 22 },
  { name: ['Los Ángeles', 'Los Angeles'], lon: -118.24, lat: 34.05, dx: -12, dy: -18, anchor: 'end' },
  { name: ['Seúl', 'Seoul'], lon: 126.98, lat: 37.56, dx: -12, dy: -16, anchor: 'end' },
  { name: ['Londres', 'London'], lon: -.12, lat: 51.5, dx: 14, dy: -12 },
  { name: ['Ciudad de México', 'Mexico City'], lon: -99.13, lat: 19.43, dx: 12, dy: 28 },
  { name: ['São Paulo · próximamente', 'São Paulo · coming soon'], lon: -46.63, lat: -23.55, dx: 14, dy: 25, coming: true },
];
export const mapPoint = ({ lon, lat }) => [(lon + 180) / 360 * 1000, (85 - lat) / 150 * 430];
export function filmMoment(progress) {
  const p = Math.max(0, Math.min(.999999, (progress - FILM_START) / (FILM_END - FILM_START)));
  const position = p * filmShots.length;
  return { index: Math.floor(position), local: position % 1, progress: p };
}
