export const FORT_SCALE=1.6;
export const FORT_WIDTH=720*FORT_SCALE;
export const FORT_ASSEMBLY={cell:384,width:500,height:500,coreX:205,coreY:229,baseline:376};
export function fortAssemblyRig(s){
 const a=FORT_ASSEMBLY,k=a.width/a.cell;
 return{x:s.boss.x+24*FORT_SCALE-a.coreX*k,y:s.boss.y-a.baseline*k,w:a.width,h:a.height,k};
}
export function fortRig(s){
 const b=s.boss,k=FORT_SCALE;
 return{upper:{x:b.x-190*k,y:b.y-290*k},lower:{x:b.x-255*k,y:b.y-165*k},
  wall:{x:b.x-570,y:b.y-155},gate:{x:b.x+24*k,y:b.y-130},
  core:{x:b.x+24*k,y:b.y-(b.coreOpened?(FORT_ASSEMBLY.baseline-FORT_ASSEMBLY.coreY)*FORT_ASSEMBLY.width/FORT_ASSEMBLY.cell:130)},hatch:{x:b.x+(1120-768)*.75,y:b.y-21},
  doorway:{x:b.x+(980-768)*.75,y:b.y+(640-950)*.75,w:282*.75,h:287*.75}};
}
