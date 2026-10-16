const clamp=t=>Math.max(0,Math.min(.999,t));
export function ribbonFrame(t,strong=false,combo=0){
 t=clamp(t);
 if(strong){const ends=[.12,.25,.38,.45,.57,.71,.85,1];return 8+ends.findIndex(end=>t<end);}
 return (combo?4:0)+(t<.23?0:t<.36?1:t<.68?2:3);
}
export const ribbonContact=(t,strong)=>strong?t>=.45&&t<.68:t>=.23&&t<.68;
