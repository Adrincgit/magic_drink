export function shapeGrandRing(level){
 Object.assign(level,{name:['La carpa del Gran Telón','The Grand Curtain'],bossName:['Arlequín del Gran Telón','Harlequin of the Grand Curtain'],
  subtitle:['El fuerte ha caído. Tras los bastidores, el Arlequín reclama la pista del Gran Telón.','The fort has fallen. Beyond the wings, the Harlequin claims the Grand Curtain ring.'],
  chapter:'1-5',groundRoute:true,grandRing:true,bossOnly:true,themeStart:true,cameraFloor:440,width:4560,
  arena:{left:700,right:3540,y:480,entry:1380,throwMargin:780},boss:[2760,480],exit:[3770,480],sky:['#211d2c','#51343c'],
  spawn:[660,480],shop:{x:940,y:480},

  platforms:[{x:-1400,y:480,w:1400,h:24,kind:'earth'},{x:0,y:480,w:1240,h:24,kind:'earth'},{x:1240,y:480,w:3320,h:24,kind:'earth'}],
  enemies:[],cages:[],hazards:[],outposts:[],scenery:[],stars:[[640,440],[685,415],[730,440]],
  checkpoint:null,checkpoints:[],supplies:[{x:1150,y:452,kind:2}],pickups:[],
  sections:[{x:-1400,name:['A las puertas del Gran Telón','At the Grand Curtain']},{x:0,name:['Entre bastidores','Backstage']},{x:1240,name:['La primera gran función','The first grand performance']}]});
}
