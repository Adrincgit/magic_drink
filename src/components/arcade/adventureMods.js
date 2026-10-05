export const MOD_SLOTS=3;
export const MODS=[
 {id:'quick-cast',price:25,icon:0,name:['Alas de chispa','Spark wings'],description:['Dispara un 20% más rápido.','Cast 20% faster.']},
 {id:'encore-pocket',price:75,icon:1,name:['Encore de bolsillo','Pocket encore'],description:['Guarda una segunda carga de súper. Cada carga requiere magia y descanso.','Store a second super charge. Each cast still needs magic and recovery.']},
 {id:'bright-spark',price:35,icon:2,name:['Estrella expansiva','Growing star']},
 {id:'grand-flourish',price:50,icon:3,name:['Gran floritura','Grand flourish']},
 {id:'full-bubble',price:85,image:'/arcade/sprites/ui/full-bubble.webp',name:['Burbuja de gala','Gala bubble']},
 ...['Dragon Grape','Banna Drama','Witchy Kiwii','Bubble Tape','Sparkle Soda'].map((name,kind)=>({id:'starter-'+kind,price:[60,65,65,75,80][kind],drink:kind,name:[name,name],description:['Empieza con este sabor y el doble de reserva. Solo un sabor inicial equipado.','Start with this flavor and double capacity. Equip one starting flavor.']})),
];
export const validMods=ids=>[...new Set(Array.isArray(ids)?ids:[])].filter(id=>MODS.some(m=>m.id===id));
export function equippedMods(ids,owned){let starter=false;return validMods(ids).filter(id=>owned.includes(id)).filter(id=>{if(!id.startsWith('starter-'))return true;if(starter)return false;starter=true;return true;}).slice(0,MOD_SLOTS);}
export const hasMod=(s,id)=>s.mods?.includes(id)===true;
export const MAX_MOD_LEVEL=3;
export const validModLevels=(levels,owned)=>Object.fromEntries(validMods(owned).map(id=>[id,Math.max(1,Math.min(MAX_MOD_LEVEL,Math.floor(Number(levels?.[id]))||1))]));
export const modLevel=(s,id)=>hasMod(s,id)?validModLevels(s.modLevels,[id])[id]:0;
export const modShotScale=(s,strong=false)=>{const level=modLevel(s,strong?'grand-flourish':'bright-spark');return level?1.2+level*.1:1;};
export const modFireRate=s=>hasMod(s,'quick-cast')?1.1+modLevel(s,'quick-cast')*.1:1;
export const reserveRecharge=s=>40-Math.max(0,modLevel(s,'encore-pocket')-1)*4;
export const starterCapacity=(s,id)=>2+Math.max(0,modLevel(s,id)-1)*.5;
export const shieldGrace=s=>.6+Math.max(0,modLevel(s,'full-bubble')-1)*.3;
export const modPrice=(mod,current=0)=>current>=MAX_MOD_LEVEL?null:Math.ceil(mod.price*(1+current*.5));
export function modDescription(mod,level=1,en=false){
 const n=Math.max(1,Math.min(3,level));
 if(mod.id==='quick-cast')return en?`Cast ${10+n*10}% faster.`:`Dispara un ${10+n*10}% más rápido.`;
 if(mod.id==='bright-spark'||mod.id==='grand-flourish'){const strong=mod.id==='grand-flourish';return en?`${strong?'Strong':'Normal'} projectiles are ${20+n*10}% larger.`:`Proyectiles ${strong?'fuertes':'normales'} un ${20+n*10}% más grandes.`;}
 if(mod.id==='encore-pocket')return en?`A second super charge; recharges in ${44-n*4}s. Still needs 90 magic.`:`Una segunda carga de súper; se recarga en ${44-n*4}s. Requiere 90 de magia.`;
 if(mod.id==='full-bubble')return en?`Every shield fills all 3 slots. ${(0.3+n*.3).toFixed(1)}s of protection after a shield absorbs a hit.`:`Cada burbuja llena los 3 espacios. ${(0.3+n*.3).toFixed(1)}s de protección tras absorber un golpe.`;
 return en?`Start with this flavor and ${1.5+n*.5}× capacity. Equip one starting flavor.`:`Empieza con este sabor y ${1.5+n*.5}× de reserva. Solo un sabor inicial equipado.`;
}
export const superCapacity=s=>hasMod(s,'encore-pocket')?2:1;
export function updateMods(s,ids,levels=s.modLevels){
 const hadExtra=superCapacity(s)===2;s.mods=equippedMods(ids,validMods(ids));s.modLevels=validModLevels(levels,s.mods);
 // Only the initial loadout starts with a full reserve. Unequipping/re-equipping
 // cannot manufacture charges; a newly fitted pocket must recharge normally.
 if(superCapacity(s)===2){if(!hadExtra){s.superReserve=0;s.reserveCooldown=reserveRecharge(s);}else s.reserveCooldown=Math.min(s.reserveCooldown,reserveRecharge(s));}
 else if(hadExtra){s.superReserve=0;s.reserveCooldown=40;}
}
