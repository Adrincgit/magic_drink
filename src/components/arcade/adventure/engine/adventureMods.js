import {withRibbonLoadout} from './adventureRibbonState';
// Legacy global limit, retained only to read saves made before category slots.
export const MOD_SLOTS=5;
export const modSlots=value=>Math.max(1,Math.min(MOD_SLOTS,Math.floor(Number(value))||1));
export const MODS=[
 {id:'quick-cast',price:25,icon:0,name:['Alas de chispa','Spark wings'],description:['Dispara un 20% más rápido.','Cast 20% faster.']},
 {id:'encore-pocket',price:75,icon:1,name:['Encore de bolsillo','Pocket encore'],description:['Guarda una segunda carga de súper. Cada carga requiere magia y descanso.','Store a second super charge. Each cast still needs magic and recovery.']},
 {id:'bright-spark',price:35,icon:2,name:['Estrella expansiva','Growing star']},
 {id:'grand-flourish',price:50,icon:3,name:['Gran floritura','Grand flourish']},
 {id:'full-bubble',price:85,image:'/arcade/sprites/ui/full-bubble.webp',name:['Burbuja de gala','Gala bubble']},
 ...['Dragon Grape','Banna Drama','Witchy Kiwii','Bubble Tape','Sparkle Soda','Aqua Berry','Jelly Cherry','Prism Peach','Echo Melon','Volt Lychee','Honey Mango','Orbit Orange'].map((name,kind)=>({id:'starter-'+kind,price:[60,65,65,75,80,90,90,100,110,110,95,120][kind],drink:kind,name:[name,name],description:['Empieza con este sabor y el doble de reserva. Amplía Bebidas para llevar dos sabores.','Start with this flavor and double capacity. Unlock a second drink slot to carry two flavors.']})),
];
MODS.push(
 {id:'starter-13',drink:13,price:125,unlock:1,maxLevel:1,name:['Popcorn Panic','Popcorn Panic'],description:['Empieza con 48 descargas de maíz caramelizado. Corto alcance; C / Y duplica el alcance por 45 de magia.','Start with 48 caramel-popcorn blasts. Short range; C / Y doubles reach for 45 magic.']},
 {id:'ribbon-duration',price:95,unlock:2,maxLevel:4,timed:true,image:'/arcade/sprites/pickups/ribbon-raspberry.webp',name:['Ribbon · Pétalos persistentes','Ribbon · Lingering petals']},
 {id:'comet-dive',price:110,unlock:1,maxLevel:2,image:'/arcade/sprites/ui/comet-dive.webp',name:['Picado de cometa','Comet dive']},
 {id:'double-dash',price:135,unlock:2,maxLevel:2,image:'/arcade/sprites/ui/double-dash.webp',name:['Doble impulso','Double dash']},
 {id:'sky-guard',price:95,unlock:1,maxLevel:2,image:'/arcade/sprites/ui/sky-guard.webp',name:['Ala protectora','Sky guard']},
 {id:'reserve-sleeve',price:85,unlock:0,maxLevel:3,image:'/arcade/sprites/ui/reserve-sleeve.webp',name:['Funda de reserva','Reserve sleeve']},
 {id:'swift-step',price:70,unlock:0,maxLevel:3,image:'/arcade/sprites/ui/swift-step.webp',name:['Paso ligero','Light step']},
 {id:'spring-boots',price:100,unlock:1,maxLevel:1,image:'/arcade/sprites/ui/spring-boots.webp',name:['Botitas de resorte','Spring boots']},
 {id:'enchanted-coaster',price:135,unlock:2,maxLevel:1,image:'/arcade/sprites/ui/enchanted-coaster.webp',name:['Posavasos encantado','Enchanted coaster']},
 {id:'lasting-magic',price:50,unlock:0,maxLevel:4,image:'/arcade/sprites/ui/lasting-magic.webp',name:['Sorbo de eternidad','Lasting sip']},
 {id:'gentle-guard',price:50,unlock:1,maxLevel:4,image:'/arcade/sprites/ui/gentle-guard.webp',name:['Compás sereno','Gentle rhythm']},
 {id:'double-pocket',price:130,unlock:1,maxLevel:1,image:'/arcade/sprites/ui/double-pocket.webp',name:['Doble fondo','Double pocket']},
 {id:'confetti-step',price:105,unlock:1,maxLevel:3,image:'/arcade/sprites/ui/confetti-step.webp',name:['Paso de confeti','Confetti step']},
 {id:'reply-bell',price:120,unlock:2,maxLevel:3,image:'/arcade/sprites/ui/reply-bell.webp',name:['Campanilla de réplica','Reply bell']},
);
const catalog={ 'quick-cast':[60,0],'bright-spark':[80,0],'grand-flourish':[95,1],'encore-pocket':[100,2],'full-bubble':[100,2], 'starter-0':[80,0],'starter-1':[85,1],'starter-2':[90,2],'starter-3':[100,3],'starter-4':[105,4],'starter-5':[90,3],'starter-6':[90,1],'starter-7':[100,2],'starter-8':[110,3],'starter-9':[110,2],'starter-10':[95,1],'starter-11':[120,3],'starter-12':[110,2] };
for(const mod of MODS)if(catalog[mod.id])[mod.price,mod.unlock]=catalog[mod.id];
// Ribbon is a found transformation, never a purchasable starting drink.
export const MOD_CATEGORIES=[
 {id:'drinks',name:['Bebidas','Drinks'],hint:['Sabores iniciales y reserva','Starting flavors and ammo'],max:3},
 {id:'boots',name:['Botas','Boots'],hint:['Saltos, velocidad y dash','Jumps, speed and dashes'],max:3},
 {id:'hat',name:['Sombrero','Hat'],hint:['Escudo y defensa','Shield and defense'],max:3},
 {id:'skills',name:['Habilidades','Skills'],hint:['Varita, súper y utilidad','Wand, super and utility'],max:5},
];
export const modCategory=mod=>mod?.timed?'skills':mod?.drink!==undefined||['reserve-sleeve','double-pocket'].includes(mod?.id)?'drinks':['spring-boots','enchanted-coaster','confetti-step','comet-dive','double-dash','swift-step'].includes(mod?.id)?'boots':['full-bubble','gentle-guard','reply-bell','sky-guard'].includes(mod?.id)?'hat':'skills';
export function categorySlots(value,legacy=1,equipped=[]){
 const slots=Object.fromEntries(MOD_CATEGORIES.map(c=>[c.id,Math.max(1,Math.min(c.max,Math.floor(Number(value?.[c.id]))||1))]));
 if(!value){
  for(const c of MOD_CATEGORIES)slots[c.id]=Math.min(c.max,Math.max(1,validMods(equipped).filter(id=>modCategory(MODS.find(m=>m.id===id))===c.id).length));
  let credit=Math.max(0,modSlots(legacy)-1-Object.values(slots).reduce((n,v)=>n+v-1,0));
  for(const c of MOD_CATEGORIES)if(credit>0&&slots[c.id]<c.max){slots[c.id]++;credit--;}
 }
 return slots;
}
export const categorySlotPrice=(category,count)=>count>=MOD_CATEGORIES.find(c=>c.id===category)?.max?null:[null,60,140,220,300][count]??null;
export const categorySlotRank=count=>[0,0,2,3,4][count]??4;
export const canExpandCategory=(save,category)=>{const count=categorySlots(save.modCategorySlots)[category];return categorySlotPrice(category,count)!==null&&(save.adventureUnlocked||0)>=categorySlotRank(count);};
export const categoryUsed=(ids,category)=>validMods(ids).filter(id=>modCategory(MODS.find(m=>m.id===id))===category).length;
export const availableMod=(mod,save)=>(save.adventureUnlocked||0)>=(mod.unlock||0);
export const maxModLevel=mod=>mod?.maxLevel||3;
export const canUpgradeMod=(mod,level,save)=>level<maxModLevel(mod)&&level<=(save.adventureUnlocked||0);
export const validMods=ids=>[...new Set((Array.isArray(ids)?ids:[]).map(id=>id==='starter-12'?'ribbon-duration':id))].filter(id=>MODS.some(m=>m.id===id));
export function equippedMods(ids,owned,slots=MOD_SLOTS){
 owned=validMods(owned);
 if(typeof slots==='number'){let starter=false;return validMods(ids).filter(id=>owned.includes(id)).filter(id=>{if(!id.startsWith('starter-')||id==='starter-12')return true;if(starter)return false;starter=true;return true;}).slice(0,modSlots(slots));}
 const limits=categorySlots(slots),used={},result=[];let flavors=0;
 for(const id of validMods(ids)){const mod=MODS.find(m=>m.id===id),cat=modCategory(mod);if(!owned.includes(id)||(used[cat]||0)>=limits[cat]||mod.drink!==undefined&&!mod.timed&&flavors>=2)continue;result.push(id);used[cat]=(used[cat]||0)+1;if(mod.drink!==undefined&&!mod.timed)flavors++;}
 return result;
}
export const hasMod=(s,id)=>s.mods?.includes(id)===true;
export const MAX_MOD_LEVEL=3;
export const validModLevels=(levels,owned)=>Object.fromEntries(validMods(owned).map(id=>[id,Math.max(1,Math.min(maxModLevel(MODS.find(m=>m.id===id)),Math.floor(id==='ribbon-duration'?Math.max(Number(levels?.[id])||0,Number(levels?.['starter-12'])||0):Number(levels?.[id]))||1))]));
export const modLevel=(s,id)=>hasMod(s,id)?validModLevels(s.modLevels,[id])[id]:0;
export const modShotScale=(s,strong=false)=>{const level=modLevel(s,strong?'grand-flourish':'bright-spark');return level?1.2+level*.1:1;};
export const modFireRate=s=>hasMod(s,'quick-cast')?1.1+modLevel(s,'quick-cast')*.1:1;
export const reserveRecharge=s=>40-Math.max(0,modLevel(s,'encore-pocket')-1)*4;
export const starterCapacity=(s,id)=>Number(id.slice(8))>=6?2:2+Math.max(0,modLevel(s,id)-1)*.5;
export const ammoReserve=s=>1+[0,.15,.25,.35][modLevel(s,'reserve-sleeve')];
export const movementRate=s=>1+[0,.06,.1,.14][modLevel(s,'swift-step')];
export const shieldGrace=s=>.6+Math.max(0,modLevel(s,'full-bubble')-1)*.3;
export const originalDuration=s=>[8,10,12,14,15][modLevel(s,'lasting-magic')];
export const guardEfficiency=s=>1-modLevel(s,'gentle-guard')*.05;
export const modPrice=(mod,current=0)=>current>=maxModLevel(mod)?null:Math.ceil(mod.price*[1,2.5,4,6][current]);
export function modDescription(mod,level=1,en=false){
 const n=Math.max(1,Math.min(maxModLevel(mod),level));
 if(mod.id==='starter-13')return mod.description[en?1:0];
 if(mod.id==='comet-dive')return en?(n===1?'In the air, hold Down + dash to dive vertically. Landing ends the dive; it does not grant invulnerability.':'In the air, Down + dash also accepts Left / Right for diagonal dives. No invulnerability.'):(n===1?'En el aire, abajo + dash permite caer en picado. Termina al aterrizar; no da invulnerabilidad.':'En el aire, abajo + dash admite izquierda / derecha para picados diagonales. No da invulnerabilidad.');
 if(mod.id==='double-dash')return en?`Two dashes per flight, ${n===1?'0.4':'0.34'}s between them. Land on real ground to replenish.`:`Dos dash por vuelo, con ${n===1?'0,4':'0,34'} s entre ellos. Se recuperan al tocar suelo firme.`;
 if(mod.id==='sky-guard')return en?(n===1?'Hold Up + shield to protect overhead. Same magic cost; your sides remain exposed.':'Up + shield also accepts diagonals. Aim your protection; it does not cover every side.'):(n===1?'Arriba + escudo protege sobre tu cabeza. Mismo coste de magia; los costados quedan expuestos.':'Arriba + escudo también admite diagonales. Orienta la defensa; no cubre todos los lados.');
 if(mod.id==='reserve-sleeve')return en?`All cans hold ${[15,25,35][n-1]}% more ammo. Equipping never refills spent ammo.`:`Todas las latas admiten un ${[15,25,35][n-1]}% más de munición. Equiparla no repone lo que ya gastaste.`;
 if(mod.id==='swift-step')return en?`Walk and run ${[6,10,14][n-1]}% faster. Jump height stays predictable.`:`Camina y corre un ${[6,10,14][n-1]}% más rápido. Conserva la altura de salto.`;
 if(mod.id==='starter-8')return en?`Y / C summons ${n} following echo${n>1?'es':''} that copy your shots at the same time, at ${[50,32,25][n-1]}% power. Each clone spends one extra Echo charge per volley. Press Y / C again to dismiss them.`:`Y / C invoca ${n} ${n>1?'ecos que te siguen y disparan':'eco que te sigue y dispara'} al mismo tiempo que tú, al ${[50,32,25][n-1]}% de potencia. Cada clon gasta una carga extra de Echo por disparo. Pulsa Y / C otra vez para retirarlos.`;
 if(mod.id==='starter-7')return en?`Keep ${n} aimed prism${n>1?'s':''} for ${n===1?'5.5':'7'}s. Up / diagonals place them along your aim. Splits lose power at every prism.`:`Mantén ${n} ${n>1?'prismas orientables':'prisma orientable'} durante ${n===1?'5,5':'7'} s. Arriba y diagonales colocan siguiendo tu puntería. Cada división pierde potencia.`;
 if(mod.id==='starter-10')return en?[ 'Aim a small hive: 6 drops over 2.65s. Honey slows instead of trapping.', 'The hive lasts 3.3s and releases 8 drops at the same pace. Damage per drop is unchanged.', 'A slightly wider hive drips 10 smaller drops over 3.3s. More ground control, with similar total damage.' ][n-1]:['Apunta un panal pequeño: 6 gotas durante 2,65 s. La miel frena en lugar de encerrar.','El panal dura 3,3 s y suelta 8 gotas al mismo ritmo. No aumenta el daño de cada gota.','Un panal un poco más ancho deja 10 gotas menores durante 3,3 s. Más control del suelo con daño total parecido.'][n-1];
 if(mod.id==='ribbon-duration')return en?`Upgrade only: Ribbon is found in the adventure, never bought or equipped as a starting drink. Lasts ${[13,16,18,20][n-1]} seconds instead of 10; attacks use no ammo. ${['Basic dance and finishers.','Faster turns and one air link.','Two air links, group bind and two aerial dashes.','Wand toss and leg reel finishers; quicker choreography.'][n-1]}`:`Sólo mejora: Ribbon se encuentra en la aventura; no se compra ni se equipa como bebida inicial. Dura ${[13,16,18,20][n-1]} segundos en vez de 10; sus ataques no gastan munición. ${['Danza y remates básicos.','Giros más rápidos y un enlace aéreo.','Dos enlaces aéreos, amarre de grupo y dos dash en el aire.','Remates con lanzamiento de varita y recogida con la pierna; coreografía más rápida.'][n-1]}`;
 if(mod.id==='spring-boots')return en?'Stomp a small enemy to bounce high and recover your air jumps. Chain stomps; spikes and machinery remain dangerous.':'Caer sobre un enemigo pequeño te impulsa y recupera tus saltos aéreos. Encadena rebotes; pinchos y maquinaria siguen siendo peligrosos.';
 if(mod.id==='starter-6')return en?['A 6s spring with 3 jumps. Cherries bounce off its sides or top from level I.','Place two springs at once to create a route. Each retains its own 3 jumps.','Keep two springs; cherries bounce 25% faster upwards for higher arcs.'][n-1]:['Un trampolín de 6 s con 3 saltos. Las cerezas rebotan al tocar sus lados o su parte superior desde el nivel I.','Coloca dos trampolines a la vez para crear una ruta. Cada uno conserva sus 3 saltos.','Mantén dos trampolines; las cerezas salen hacia arriba un 25% más rápido para alcanzar más altura.'][n-1];
 if(mod.id==='starter-9')return en?['Hold the beam to build damage; brief taps still consume ammo.','The beam starts dealing damage after 0.28s instead of 0.34s. Maximum damage stays the same.','Longer beam and charged discharge. Electricity branches through every connected enemy in the nearby group; solid walls stop it.'][n-1]:['Sostén el rayo para acumular daño; los toques breves también consumen munición.','El rayo comienza a dañar a los 0,28 s en vez de 0,34 s. Conserva el daño máximo.','Más alcance del rayo y de la descarga cargada. La electricidad se ramifica por todos los enemigos conectados del grupo cercano; las paredes la detienen.'][n-1];
 if(mod.id==='starter-11')return en?['Three satellites protect you for 4.2s. Each stops one projectile or strikes once.','Satellites last 5s. Press strong again to launch the survivors along your aim, trading protection for a volley.','Four smaller satellites and a wider aimed volley. Same total damage; launching consumes the remaining shield.'][n-1]:['Tres satélites te protegen durante 4,2 s. Cada uno detiene un proyectil o golpea una vez.','Duran 5 s. Pulsa fuerte otra vez para lanzar los que queden hacia donde apuntas, cambiando defensa por ataque.','Cuatro satélites menores y una descarga dirigida más amplia. Mismo daño total; al lanzarlos pierdes la protección restante.'][n-1];
 if(mod.id==='enchanted-coaster')return en?'B / L3 places a platform beneath you in the air for 1.6s. It cracks before fading. Touch real ground to use it again.':'B / L3 crea una plataforma bajo tus pies en el aire durante 1,6 s. Se agrieta antes de desaparecer. Toca suelo firme para volver a usarla.';
 if(mod.id==='double-pocket')return en?'Carry two flavors, each with its own ammo. Q / R3 swaps them. A third flavor replaces the active can.':'Guarda dos sabores con su propia munición. Q / R3 los intercambia. Un tercer sabor sustituye la lata activa.';
 if(mod.id==='confetti-step')return en?`Rolling leaves a paper decoy for ${(1.3+n*.3).toFixed(1)}s. It distracts nearby small clowns and tears on impact. Recharges in ${(5.4-n*.6).toFixed(1)}s.`:`Rodar deja un señuelo de papel durante ${(1.3+n*.3).toFixed(1)}s. Distrae a payasos pequeños cercanos y se rompe al recibir un golpe. Recarga: ${(5.4-n*.6).toFixed(1)}s.`;
 if(mod.id==='reply-bell')return en?`Raise the shield within ${100+n*30}ms of a hit to return one moving projectile. No flames or explosions. Bell recharges in 0.65s.`:`Levanta el escudo en los ${100+n*30}ms previos al impacto para devolver un proyectil móvil. No devuelve llamaradas ni explosiones. Recarga de campanilla: 0,65s.`;
 if(mod.id==='lasting-magic')return en?`The Original lasts ${[10,12,14,15][n-1]} seconds.`:`La Original dura ${[10,12,14,15][n-1]} segundos.`;
 if(mod.id==='gentle-guard')return en?`The held shield uses ${n*5}% less magic, including blocked hits.`:`El escudo sostenido consume ${n*5}% menos magia, también al bloquear golpes.`;
 if(mod.id==='quick-cast')return en?`Cast ${10+n*10}% faster.`:`Dispara un ${10+n*10}% más rápido.`;
 if(mod.id==='bright-spark'||mod.id==='grand-flourish'){const strong=mod.id==='grand-flourish';return en?`${strong?'Strong':'Normal'} projectiles are ${20+n*10}% larger.`:`Proyectiles ${strong?'fuertes':'normales'} un ${20+n*10}% más grandes.`;}
 if(mod.id==='encore-pocket')return en?`A second super charge; recharges in ${44-n*4}s. Still needs 90 magic.`:`Una segunda carga de súper; se recarga en ${44-n*4}s. Requiere 90 de magia.`;
 if(mod.id==='full-bubble')return en?`Every shield fills all 3 slots. ${(0.3+n*.3).toFixed(1)}s of protection after a shield absorbs a hit.`:`Cada burbuja llena los 3 espacios. ${(0.3+n*.3).toFixed(1)}s de protección tras absorber un golpe.`;
 return en?`Start with this flavor and ${1.5+n*.5}× capacity. Unlock a second drink slot to carry two flavors.`:`Empieza con este sabor y ${1.5+n*.5}× de reserva. Amplía Bebidas para llevar dos sabores.`;
}
export const superCapacity=s=>hasMod(s,'encore-pocket')?2:1;
export function updateMods(s,ids,levels=s.modLevels,slots=s.modCategorySlots||s.modSlots||1){
 if(s.ribbonDance){withRibbonLoadout(s,()=>updateMods(s,ids,levels,slots));s.ribbonDance.level=Math.max(1,modLevel(s,'ribbon-duration'));return;}
 const hadExtra=superCapacity(s)===2,previousReserve=ammoReserve(s);s.modCategorySlots=categorySlots(typeof slots==='object'?slots:null,typeof slots==='number'?slots:1,ids);s.mods=equippedMods(ids,validMods(ids),s.modCategorySlots);s.modLevels=validModLevels(levels,validMods([...Object.keys(levels||{}),...s.mods]));
 const reserve=ammoReserve(s);
 // Keep the exact unmodified capacity, including rounding, across equipment changes.
 if(reserve!==previousReserve){
  if(s.weapon>=0&&s.ammoCapacity){s.ammoBaseCapacity??=Math.ceil(s.ammoCapacity/previousReserve);s.ammoCapacity=Math.floor(s.ammoBaseCapacity*reserve);s.ammo=Math.min(s.ammo,s.ammoCapacity);}
  if(s.spareDrink){const q=s.spareDrink;q.baseCapacity??=Math.ceil(q.capacity/previousReserve);q.capacity=Math.floor(q.baseCapacity*reserve);q.ammo=Math.min(q.ammo,q.capacity);}
 }
 // Only the initial loadout starts with a full reserve. Unequipping/re-equipping
 // cannot manufacture charges; a newly fitted pocket must recharge normally.
 if(superCapacity(s)===2){if(!hadExtra){s.superReserve=0;s.reserveCooldown=reserveRecharge(s);}else s.reserveCooldown=Math.min(s.reserveCooldown,reserveRecharge(s));}
 else if(hadExtra){s.superReserve=0;s.reserveCooldown=40;}
}
