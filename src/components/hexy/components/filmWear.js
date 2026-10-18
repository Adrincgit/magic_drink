// Sparse emulsion dust and short scratches. This never moves the game image.
export function createFilmWear(canvas){
 const c=canvas.getContext('2d');let frame=0,raf=0,last=0,enabled=false,reduced=true,strength=0,disposed=false;
 function draw(){
  const w=canvas.width,h=canvas.height;c.clearRect(0,0,w,h);
  const random=i=>{const n=Math.sin(i*127.1+frame*31.7)*43758.5453;return n-Math.floor(n);};frame++;
  for(let i=0;i<Math.round(strength*23);i++){
   const x=random(i*5)*w,y=random(i*5+1)*h,r=.5+random(i*5+2)*1.7;
   c.fillStyle=i%3?'rgba(22,14,24,.32)':'rgba(255,240,207,.24)';c.beginPath();c.ellipse(x,y,r,r*(.35+random(i*5+3)),random(i),0,Math.PI*2);c.fill();
  }
  if(random(97)>.72){const x=random(98)*w,y=random(99)*h;c.strokeStyle='rgba(255,238,211,.18)';c.lineWidth=.65;c.beginPath();c.moveTo(x,y);c.lineTo(x+random(100)*1.4,y+h*(.07+random(101)*.25));c.stroke();}
 }
 function tick(now){if(now-last>1000/12){draw();last=now;}raf=requestAnimationFrame(tick);}
 function sync(){cancelAnimationFrame(raf);const active=enabled&&strength>0&&!document.hidden&&!disposed;canvas.dataset.filmState=active?(reduced?'still':'running'):'paused';c.clearRect(0,0,canvas.width,canvas.height);if(active){draw();if(!reduced){last=performance.now();raf=requestAnimationFrame(tick);}}}
 const resize=()=>{canvas.width=Math.max(1,Math.min(1280,canvas.clientWidth));canvas.height=Math.max(1,Math.round(canvas.width*(canvas.clientHeight/Math.max(1,canvas.clientWidth))));sync();};
 const observer=new ResizeObserver(resize);observer.observe(canvas);document.addEventListener('visibilitychange',sync);
 return{update(options){enabled=options.enabled;reduced=options.reduced;strength=options.strength;resize();},dispose(){disposed=true;cancelAnimationFrame(raf);observer.disconnect();document.removeEventListener('visibilitychange',sync);}};
}
