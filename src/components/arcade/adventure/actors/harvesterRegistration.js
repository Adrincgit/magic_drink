// The ground boss is exactly 15% smaller than the original 290px drawing.
export const HARVESTER_SIZE=246.5;
export const HARVESTER_SCALE=.85;
export const HARVESTER_AIR_SIZE=HARVESTER_SIZE*1.16;
export const harvesterInRitual=e=>['absorb','absorb-player'].includes(e.phase);
export const harvesterTransition=e=>['broom-call','broom-mount','broom-rise'].includes(e.phase);
