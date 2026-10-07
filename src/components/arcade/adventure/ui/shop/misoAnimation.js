// Hold the same resting pose between brief expressions. Speaking and purchase
// reactions play once; they must never turn into a repeating catalogue of poses.
const blink = [[0, 2800], [1, 75], [2, 100], [1, 75], [0, 3300], [1, 75], [2, 95], [1, 75]];
const talk = [[0, 160], [3, 160], [4, 180], [3, 150], [0, 240], [3, 170], [4, 180], [3, 140], [0, 250]];
const happy = [[0, 120], [3, 190], [4, 230], [3, 160], [0, 140], [1, 85], [5, 720], [1, 85], [0, 240]];
const duration = sequence => sequence.reduce((total, [, ms]) => total + ms, 0);
function sample(sequence, time) {
 for (const [frame, ms] of sequence) { if (time < ms) return frame; time -= ms; }
 return 0;
}
export function misoFrame(elapsed, reaction = 'talk', reduced = false) {
 if (reduced) return 0;
 const intro = reaction === 'happy' ? happy : talk, introDuration = duration(intro);
 if (elapsed < introDuration) return sample(intro, Math.max(0, elapsed));
 return sample(blink, (elapsed - introDuration) % duration(blink));
}
