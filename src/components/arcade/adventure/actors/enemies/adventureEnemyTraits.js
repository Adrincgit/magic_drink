// Gameplay roles, independent of HP, drawing scale and the container in which
// an actor happens to live. New actors may explicitly declare combatClass.
const classes=new Set(['basic','strong','miniboss','boss']);
const machines=new Set([5,7,9,12,15,16,17]);
const large=new Set([13,20,31]);
export function enemyClass(e){
 if(classes.has(e.combatClass))return e.combatClass;
 if(e.isBoss)return 'boss';if(e.isMiniboss||e.type===23||e.type===28)return 'miniboss';
 return machines.has(e.type)||large.has(e.type)||e.machine||e.large?'strong':'basic';
}
export const enemyMachine=e=>machines.has(e.type)||!!e.machine;
const controls=new Set(['bubble','slow','launch','bind','push','electric-stun']);
export function canControlEnemy(e,control,allowDefeated=false){
 if(!controls.has(control)||enemyClass(e)!=='basic'||e.machine||e.large||!allowDefeated&&e.hp<=0||e.fleeing||e.nightmareHidden||e.boosterHidden)return false;
 // Absorption is committed until the caster dies, including ordinary witches.
 return !([26,28].includes(e.type)&&['absorb','absorb-player'].includes(e.phase));
}
