import {drawWindCloth} from './windClothCanvas';
export function drawTrialTent(c,s,art,reduced=false){
 if(!s.trial)return;const img=art['camp-purple'];if(!img)return;
 const x=s.trial.tentX,w=210,h=w*img.height/img.width;
 c.save();c.globalAlpha=.95;drawWindCloth(c,img,x-w/2,482-h,w,h,s.fxTime,{windArt:art,flags:[[.49,.01,.23,.22]],reduced});
 c.fillStyle='#241d34';c.beginPath();c.ellipse(x,465,26,s.trial.tentOpen>0?49:39,0,Math.PI,0);c.fillRect(x-26,465,52,15);c.fill();
 c.font='bold 11px Georgia';c.textAlign='center';c.fillStyle='#fff0ce';c.fillText('MISO',x,482-h*.72);c.restore();
}
