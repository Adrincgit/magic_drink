const clamp=n=>Math.max(0,Math.min(1,n));
// Pure selectors shared by the portraits and the actual playable drawings.
export function clashPortraitFrames(q){
 const p=q.pressure??.5;
 return{hexy:q.won===true?3:p<.18?2:p<.43?1:p>.55?3:0,
  boss:p<=.4?3:p>.8?1:(q.wave||0)>.3||p>.56?2:0};
}
export function castingWindFrame(time,reduced=false){return reduced?0:[0,1,2,1][Math.floor(time*18)%4];}
export function clashPressureWave(age,gentle=false){
 // Deliberately uneven phrases: the lull can be used to recover lost ground.
 const starts=gentle?[3.1,8.2,12.4]:[2.3,5.5,9.2,12.1],duration=gentle?1.15:1.45;
 let wave=0;
 for(const start of starts){const t=(age-start)/duration;if(t>0&&t<1)wave=Math.max(wave,Math.sin(t*Math.PI)**2);}
 return wave;
}
export function clashResistance(age,gentle=false){return(gentle?.076:.105)+clashPressureWave(age,gentle)*(gentle?.105:.175);}
export function opponentLight(q,boss=false){return clamp((boss?q.pressure-.5:.5-q.pressure)*2.4);}
