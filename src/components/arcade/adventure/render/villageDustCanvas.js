export function drawVillageDust(c,s,art,reduced,group='foot'){
 const img=art['zeppelin-dust'];if(!img)return;
 for(const q of s.villageDust||[]){
  if((q.kind==='foot')!==(group==='foot'))continue;
  if(q.x<s.camera.x-100||q.x>s.camera.x+1100)continue;
  const t=q.age/q.life,size=q.size*(.72+t*.6),frame=reduced?0:Math.min(3,Math.floor(t*4));
  c.save();c.globalAlpha=q.opacity*Math.min(1,t/.08)*(1-t)*(reduced?.6:1);
  // Broad and low: these are foot scuffs, not the large original impact cloud.
  c.drawImage(img,frame*256,0,256,256,(reduced?q.originX:q.x)-size/2,(reduced?q.originY:q.y)-size*.47,size,size*.52);c.restore();
 }
}
