export function drawPlacement(c,s,art,en=false){
 const q=s.placement;if(!q?.platform)return;
 const color=q.valid?(q.kind===6?'#ff8bc4':'#ffd36a'):'#ff6868',p=s.player;
 c.save();c.strokeStyle=color;c.fillStyle=color;c.lineWidth=2;c.setLineDash([7,6]);
 const img=art[q.kind===6?'jelly-fx':'honey-fx'];if(img){c.globalAlpha=.4;const w=q.kind===6?118:96,h=q.kind===6?100:92;c.drawImage(img,0,img.height/3,img.width/4,img.height/3,q.x-w/2,q.y-h*(q.kind===6?.86:.5),w,h);c.globalAlpha=1;}
 c.beginPath();c.moveTo(p.x,p.y-38);c.quadraticCurveTo((p.x+q.x)/2,Math.min(p.y,q.y)-115,q.x,q.y-12);c.stroke();
 c.setLineDash([]);c.globalAlpha=.2;c.beginPath();c.ellipse(q.x,q.floor-3,q.kind===6?50:72,9,0,0,Math.PI*2);c.fill();c.globalAlpha=.9;c.stroke();
 c.beginPath();c.moveTo(q.x-12,q.y-12);c.lineTo(q.x+12,q.y-12);c.moveTo(q.x,q.y-24);c.lineTo(q.x,q.y);c.stroke();
 if(!s.trial&&!s.tutorial){c.restore();return;}
 c.font='bold 13px sans-serif';c.textAlign='center';c.fillStyle='#fff5da';c.strokeStyle='#27162e';c.lineWidth=4;
 const label=en?'Arrows: aim · release C · V: cancel':q.kind===6?'← → Colocar · suelta C · V cancela':'Flechas: posición y altura · suelta C · V cancela';
 const y=q.y-(q.kind===6?124:74),width=c.measureText(label).width+16;c.fillStyle='#26162de6';c.fillRect(q.x-width/2,y-16,width,23);c.fillStyle='#fff5da';c.fillText(label,q.x,y);c.restore();
}
export function drawSpringBounce(c,q){
 c.save();c.globalAlpha=Math.max(0,q.life/.35);c.strokeStyle='#ffe8a3';c.lineWidth=3;
 for(const dx of [-10,10]){c.beginPath();for(let i=0;i<13;i++){const x=q.x+dx+Math.sin(i*Math.PI/2)*5,y=q.y+i*1.5-q.age*42;i?c.lineTo(x,y):c.moveTo(x,y);}c.stroke();}c.restore();
}
