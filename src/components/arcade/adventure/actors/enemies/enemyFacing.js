// Keep the current facing when a target is almost directly above or below.
// Crossing the whole central band is required before turning back.
export function faceTarget(enemy,x,band=24){
 if(Math.abs(x-enemy.x)>band)enemy.dir=Math.sign(x-enemy.x);
 return enemy.dir||-1;
}
