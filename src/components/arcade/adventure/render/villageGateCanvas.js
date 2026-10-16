import {groundY} from '../world/adventureTerrain';

export function villageGatePlacement(s){
 const x=s.level.entrance.x,y=groundY(s.level.route,x),origin=s.camera.x-(x-300);
 return{near:{x:x-35-origin*.14,y:y+185,h:660},far:{x:x+248,y:y-62,h:215}};
}
export function drawVillageGate(c,s,art,front=false){
 const q=villageGatePlacement(s)[front?'near':'far'],img=art[front?'village-pillar-near-v6':'village-pillar-far-v6'],w=q.h*img.width/img.height;
 if(q.x+w/2<s.camera.x-60||q.x-w/2>s.camera.x+1060)return;
 c.save();c.filter=front?'blur(2.4px) brightness(.72) saturate(.62)':'brightness(.82) saturate(.68)';
 c.drawImage(img,q.x-w/2,q.y-q.h,w,q.h);
 if(front){c.translate(q.x-w*.28,q.y-q.h*.54);c.rotate(.04);c.fillStyle='#e9cea0';c.font='bold 11px Georgia';c.textAlign='center';c.fillText('VILLA',0,0);c.fillText('LUMBRE',0,13);}
 c.restore();
}
