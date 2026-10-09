export function shapeGrandRing(level){
 Object.assign(level,{name:['La carpa del Gran Telón','The Grand Curtain'],bossName:['Arlequín del Gran Telón','Harlequin of the Grand Curtain'],
  subtitle:['Del embarcadero al Gran Telón. Cruza la entrada y descubre quién reclama la pista.','From the wharf to the Grand Curtain. Step inside and discover who claims the ring.'],
  chapter:'1-4',groundRoute:true,grandRing:true,bossOnly:true,themeStart:true,cameraFloor:440,width:4560,
  arena:{left:700,right:3540,y:480,entry:1380,throwMargin:780},boss:[2760,480],exit:[3770,480],sky:['#211d2c','#51343c'],
  spawn:[-1140,480],shop:{x:-850,y:480},
  circusEntrance:{trigger:-230,doorX:-140,floor:480,width:1120,arrivalX:-560,insideX:660,deck:{x:-1400,y:480,w:2500,h:24,kind:'earth',bridge:true}},
  platforms:[{x:-1400,y:480,w:1400,h:24,kind:'earth'},{x:0,y:480,w:1240,h:24,kind:'earth'},{x:1240,y:480,w:3320,h:24,kind:'earth'}],
  enemies:[],cages:[],hazards:[],outposts:[],scenery:[],stars:[[640,440],[685,415],[730,440]],
  checkpoint:null,checkpoints:[],supplies:[{x:970,y:452,kind:2}],pickups:[],
  sections:[{x:-1400,name:['A las puertas del Gran Telón','At the Grand Curtain']},{x:0,name:['Entre bastidores','Backstage']},{x:1240,name:['La primera gran función','The first grand performance']}]});
}
