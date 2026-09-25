import { FILM_END } from './wonderpopFilm';

// Arrival, listening and replies have separate beats. Extending these world
// coordinates adds runway only here; earlier chapters keep their scroll pace.
export const INTERVIEW_FADE_START = FILM_END + .015;
export const INTERVIEW_READY = FILM_END + .065;
export const INTERVIEW_START = FILM_END + .16;
export const INTERVIEW_STEP = .235;
export const interviewTour = ['music', 'boring', 'addiction'];
export const INTERVIEW_FINISH = INTERVIEW_START + interviewTour.length * INTERVIEW_STEP;
export const INTERVIEW_JOURNEY_END = INTERVIEW_FINISH + .215;
export const interviewStop = index => INTERVIEW_START + (index + .32) * INTERVIEW_STEP;
export const INTERVIEW_ENTRY = interviewStop(0);

export function interviewMoment(progress) {
  const p = Math.max(0, Math.min(.9999, (progress - INTERVIEW_START) / (INTERVIEW_FINISH - INTERVIEW_START)));
  return { index: Math.floor(p * interviewTour.length), local: (p * interviewTour.length) % 1, progress: p, started: progress >= INTERVIEW_START };
}
