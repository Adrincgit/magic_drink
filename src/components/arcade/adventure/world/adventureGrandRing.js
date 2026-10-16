export function shapeGrandRing(level){
 Object.assign(level,{name:['La carpa del Gran Telón','The Grand Curtain'],bossName:['Arlequín del Gran Telón','Harlequin of the Grand Curtain'],
  subtitle:['El fuerte ha caído. Cruza las carpas del bosque consumido y alcanza el Gran Telón.','The fort has fallen. Cross the tents in the burned forest and reach the Grand Curtain.'],
  chapter:'1-5',groundRoute:true,grandRing:true,circusCamp:true,bossOnly:false,themeStart:true,cameraFloor:440,width:4560,
  arena:{left:700,right:3540,y:480,entry:1380,throwMargin:780},boss:[2760,480],exit:[3770,480],sky:['#211d2c','#51343c'],
  spawn:[-12120,480],shop:null,drinkPool:[5,1,2,3,4],
  circusEntrance:{left:-12300,doorX:-140,trigger:-235,insideX:660,arrivalX:-12120,floor:480,width:2850,height:950,doorFraction:.083,side:true},

  platforms:[{x:-12300,y:480,w:12300,h:24,kind:'earth'},{x:0,y:480,w:1240,h:24,kind:'earth'},{x:1240,y:480,w:3320,h:24,kind:'earth'}],
  // Finite squads emerge from their actual curtain openings. Clearings give
  // each encounter room to breathe; the final forecourt is a safe rest.
  campTents:[
   {x:-11250,w:390,crew:[0,0]},{x:-9860,w:430,crew:[14,1]},
   {x:-8460,w:420,crew:[0,3,14]},{x:-7110,w:460,crew:[1,0]},
   {x:-5710,w:430,crew:[0,1,0]},{x:-4370,w:470,crew:[3,0]},
   {x:-2980,w:440,crew:[0,1,0]},{x:-1730,w:490,crew:[0,3]}
  ],
  enemies:[],cages:[],hazards:[],outposts:[],scenery:[],
  stars:Array.from({length:55},(_,i)=>[-11850+i*200,435-(i%3===1?20:0)]),treasurePositions:[-11550,-9220,-6560,-3830,-1050],
  // Relocate the first edition's 28 coins without losing their save receipts.
  starIds:Array.from({length:28},(_,i)=>`3:star:${-5000+i*155}:${435-(i%3===1?20:0)}`),
  checkpoint:null,checkpoints:[[-7640,480],[-3640,480],[-820,480]],supplies:[{x:-11930,y:452,kind:5,fixed:true,loot:{type:'drink',kind:5}},{x:-9090,y:452,fixed:true,loot:{type:'ammo'}},{x:-6400,y:452,kind:2,fixed:true},{x:-3860,y:452,fixed:true,loot:{type:'ammo'}},{x:-610,y:452,fixed:true,loot:{type:'fullheal'},preview:'fullheal'}],pickups:[],
  sections:[{x:-12300,name:['El campamento de ceniza','The ash camp']},{x:-7550,name:['Las carpas de la retaguardia','The rear encampment']},{x:-3900,name:['La guardia del Gran Telón','The Grand Curtain guard']},{x:-950,name:['A las puertas del Gran Telón','At the Grand Curtain']},{x:0,name:['Entre bastidores','Backstage']},{x:1240,name:['La primera gran función','The first grand performance']}]});
}
