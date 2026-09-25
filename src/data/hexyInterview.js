export { INTERVIEW_START, INTERVIEW_FINISH, interviewTour, interviewStop, interviewMoment } from './hexyInterviewTiming';

// Dialogue spoken by a fictional brand ambassador, not an omniscient narrator.
// IndexSeccion8 supplies the subjects; these answers belong to Hexy's voice.
export const hexyQuestions = [
  { id: 'music', topic: 'music', pose: 'excited',
    question: ['Hexy, ¿por qué tu música suena mejor con Magic Drink?', 'Hexy, why does your music sound better with Magic Drink?'],
    answer: ['¡Espero que también te guste sin ella! Muchos me dicen que juntos todo se siente más intenso. Yo pongo la voz; ustedes ponen los recuerdos. A veces una canción termina sabiendo a una tarde que no quieres olvidar.', 'I hope you like it without the drink too! People tell me everything feels more intense together. I bring the voice; you bring the memories. Sometimes a song starts tasting like an afternoon you never want to forget.'] },
  { id: 'boring', topic: 'rumors', pose: 'thoughtful',
    question: ['¿Por qué todo parece más aburrido cuando dejo de tomarla?', 'Why does everything feel more boring when I stop drinking it?'],
    answer: ['Bueno… después de un concierto, hasta el silencio se siente distinto. Me gusta pensar que extrañas esos momentos, esa chispa. Sé que algunos lo llaman «efecto aburrimiento». Yo diría que una tarde bonita deja el listón muy alto.', 'Well… after a concert, even silence feels different. I like to think you miss those moments, that little spark. I know some people call it the “boring effect.” I would say a lovely afternoon sets the bar very high.'] },
  { id: 'addiction', topic: 'rumors', pose: 'thoughtful',
    question: ['Dicen que la bebida y tus canciones generan adicción. ¿Qué respondes?', 'People say the drink and your songs are addictive. What do you say?'],
    answer: ['¡Vaya, esa pregunta siempre vuelve! «Adicción» es una palabra enorme. Una canción que repites y una bebida que te gusta pueden volverse parte de tu rutina. Yo hablaría de cariño por la experiencia… aunque sé que no todos lo ven como yo.', 'Oh, that question keeps coming back! “Addiction” is a big word. A song on repeat and a drink you love can become part of your routine. I would call it affection for the experience… although I know not everyone sees it my way.'] },
  { id: 'caffeine', topic: 'drink', pose: 'explain',
    question: ['Hexy, ¿de verdad Magic Drink no tiene cafeína?', 'Hexy, does Magic Drink really have no caffeine?'],
    answer: ['La fórmula se presenta sin cafeína ni los estimulantes de una bebida energética. ¡Nuestra historia siempre ha sido otra! Si me preguntas de dónde viene esa sensación… yo soy la de las canciones. Los detalles de la fórmula se los dejo al laboratorio.', 'The formula is presented as free of caffeine and energy-drink stimulants. Our story has always been different! If you ask where that feeling comes from… I am the music person. I leave the details of the formula to the laboratory.'] },
  { id: 'healthy', topic: 'drink', pose: 'explain',
    question: ['Si es saludable, ¿por qué hay tantas quejas?', 'If it is healthy, why are there so many complaints?'],
    answer: ['Magic Drink se presenta como una bebida saludable. Las quejas que me llegan suelen hablar de otra cosa: de lo mucho que se echa de menos la experiencia. No quiero quitarles importancia… pero tampoco creo que todas esas historias se puedan resumir en un rumor.', 'Magic Drink is presented as a healthy drink. The complaints I hear often concern something else: how much people miss the experience. I do not want to dismiss them… but I do not think every story can be summed up by a rumor either.'] },
  { id: 'again', topic: 'rumors', pose: 'thoughtful',
    question: ['¿Por qué siempre quiero otra lata y otra canción?', 'Why do I always want another can and another song?'],
    answer: ['¡Tú eres de los que piden un bis! A mí también me cuesta despedirme de un buen momento. ¿Será la bebida, la canción o la compañía? Yo prefiero pensar en todo lo que vivimos juntos. Aunque admito que mis estribillos se quedan un ratito…', 'You are the one asking for an encore! I find it hard to say goodbye to a good moment too. Is it the drink, the song, or the company? I prefer to think about everything we shared. Although I admit my choruses tend to linger…'] },
  { id: 'cost', topic: 'rumors', pose: 'listen',
    question: ['¿Y si no puedo gastar en Magic Drink todos los días?', 'What if I cannot spend money on Magic Drink every day?'],
    answer: ['Entonces quédate a escuchar conmigo. No me gustaría que medieras lo que significas aquí por las latas que compras. La plaza vende recuerdos, sí… pero una canción también puede acompañarte de vuelta a casa.', 'Then stay and listen with me. I would not want you to measure your place here by the cans you buy. The plaza sells souvenirs, yes… but a song can accompany you on the way home too.'] },
  { id: 'everyday', topic: 'drink', pose: 'explain',
    question: ['¿Tú tomarías Magic Drink todos los días?', 'Would you drink Magic Drink every day?'],
    answer: ['¡Con todos los conciertos que tenemos, parece que siempre hay una celebración! Aun así, no hace falta convertir cada día en un estreno. A mí me gusta que cada quien encuentre su momento para la magia.', 'With all our concerts, it feels like there is always a celebration! Still, every day does not have to be a premiere. I like everyone to find their own moment for the magic.'] },
  { id: 'composer', topic: 'music', pose: 'thoughtful',
    question: ['¿Tú compones las canciones? ¿Quién es DJ Sweet Hex?', 'Do you write the songs? Who is DJ Sweet Hex?'],
    answer: ['Yo les doy voz. Y sí, has visto ese nombre en los créditos… DJ Sweet Hex. Digamos que una canción tiene más de una historia detrás. Algunas se cuentan sobre el escenario; otras prefieren quedarse entre las notas.', 'I give them my voice. And yes, you have seen that name in the credits… DJ Sweet Hex. Let us say a song has more than one story behind it. Some are told onstage; others prefer to stay between the notes.'] },
  { id: 'everywhere', topic: 'music', pose: 'excited',
    question: ['Hexy, ¿por qué apareces en todas partes?', 'Hexy, why are you everywhere?'],
    answer: ['¡Porque me invitan! En una canción, en un escaparate, en el sombrero de alguien… Me hace ilusión ser parte de sus días. Aunque los Bunnies ya me dijeron que ellos también quieren su propio cartel.', 'Because people invite me! In a song, in a shop window, on someone’s hat… I love being part of your days. Although the Bunnies have already told me they want their own poster too.'] },
  { id: 'plaza', topic: 'drink', pose: 'explain',
    question: ['¿Dónde podemos encontrarte a ti y a Magic Drink?', 'Where can we find you and Magic Drink?'],
    answer: ['¡Mira detrás de mí! Wonderpop Plaza es nuestra casa: la bebida, los Magic Bunnies, los recuerdos y tantos rincones con música. Yo siempre encuentro una excusa para volver. Y tú ya conoces el camino.', 'Look behind me! Wonderpop Plaza is our home: the drink, Magic Bunnies, keepsakes, and so many corners filled with music. I always find an excuse to return. And now you know the way.'] },
];

export const interviewTopics = [
  { id: 'all', label: ['Todas', 'All'] }, { id: 'drink', label: ['Magic Drink', 'Magic Drink'] },
  { id: 'music', label: ['Su música', 'Her music'] }, { id: 'rumors', label: ['Lo que se dice', 'The rumors'] },
];
