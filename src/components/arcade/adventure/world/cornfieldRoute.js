// A continuous lower trail and optional upper routes: missing a jump never
// forces a restart. Rest clearings separate the denser ambush encounters.
export function buildCornfield(s){
 const floor=(x,y,w)=>({x,y,w,h:28,kind:'earth'});
 const wood=(x,y,w,extra={})=>({x,y,w,h:25,kind:'act-two',art:5,material:'wood',...extra});
 const bale=(x,y,w=125,h=90)=>wood(x,y,w,{art:1,solid:true,h,hp:14});
 s.width=15600;s.arena={left:13760,right:15600,entry:13960,y:480};
 s.boss=[14820,480];s.exit=[15520,480];s.bossHealth=208;
 s.subtitle=['Cruza los secaderos y escucha las hileras: algo se mueve entre el maíz.','Cross the drying sheds and listen to the rows: something moves inside the corn.'];
 s.tip=['Las hojas agitadas anuncian una emboscada. Durante la transformación, rompe los montones de paja.','Rustling leaves announce an ambush. Break the straw piles during the transformation.'];
 s.platforms=[floor(0,480,7600),{...floor(7600,480,350),yEnd:550},floor(7950,550,1500),{...floor(9450,550,350),yEnd:480},floor(9800,480,5800),
  bale(1050,390),wood(1260,300,310,{cornShed:true}),wood(1710,380,180),
  bale(2960,380,145,100),wood(3180,280,360,{cornShed:true}),wood(3690,360,240),
  bale(5010,390),wood(5230,290,360,{cornShed:true}),wood(5720,210,250),wood(6100,290,310,{cornShed:true}),wood(6540,380,220),
  wood(7720,425,240),wood(8110,340,250),wood(8490,340,400,{cornShed:true}),wood(9010,420,260),
  bale(10080,390),wood(10300,290,370,{cornShed:true}),wood(10820,370,220),
  bale(11870,380,145,100),wood(12090,275,400,{cornShed:true}),wood(12620,360,220)];
 s.route=s.platforms.filter(q=>q.kind==='earth');
 s.enemies=[[850,480,29],[1480,300,29],[2290,480,25],[3440,280,29],[4080,320,32],
  [4610,480,29],[5500,290,29],[5910,210,25],[6380,285,26],[7160,480,25],
  [8040,550,29],[8640,340,29],[9320,550,25],[10480,290,29],[11160,320,32],
  [11640,480,25],[12320,275,29],[12840,320,26],[13340,480,29]];
 // The trigger is before the plants. Spawns stay in front of a player running
 // at full speed, and emerge for .8s before any attack can begin.
 s.ambushes=[
  {x:2180,enemies:[[2440,480,29],[2670,480,29]]},
  {x:3850,enemies:[[4150,480,29],[4420,480,25]]},
  {x:6860,enemies:[[7160,480,29],[7420,330,32]]},
  {x:8210,enemies:[[8530,550,29],[8790,550,29]]},
  {x:10950,enemies:[[11270,480,25],[11520,480,29]]},
  {x:12880,enemies:[[13200,480,29],[13460,335,32]]}];
 s.cornBeds=[{left:1960,right:4700},{left:6770,right:7520},{left:7810,right:9640},{left:10890,right:13580}];
 s.cornDecor=[{x:670,prop:4,w:330,h:150},{x:1890,prop:4,w:260,h:130},{x:4800,prop:4,w:330,h:150},{x:6720,prop:4,w:280,h:145},{x:9910,prop:4,w:280,h:140},{x:13620,prop:4,w:300,h:145},{x:15340,prop:4,w:280,h:140}];
 s.cages=[[3410,280],[5860,210],[12300,275]];
 s.checkpoints=[[1940,480],[4780,480],[7490,480],[9890,480],[13600,480]];s.checkpoint=s.checkpoints[0];
 s.shop={x:390,y:480};
 s.supplies=[{x:620,y:452,kind:13},{x:4780,y:452,kind:9},{x:7550,y:452,kind:1},{x:9880,y:452,kind:0},{x:13610,y:452,kind:13}].map(q=>({...q,fixed:true,loot:{type:'drink',kind:q.kind}}));
 s.stars=[];
 for(let x=700;x<13600;x+=180)s.stars.push([x,x>=7600&&x<9800?508:438]);
 for(const q of s.platforms.filter(q=>!q.solid&&q.kind==='act-two'))for(let x=q.x+50;x<q.x+q.w-20;x+=85)s.stars.push([x,q.y-40]);
 s.sections=[{x:0,name:['Los últimos caminos','The last farm roads']},{x:1960,name:['Dentro del maizal','Into the corn']},{x:4780,name:['Los secaderos del ocaso','The sunset drying sheds']},{x:7600,name:['La hondonada de las hojas','The rustling hollow']},{x:10300,name:['Donde camina la cosecha','Where the harvest walks']},{x:13760,name:s.bossName}];
 return s;
}
