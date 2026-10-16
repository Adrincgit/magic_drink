import {painted,paintedParticle,energyGlow} from './paintedDuelCanvas';

// The barrel pivots at its rear trunnion; its foot stays bolted to the deck.
export function drawSiegeCannon(c,art,{x,y,width=250,angle=0,shotAge=-1,fire=true,reduced=false}){
 const img=art['barge-cannon'],k=width/513;
 const kick=shotAge>=0&&shotAge<.3&&!reduced?Math.sin(Math.min(1,shotAge/.3)*Math.PI)*13:0;
 c.save();c.translate(x,y);
 c.drawImage(img,220,252,293,67,-145*k,48*k,293*k,67*k);
 c.rotate(angle);c.translate(kick,0);
 // Keep the complete flared lip below y=260; only the rear pedestal stays fixed.
 c.save();c.beginPath();c.moveTo(-365*k,-204*k);c.lineTo(148*k,-204*k);c.lineTo(148*k,52*k);c.lineTo(-155*k,52*k);c.lineTo(-155*k,115*k);c.lineTo(-365*k,115*k);c.closePath();c.clip();
 c.drawImage(img,-365*k,-204*k,513*k,319*k);c.restore();
 const muzzle={x:-326*k,y:-44*k};
 if(shotAge>=0&&shotAge<1.15){
  const u=Math.min(1,shotAge/.42),alpha=Math.pow(1-u,1.2);
  energyGlow(c,fire,muzzle.x-8,muzzle.y,95,alpha*.8);
  if(fire){
   painted(c,art,'fire-show',Math.min(7,1+Math.floor(u*7)),muzzle.x-4,muzzle.y,110+u*60,170+u*100,-Math.PI/2,alpha,.5,.78);
   const smoke=art['impact-smoke'];
   if(smoke)for(let i=0;i<(reduced?2:6);i++){const age=shotAge-i*.035;if(age<0)continue;const t=age/1.15,f=Math.min(7,Math.floor(t*8)),size=85+t*150,side=i%2?1:-1;
    c.save();c.globalAlpha*=Math.min(1,age/.06)*Math.pow(1-t,1.1)*.75;if(i>1)c.filter='brightness(.32) saturate(.25)';
    c.drawImage(smoke,f%4*256,Math.floor(f/4)*256,256,256,muzzle.x-30-t*(95+i*19)-size/2,muzzle.y-size*.55+side*t*65-t*40,size,size);c.restore();}
   for(let i=0;i<(reduced?2:8);i++)paintedParticle(c,art,3,shotAge+i*.1,muzzle.x-u*(65+i*10),muzzle.y+Math.sin(i*13)*u*70,10+(1-u)*8,i,alpha*.8);
  }else{
   const steam=art['harbor-water-details'];
   if(steam)c.drawImage(steam,Math.min(3,Math.floor(u*4))*256,3*256,256,256,muzzle.x-85-u*90,muzzle.y-45,100+u*80,90+u*45);
  }
 }
 c.restore();
}
