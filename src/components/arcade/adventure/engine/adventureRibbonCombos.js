// One guide shared by the shop, demo selector and combat readout. X/Y are
// gamepad names; keyboard equivalents are Z/C. A comma always means a tap.
export const RIBBON_CHAINS={xyxy:'sky-dance',yxyx:'wand-toss',xxyy:'reel-slam',yyxx:'sweep'};
export const RIBBON_GUIDE=[
 {id:'light',pad:'X',keys:'Z',name:['Latigazo','Ribbon lash'],tip:['Un toque, un golpe.','One tap, one strike.']},
 {id:'launch',pad:'X → Y',keys:'Z → C',name:['Elevación','Launcher'],tip:['Lanza al payaso; salta para seguirlo.','Launch a clown; jump to follow.']},
 {id:'airbind',pad:'A → Y',keys:'Espacio → C',name:['Amarre aéreo','Aerial bind'],tip:['Y en el aire: ata y estrella contra el suelo.','Y in the air: bind and slam.']},
 {id:'bind',pad:'X → X → Y',keys:'Z → Z → C',name:['Lazo','Snare'],tip:['Envuelve a los payasos alcanzados.','Wrap the clowns you strike.']},
 {id:'pull',pad:'Mantén X → suelta',keys:'Mantén Z → suelta',name:['Tirón cargado','Charged pull'],tip:['Medio segundo de carga para atraer.','Hold half a second, release to pull.']},
 {id:'burst',pad:'Mantén Y → suelta',keys:'Mantén C → suelta',name:['Pirueta cargada','Charged pirouette'],tip:['Medio segundo de carga; barre a ambos lados.','Hold half a second, release to sweep both sides.']},
 {id:'sky-dance',pad:'X → Y → X → Y',keys:'Z → C → Z → C',name:['Danza ascendente','Rising dance'],tip:['Eleva, enlaza y remata. Con salto, amarre aéreo.','Launch, link and slam. Jump for an aerial bind.']},
 {id:'wand-toss',pad:'Y → X → Y → X',keys:'C → Z → C → Z',name:['Varita viajera','Travelling wand'],tip:['Eleva y aleja. En IV, lanza y recupera la varita.','Launch then repel. At IV, toss and catch the wand.']},
 {id:'reel-slam',pad:'X → X → Y → Y',keys:'Z → Z → C → C',name:['Recogida','Reel-in'],tip:['Ata y remata. En IV, recoge con la pierna.','Bind and slam. At IV, reel in with a leg turn.']},
 {id:'sweep',pad:'Y → Y → X → X',keys:'C → C → Z → Z',name:['Salida en espiral','Spiral exit'],tip:['Termina con un giro que aparta enemigos.','Finish with a turn that pushes enemies away.']},
];
export function ribbonSequence(s,key){
 const p=s.player;
 if(s.time>(p.ribbonSequenceUntil||0))p.ribbonSequence='';
 p.ribbonSequence=((p.ribbonSequence||'')+key).slice(-4);p.ribbonSequenceUntil=s.time+1.45;
 const result=RIBBON_CHAINS[p.ribbonSequence];
 if(result){p.ribbonCompleted=p.ribbonSequence;p.ribbonSequence='';}
 return result;
}
export const ribbonMoveName=(id,en=false)=>RIBBON_GUIDE.find(q=>q.id===id)?.name[en?1:0]||({push:en?'Push':'Empuje',slam:en?'Slam':'Remate',double:en?'Double lash':'Doble latigazo'}[id])||'';
