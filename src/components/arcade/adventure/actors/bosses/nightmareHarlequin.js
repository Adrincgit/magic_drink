import {beginNightmareUltimate,stepNightmareUltimate,NIGHTMARE_ULTIMATE} from './nightmareUltimate';
export {nightmareCrown} from './nightmareUltimate';
export function stepNightmareHarlequin(s,dt,helpers,stepBase){
 const b=s.boss;
 if(!b.nightmareUltimate){
  stepBase(s,dt,helpers);
  if(b.hp<=0||['sleep','intro','transform','dying','defeated'].includes(b.phase))return;
  if(b.stage!==3)return;
  if(!b.encoreAid){b.encoreAid=true;s.magic=Math.max(s.magic,80);s.superCooldown=0;s.events.push('rescue');}
  b.nightmareCooldown=(b.nightmareCooldown??3.2)-dt;
  if(b.hp>b.maxHp*NIGHTMARE_ULTIMATE.desperateHealth||b.nightmareCooldown>0||!['patrol','recover'].includes(b.phase))return;
  beginNightmareUltimate(s);
 }
 stepNightmareUltimate(s,dt,helpers);
}
