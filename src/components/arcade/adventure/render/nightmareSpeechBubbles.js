import {nightmareClashRemaining} from '../engine/nightmarePowerClash';
export function nightmareClashSpeech(q,en=false){
 if(q.state==='hexy-boost')return{boss:false,lines:[en?'DOUBLE ENCORE!':'¡ENCORE DOBLE!']};
 if(q.state==='boss-boost'||q.bossBoost&&!q.hexyBoost&&(q.surgeAge||0)<1.3)return{boss:true,lines:en?['YOU WILL BE','MY CANDY!']:['¡SERÁS','MI DULCE!']};
 if(q.hexyBoost&&q.state==='contest'&&(q.age<1.25||q.finalSurgeAge<1.2))return{boss:true,lines:en?['MORE MAGIC?!']:['¿¡MÁS MAGIA!?']};
 if(q.state==='contest'&&q.contestAge<1.5)return{boss:true,lines:en?['WHAT A SWEET','TREAT!']:['¡QUÉ DULCE','VAS A SER!']};
 return null;
}
export function nightmareBubbleLayout(s,speech){
 const right=speech.boss?s.boss.x>s.player.x:s.player.x>s.boss.x,w=speech.boss?250:226,h=w*320/512;
 const closeup=s.powerClash.state==='boss-boost'&&s.powerClash.age<1.25;
 if(speech.boss&&closeup)return{x:520,y:105,w:310,h:194,tip:{x:830,y:105},right:true};
 return speech.boss?{x:right?585:125,y:62,w,h,tip:{x:right?835:125,y:62},right}: {x:right?490:200,y:285,w,h,tip:{x:right?716:200,y:426},right};
}
export function drawNightmareClashSpeech(c,s,en,reduced,art){
 const q=s.powerClash,speech=nightmareClashSpeech(q,en);c.save();c.textAlign='center';c.font='bold 13px sans-serif';c.lineWidth=3;c.strokeStyle='#160c22';c.fillStyle='#fff4b6';const timer=nightmareClashRemaining(q).toFixed(1)+' s';c.strokeText(timer,480,72);c.fillText(timer,480,72);
 if(!speech){c.restore();return;}
 const p=nightmareBubbleLayout(s,speech),img=art?.['nightmare-speech-balloons'],frame=speech.boss?q.state==='boss-boost'&&q.bossReleased?1:0:2;
 const forward=speech.boss?p.right:!p.right;
 if(img){c.save();c.translate(p.x+(!forward?p.w:0),p.y);c.scale(forward?1:-1,1);c.drawImage(img,frame%2*512,Math.floor(frame/2)*320,512,320,0,0,p.w,p.h);c.restore();}
 const textX=p.x+p.w*(speech.boss?(p.right?.41:.59):(p.right?.42:.58));
 c.fillStyle='#32192c';c.font='900 17px "Trebuchet MS", sans-serif';speech.lines.forEach((line,i)=>c.fillText(line,textX,p.y+p.h*(speech.boss?.66:.4)+(i-(speech.lines.length-1)/2)*22,p.w*.66));c.restore();
}
