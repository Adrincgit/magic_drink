export const RIVER_PLANES=[
 {key:'river-mountains',depth:.045,h:300,bottom:-85,vertical:.06},
 {key:'world1',depth:.145,h:380,bottom:70,vertical:.14},
];
export function riverPlanePlacement(s,img,plane){
 const floor=440-((s.camera.backdropY??s.camera.y)-40)*plane.vertical;
 const w=Math.max(plane.h*img.width/img.height,962+Math.max(0,s.level.width-960)*plane.depth);
 return{x:-s.camera.x*plane.depth,y:floor+plane.bottom-plane.h,w,h:plane.h};
}
export function riverWaterfallPlacement(s,img){
 const p=riverPlanePlacement(s,img,RIVER_PLANES[1]);
 return{x:p.x+p.w*.309,y:p.y+p.h*.374,w:p.w*.025,h:p.h*.281};
}
export const RIVER_WOODLAND=[
 {x:300,key:'river-tree-birch',h:310,depth:.26},
 {x:1580,key:'river-tree-hawthorn',h:355,depth:.42},
 {x:2880,key:'river-tree-oak',h:495,depth:.58},
 {x:4900,key:'river-tree-willow',h:365,depth:.26},
 {x:6020,key:'river-tree-birch',h:430,depth:.42},
 {x:6810,key:'river-tree-hawthorn',h:350,depth:.58},
 {x:9210,key:'river-tree-willow',h:375,depth:.58},
 // Two larger silhouettes frame the arena; no row of exposed root cutouts.
 {x:10620,key:'river-tree-birch',h:560,depth:.58},
 {x:11920,key:'river-tree-willow',h:520,depth:.42},
];
export function riverWoodlandPlacement(s,img,q){
 // Landscape layers share one screen-space elevation channel. Boss zoom is
 // for actors and playable terrain; it cannot scale or lift distant trees.
 const floor=440-((s.camera.backdropY??s.camera.y)-40)*.28;
 const w=q.h*img.width/img.height,x=480+(q.x-s.camera.x-480)*q.depth;
 // The lower 40% stays behind opaque earth, including the native root flare.
 return{x:x-w/2,y:floor+95-q.h*.6,w,h:q.h};
}
