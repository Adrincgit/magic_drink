// One physical journey: fields -> canvas castle -> the upper circus dome.
const floor=(x,y,w,yEnd=y)=>({x,y,w,yEnd,h:28,kind:'earth'});
const gallery=(x,y,w,extra={})=>({x,y,w,h:25,kind:'act-two',art:5,material:'wood',...extra});
export function buildCastleCircus(s){
 Object.assign(s,{width:15200,bossHealth:280,groundRoute:true,cameraFloor:440,castleCircus:true,castleDoor:3450,
  arena:{left:13200,right:15200,entry:13400,y:180},boss:[14420,180],exit:[15120,180],spawn:[90,480],
  name:['El castillo del gran telón','The castle of the great curtain'],bossName:['El Conde y la Condesa del Telón','The Count and Countess of the Curtain'],
  subtitle:['Cruza los jardines, entra al castillo circo y descubre quién dirige el baile.','Cross the gardens, enter the circus castle and discover who conducts the dance.'],
  tip:['El Conde embiste; la Condesa prepara los candelabros. Sus reverencias dejan una apertura.','The Count lunges; the Countess prepares the chandeliers. Their bows leave an opening.']});
 s.platforms=[floor(0,480,3800),floor(3800,480,500,540),floor(4300,540,2300),floor(6600,540,600,440),floor(7200,440,2200),floor(9400,440,600,320),floor(10000,320,2300),floor(12300,320,900,180),floor(13200,180,2000)];
 for(const [x,y,w]of [[800,385,210],[1160,290,230],[1540,195,250],[1960,290,240],[2360,200,240],[2740,110,250],
  [4140,380,250],[4530,280,280],[4960,180,300],[5410,280,260],[5840,390,260],
  [7240,345,230],[7630,245,280],[8060,145,280],[8500,240,260],[8910,340,250],
  [10140,225,250],[10540,125,280],[10960,25,280],[11400,120,280],[11840,220,250]])s.platforms.push(gallery(x,y,Math.max(w,350)));
 for(const [x,y]of [[2060,480],[5700,540],[8640,440],[11920,320]])s.platforms.push(gallery(x,y-95,125,{art:7,h:95,solid:true,hp:24}));
 s.route=s.platforms.filter(q=>q.kind==='earth');
 s.enemies=[[970,480,30],[1610,195,31],[2220,480,31],[2890,300,32],[3080,480,30],
  [4440,540,31],[5070,180,30],[5970,540,30],[6400,350,32],[7440,440,31],[7810,245,30],
  [8420,440,31],[8960,340,30],[10190,320,30],[10840,320,31],[11100,25,30],[11920,160,32],[12620,270,31]];
 s.ambushes=[{x:4660,enemies:[[4990,360,32],[5230,330,32]]},{x:9070,enemies:[[9460,280,32],[9630,240,32]]}];
 s.cages=[[2840,110],[7770,245],[11090,25]];s.checkpoints=[];s.checkpoint=[90,480];s.shop={x:390,y:480};
 s.supplies=[{x:650,y:452,kind:9},{x:6120,y:512,kind:13},{x:9160,y:412,kind:4},{x:13000,y:180,kind:13}].map(q=>({...q,fixed:true,loot:{type:'drink',kind:q.kind}}));
 s.stars=[];for(const q of s.route)for(let x=q.x+90;x<q.x+q.w-30;x+=180)s.stars.push([x,q.y+(q.yEnd-q.y)*(x-q.x)/q.w-42]);
 for(const q of s.platforms.filter(q=>q.kind==='act-two'&&!q.solid))s.stars.push([q.x+65,q.y-42],[q.x+q.w-50,q.y-42]);
 s.sections=[{x:0,name:['Los jardines del castillo circo','The circus castle gardens']},{x:3500,name:['Tras las puertas del telón','Behind the curtain doors']},{x:4800,name:['La galería de las máscaras','The gallery of masks']},{x:7200,name:['El baile sin invitados','The uninvited ball']},{x:10000,name:['Detrás de las paredes','Behind the walls']},{x:13200,name:s.bossName}];
 return s;
}
export function buildNightmareAscent(s){
 Object.assign(s,{width:6700,bossHealth:780,castleCircus:true,openNightmare:true,groundRoute:true,cameraFloor:470,candyWarehouse:{left:0,right:2050},
  arena:{left:2100,right:6400,entry:2290,y:480,throwMargin:1000},spawn:[90,480],boss:[5220,480],exit:[6520,480],
  subtitle:['Sube hasta la cúpula. La última función te está esperando.','Under the dome, the final performance is waiting for you.'],
  tip:['Durante su gran ataque, responde con Encore. Cuando aparezca ENCORE DOBLE, vuelve a pulsar ultimate.','Answer her grand attack with Encore. When DOUBLE ENCORE appears, press ultimate again.']});
 s.platforms=[floor(0,480,2100),floor(2100,480,4600)];s.route=s.platforms;
 s.supplies=[{x:1640,y:452,kind:9,fixed:true,loot:{type:'drink',kind:9}},{x:1960,y:452,kind:13,fixed:true,loot:{type:'drink',kind:13}}];
 s.checkpoints=[];s.checkpoint=[90,480];s.sections=[{x:0,name:['La colección de Halloween','The Halloween collection']},{x:1500,name:['Los dulces de Villa Lumbre','The sweets of Villa Lumbre']},{x:2100,name:s.bossName}];
 return s;
}
