const clamp=n=>Math.max(0,Math.min(1,n));
export function duelSide(s,boss=false){return boss?s.boss.x>s.player.x:s.player.x>s.boss.x;}
// Curtains belong to the scene; these narrow pennants belong to each caster.
export function duelPennants(c,right,boss,y=65,bottom=330,widthScale=1){
 c.save();if(right){c.translate(960,0);c.scale(-1,1);}
 for(const [top,w]of [[y,292],[bottom,308]]){
  c.save();c.translate(-16,top);c.rotate(-.08);c.scale(widthScale,widthScale);
  c.beginPath();c.moveTo(0,0);c.lineTo(w,0);c.lineTo(w-18,14);c.lineTo(w,28);c.lineTo(0,28);c.closePath();
  const g=c.createLinearGradient(0,0,w,0);g.addColorStop(0,boss?'#280e19':'#251c4b');g.addColorStop(.7,boss?'#781f28':'#68305e');g.addColorStop(1,boss?'#43141b':'#35234e');c.fillStyle=g;c.fill();c.lineWidth=1.5;c.strokeStyle=boss?'#edb967':'#ffe6a7';c.stroke();
  c.strokeStyle=boss?'#aa5935':'#cf7bab';c.lineWidth=1;c.beginPath();c.moveTo(0,5);c.lineTo(w-28,5);c.stroke();
  // Harlequin diamonds / Hexy's stars remain different even when sides swap.
  c.fillStyle=boss?'#dd9543':'#ffe080';
  for(let j=0;j<3;j++){const x=32+j*84;c.beginPath();for(let k=0;k<(boss?4:10);k++){const angle=-Math.PI/2+k*Math.PI/(boss?2:5),r=boss?6:k%2?3:7;c.lineTo(x+Math.cos(angle)*r,14+Math.sin(angle)*r);}c.closePath();c.fill();}
  c.restore();
 }c.restore();
}
export function drawDuelCharge(c,s,art,boss,reduced=false){
 const u=s.boss.ultimate,clash=s.powerClash;
 if(boss?u?.state!=='charge':clash?.state!=='windup')return false;
 const age=boss?u.age+(clash?.state==='windup'?clash.age:0):clash.age,right=duelSide(s,boss),alpha=clamp(age/.13);
 const enter=reduced?0:(right?1:-1)*330*Math.pow(1-clamp(age/.22),3);
 const img=art[boss?'harlequin-ultimate-portrait':'hexy-encore-portrait'];if(!img)return false;
 c.save();c.translate(enter,0);c.globalAlpha=alpha;duelPennants(c,right,boss);
 const h=300,w=h*img.width/img.height,x=right?950-w:10,y=33;
 const flip=right!==boss;c.translate(x+(flip?w:0),y);if(flip)c.scale(-1,1);
 // Right-facing Hexy and left-facing harlequin mirror only when necessary.
 c.drawImage(img,0,0,w,h);c.restore();return true;
}
