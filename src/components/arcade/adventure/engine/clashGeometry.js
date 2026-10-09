export const CLASH_THROW_DISTANCE=880;
export function clashThrowTarget(s,loser,winner,boss=false){
 const arena=s.level.arena,margin=boss?120:70;
 return Math.max(arena.left+margin,Math.min(arena.right-margin,loser.x+(Math.sign(loser.x-winner.x)||1)*CLASH_THROW_DISTANCE));
}
