export const FINISH_DEFAULTS={enabled:true,chromatic:55,grain:50,vignette:50,monochrome:false,vintage:false,vintageStrength:65,filmWear:0,filmTitles:true};
export function normalizeFinish(value){
 const monochrome=value?.monochrome===true;
 return{
  enabled:typeof value?.enabled==='boolean'?value.enabled:FINISH_DEFAULTS.enabled,
  monochrome,vintage:!monochrome&&value?.vintage===true,
  filmTitles:typeof value?.filmTitles==='boolean'?value.filmTitles:FINISH_DEFAULTS.filmTitles,
  ...Object.fromEntries(['chromatic','grain','vignette','vintageStrength','filmWear'].map(name=>[name,typeof value?.[name]==='number'&&Number.isFinite(value[name])?Math.max(0,Math.min(100,value[name])):FINISH_DEFAULTS[name]])),
 };
}
export function updateFinishState(previous,patch){
 const next={...previous,...patch};
 if(patch.vintage===true)next.monochrome=false;
 else if(patch.monochrome===true)next.vintage=false;
 return normalizeFinish(next);
}
// Faded dye, gently lifted lavender shadows and warm paper whites.
export function vintageColorMatrix(amount=0){
 const t=Math.max(0,Math.min(1,amount)),identity=[1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0];
 const dye=[.81,.12,.05,0,.045,.055,.82,.05,0,.025,.08,.10,.68,0,.07,0,0,0,1,0];
 return identity.map((n,i)=>n+(dye[i]-n)*t).join(' ');
}
