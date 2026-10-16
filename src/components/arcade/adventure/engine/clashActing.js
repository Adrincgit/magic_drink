const clamp=n=>Math.max(0,Math.min(1,n));
// Pure selectors shared by the portraits and the actual playable drawings.
export function clashPortraitFrames(q){
 const p=q.pressure??.5;
 return{hexy:q.won===true?3:p<.18?2:p<.43?1:p>.55?3:0,
  boss:q.won===false||q.won!==true&&p<.5?3:p>.8?1:(q.wave||0)>.3||p>.56?2:0};
}
export function castingWindFrame(time,reduced=false){return reduced?0:[0,1,2,1][Math.floor(time*18)%4];}
export function chargingWindFrame(time,reduced=false){return reduced?0:Math.floor(time*12)%6;}
// Keep the original planted casting motion while winning. Only its middle
// drawing needed a closed mouth; the grin never cycles through a shout.
export function clashCastingFrame(q,boss,time,reduced=false){
 if(boss&&clashPortraitFrames(q).boss===3)return reduced?0:[0,1,2,1][Math.floor(time*12)%4];
 return castingWindFrame(time,reduced);
}
export function clashPortraitSprite(q,boss,time,reduced=false){
 const row=clashPortraitFrames(q)[boss?'boss':'hexy'],col=clashCastingFrame(q,boss,time,reduced);
 if(boss&&row===3)return{key:'harlequin-clash-grin',cols:3,frame:col};
 return{key:boss?'harlequin-clash-portraits':'hexy-clash-portraits',cols:3,frame:row*3+col};
}
export function clashPortraitCrop(q,boss){
 const pressure=q.portraitPressure??q.pressure??.5,advantage=clamp(Math.abs(pressure-.5)*2);
 const zoom=1+(boss?.48:.52)*advantage*advantage*(3-2*advantage),focusX=boss?160:212;
 // Zoom within the existing panel, around the face. The ray corridor and
 // the actual actors stay unobscured, including when they exchange sides.
 // Anchor the zoom at the top of the complete hat, not at eye level. The
 // face moves down within the panel as it grows; the hat never hits a crop.
 // The Harlequin's extended hand stays in frame along with his face and bell:
 // the portrait must keep showing him pushing the spell, even while winning.
 return{x:focusX*(1-1/zoom),y:0,w:384/zoom,h:276/zoom,zoom};
}
export function clashPressureWave(age,gentle=false){
 // Deliberately uneven phrases: the lull can be used to recover lost ground.
 const starts=gentle?[3.1,8.2,12.4]:[2.3,5.5,9.2,12.1],duration=gentle?1.15:1.45;
 let wave=0;
 for(const start of starts){const t=(age-start)/duration;if(t>0&&t<1)wave=Math.max(wave,Math.sin(t*Math.PI)**2);}
 return wave;
}
export function clashResistance(age,gentle=false){return(gentle?.076:.105)+clashPressureWave(age,gentle)*(gentle?.105:.175);}
export function opponentLight(q,boss=false){return clamp((boss?q.pressure-.5:.5-q.pressure)*2.4);}
