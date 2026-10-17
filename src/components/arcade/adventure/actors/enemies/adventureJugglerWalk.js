export const JUGGLER_WALK_FRAMES=8;
// A complete short-legged walk, paced by actual distance in either direction.
// Each drawing contains both legs and their connection to the puffy shorts.
export const JUGGLER_STRIDE=64;
export const jugglerWalkFrame=(gait=0,reduced=false)=>reduced?0:Math.floor(gait*JUGGLER_WALK_FRAMES)%JUGGLER_WALK_FRAMES;
