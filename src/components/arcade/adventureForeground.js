// Sparse landmarks in world space, never a repeating screen-wide border.
export const MEADOW_FOREGROUND=[
 {x:1050,frame:0,w:275,h:210,depth:1.12},
 {x:2970,frame:1,w:335,h:245,depth:1.18},
 {x:5150,frame:2,w:310,h:195,depth:1.1},
 {x:7520,frame:0,w:285,h:220,depth:1.15,flip:true},
 {x:9570,frame:3,w:255,h:230,depth:1.18},
 {x:11120,frame:2,w:310,h:200,depth:1.12,flip:true},
];
export function foregroundPlacement(q,camera){
 const zoom=camera.zoom||1;
 return {x:480+(q.x-camera.x-480/zoom)*q.depth*zoom,w:q.w*zoom,h:q.h*zoom};
}
