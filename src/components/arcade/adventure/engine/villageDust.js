// Match the country-to-cobbles transition painted by drawVillageRoad.
const soilAt=x=>1-Math.max(0,Math.min(1,(x-6150)/900));
function puff(s,x,y,size,kind){
 if(x<s.camera.x-200||x>s.camera.x+1200)return;
 const soil=soilAt(x),dust=s.villageDust??=[];
 dust.push({x,y,originX:x,originY:y,age:0,life:.38+soil*.12,size:size*(.72+soil*.28),opacity:.22+soil*.28,vx:16+soil*13,vy:-5-soil*4,kind});
 if(dust.length>96)dust.splice(0,dust.length-96);
}
export function stepVillageDust(s,dt){
 s.villageDust=(s.villageDust||[]).filter(q=>{q.age+=dt;q.x+=q.vx*dt;q.y+=q.vy*dt;return q.age<q.life;});
}
export function villageFootDust(s,q,oldAge,profile,floor){
 // Two planted poses in each eight-pose cycle; advance only with real travel.
 if(q.blocked||Math.abs(q.y-floor)>5||q.runAge<=oldAge)return;
 const a=Math.floor(oldAge/profile.runDuration*8),b=Math.floor(q.runAge/profile.runDuration*8);
 for(let step=a+1;step<=b;step++)if(step%4===1)puff(s,q.x-profile.w*.18,q.y,profile.size*.3,'foot');
}
export function villageCarriageDust(s,q,oldGait,distance){
 // Wheel contact is continuous. Hoof strikes follow the drawn gallop.
 q.dustTravel=(q.dustTravel||0)+distance;
 if(q.dustTravel>=38){q.dustTravel%=38;puff(s,q.x+116,q.y,49,'wheel');}
 const a=Math.floor(oldGait*8),b=Math.floor(q.gait*8);
 for(let step=a+1;step<=b;step++)if(step%2===0)puff(s,q.x-(step%4===0?78:38),q.y,43,'hoof');
}
